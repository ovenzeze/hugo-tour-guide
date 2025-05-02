import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/supabase'
import type { H3Event } from 'h3'
import { $fetch } from 'ofetch' // Using ofetch which is built into Nuxt
import { getAudioDurationInSeconds } from 'get-audio-duration'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Define DB types
type GuideAudioInsert = Database['public']['Tables']['guide_audios']['Insert']
type GuideTextRow = Database['public']['Tables']['guide_texts']['Row']
type PersonaRow = Database['public']['Tables']['personas']['Row']

// Combine fetched data for clarity
interface TextWithPersona {
    guide_text_id: number;
    transcript: string;
    language?: string;
    museum_id?: number | null;
    gallery_id?: number | null;
    object_id?: number | null;
    persona_id: number;
    personas: {
        persona_id: number;
        name: string;
        voice_model_identifier?: string | null;
    };
}

export default defineEventHandler(async (event: H3Event) => {
    console.log('API Route /api/generate-audio called.');

    const client = await serverSupabaseServiceRole<Database>(event);
    const config = useRuntimeConfig(event); // Access runtime config for API keys etc.
    const storageBucketName = 'guide-voices'; // Ensure this matches your bucket name

    let uploadedFilePath: string | null = null; // To track for cleanup on error

    try {
        // 1. Read and Validate Input Body
        const body = await readBody(event);
        if (!body || typeof body.guide_text_id !== 'number') {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid guide_text_id (must be a number).' });
        }
        const guideTextId: number = body.guide_text_id;
        console.log(`Processing request for guide_text_id: ${guideTextId}`);

        // 2. Fetch Guide Text and Associated Persona
        // 使用 PostgreSQL 查询联接
        const { data: rawData, error: textError } = await client
            .from('guide_texts')
            .select(`
                guide_text_id,
                transcript,
                language,
                museum_id,
                gallery_id,
                object_id,
                persona_id,
                personas:personas (
                    persona_id,
                    name,
                    voice_model_identifier
                )
            `)
            .eq('guide_text_id', guideTextId)
            .single();

        if (textError) {
            console.error('Error fetching guide text/persona:', textError);
            throw createError({ statusCode: 500, statusMessage: `Database error fetching data: ${textError.message}` });
        }

        if (!rawData) {
            throw createError({ statusCode: 404, statusMessage: `Not Found: Guide text with id ${guideTextId} not found.` });
        }

        // 明确解构文本数据和角色数据
        const { personas, ...textData } = rawData;
        const personaRecord = personas as any; // 临时使用 any 类型

        console.log(`Found text: "${textData.transcript.substring(0, 30)}...", Persona: ${personaRecord.name}`);

        // 3. Determine ElevenLabs Parameters
        const elevenlabsApiKey = config.elevenlabsApiKey;
        if (!elevenlabsApiKey) {
            throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error: ElevenLabs API key not found.' });
        }

        const voiceId = body.voice_id || personaRecord.voice_model_identifier; // Use request override or persona default
        if (!voiceId) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Voice ID is required either in request body or set on the Persona.' });
        }
        // Use request model override, then config default, then hardcoded default
        const modelId = body.model_id || config.public.elevenlabsDefaultModelId || 'eleven_multilingual_v2';
        const outputFormat = body.output_format || 'mp3_44100_128'; // Default output format

        const voiceSettings = {
            stability: typeof body.stability === 'number' ? body.stability : 0.5, // Default stability
            similarity_boost: typeof body.similarity_boost === 'number' ? body.similarity_boost : 0.75, // Default boost
            style: typeof body.style === 'number' ? body.style : 0.0, // Default style
            use_speaker_boost: typeof body.use_speaker_boost === 'boolean' ? body.use_speaker_boost : true, // Default speaker boost
        };

        const elevenlabsPayload = {
            text: textData.transcript,
            model_id: modelId,
            voice_settings: voiceSettings,
        };

        const elevenlabsApiUrl = `${config.elevenlabsBaseUrl}/text-to-speech/${voiceId}`;
        console.log(`Calling ElevenLabs API: ${elevenlabsApiUrl} with model ${modelId}`);

        // 4. Call ElevenLabs API
        const response = await $fetch(elevenlabsApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${elevenlabsApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(elevenlabsPayload)
        });

        if (response.error) {
            console.error('Error calling ElevenLabs API:', response.error);
            throw createError({ statusCode: 500, statusMessage: `API error: ${response.error.message}` });
        }

        const audioData = await response.arrayBuffer();
        const audioDuration = getAudioDurationInSeconds(audioData);
        const audioFileName = `guide_audio_${guideTextId}_${Date.now()}.${outputFormat.split('_')[0]}`;
        const audioFilePath = join(tmpdir(), audioFileName);

        writeFileSync(audioFilePath, Buffer.from(audioData));

        uploadedFilePath = audioFilePath;

        return {
            audio_file_path: audioFilePath,
            audio_duration: audioDuration,
            audio_file_name: audioFileName,
            output_format: outputFormat
        };
    } catch (error: any) {
        console.error('Error processing request:', error);
        throw createError({ 
            statusCode: 500, 
            statusMessage: `Internal Server Error: ${error?.message || 'Unknown error'}` 
        });
    } finally {
        if (uploadedFilePath && !uploadedFilePath.includes(tmpdir())) {
            unlinkSync(uploadedFilePath);
        }
    }
});