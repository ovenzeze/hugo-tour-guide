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
interface TextWithPersona extends GuideTextRow {
    personas: PersonaRow | null // Assuming a relationship or join fetches this
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
        // Note: Adjust the query based on your actual relationship setup.
        // This example assumes you might fetch persona separately or have a view/join.
        // Fetching text first:
        const { data: textData, error: textError } = await client
            .from('guide_texts')
            .select(`
                *,
                personas (*)
            `) // Fetch text and related persona
            .eq('guide_text_id', guideTextId)
            .returns<TextWithPersona | null>() // Ensure correct typing for join
            .maybeSingle();

        if (textError) {
            console.error('Error fetching guide text/persona:', textError);
            throw createError({ statusCode: 500, statusMessage: `Database error fetching data: ${textError.message}` });
        }
        if (!textData) {
            throw createError({ statusCode: 404, statusMessage: `Not Found: Guide text with id ${guideTextId} not found.` });
        }
        if (!textData.personas) {
             throw createError({ statusCode: 404, statusMessage: `Not Found: Persona associated with guide text id ${guideTextId} not found.` });
        }
        const guideTextRecord = textData;
        const personaRecord = textData.personas;
        console.log(`Found text: "${guideTextRecord.transcript.substring(0, 30)}...", Persona: ${personaRecord.name}`);


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
            text: guideTextRecord.transcript,
            model_id: modelId,
            voice_settings: voiceSettings,
        };

        const elevenlabsApiUrl = `${config.elevenlabsBaseUrl}/text-to-speech/${voiceId}`;
        console.log(`Calling ElevenLabs API: ${elevenlabsApiUrl} with model ${modelId}`);

        // 4. Call ElevenLabs API
        let audioBuffer: Buffer;
        try {
            const response: Blob = await $fetch(elevenlabsApiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg', // Request MP3 audio stream
                    'Content-Type': 'application/json',
                    'xi-api-key': elevenlabsApiKey,
                },
                query: {
                    output_format: outputFormat,
                    optimize_streaming_latency: 0 // Optional: Adjust latency optimization
                },
                body: JSON.stringify(elevenlabsPayload),
                responseType: 'blob' // Important: Tell $fetch to expect a Blob
            });
             audioBuffer = Buffer.from(await response.arrayBuffer()); // Convert Blob to Buffer
             console.log(`Received audio data, size: ${audioBuffer.length} bytes`);
        } catch (elevenlabsError: any) {
            console.error('ElevenLabs API Error:', elevenlabsError);
            const statusCode = elevenlabsError.response?.status || 500;
            const statusMessage = elevenlabsError.data?.detail?.message || elevenlabsError.message || 'Unknown ElevenLabs API error';
            throw createError({ statusCode: statusCode, statusMessage: `ElevenLabs TTS failed: ${statusMessage}` });
        }


        // 5. Upload Audio to Supabase Storage
        const fileExt = outputFormat.split('_')[0] || 'mp3'; // Extract format from output_format
        const audioVersion = body.audio_version || 1; // Use provided version or default to 1
        const uniqueFileName = `${guideTextRecord.guide_text_id}_p${personaRecord.persona_id}_v${audioVersion}_${Date.now()}.${fileExt}`;
        const filePath = `public/${personaRecord.persona_id}/${uniqueFileName}`; // Organize by persona

        console.log(`Uploading audio buffer to bucket '${storageBucketName}' at path '${filePath}'`);
        const { data: uploadData, error: uploadError } = await client.storage
            .from(storageBucketName)
            .upload(filePath, audioBuffer, {
                contentType: `audio/${fileExt}`, // Set appropriate content type
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError);
            throw createError({ statusCode: 500, statusMessage: `Storage upload failed: ${uploadError.message}` });
        }
        if (!uploadData || !uploadData.path) {
             throw createError({ statusCode: 500, statusMessage: 'Storage upload succeeded but did not return a valid path.' });
        }
        uploadedFilePath = uploadData.path; // Store for potential cleanup and DB insert
        console.log('Audio uploaded successfully. Path:', uploadedFilePath);

        // 5.1 计算音频时长
        let durationSeconds = null;
        try {
            // 将音频缓冲区写入临时文件
            const tempFilePath = join(tmpdir(), `temp-audio-${Date.now()}.${fileExt}`);
            writeFileSync(tempFilePath, audioBuffer);
            
            // 计算音频时长
            durationSeconds = Math.round(await getAudioDurationInSeconds(tempFilePath));
            console.log(`计算的音频时长: ${durationSeconds} 秒`);
            
            // 清理临时文件
            unlinkSync(tempFilePath);
        } catch (durationError) {
            console.warn(`无法计算音频时长: ${durationError.message}`);
            // 继续执行，不因为时长计算失败而中断整个流程
        }

        // 6. Insert Metadata into Database (guide_audios table)
        const insertPayload: GuideAudioInsert = {
            guide_text_id: guideTextRecord.guide_text_id,
            persona_id: personaRecord.persona_id,
            language: guideTextRecord.language,
            museum_id: guideTextRecord.museum_id,
            gallery_id: guideTextRecord.gallery_id,
            object_id: guideTextRecord.object_id,
            audio_url: uploadedFilePath, // The path returned by storage.upload
            version: audioVersion,
            duration_seconds: durationSeconds, // 使用计算的时长
            metadata: { // Store generation parameters
                elevenlabs: {
                    voiceId,
                    modelId,
                    outputFormat,
                    voiceSettings,
                    requested_stability: body.stability, // Record what was requested
                    requested_similarity_boost: body.similarity_boost,
                    requested_style: body.style,
                    requested_use_speaker_boost: body.use_speaker_boost,
                 }
            } as any,
            is_latest_version: true,
            is_active: true
        };

        console.log('Inserting record into guide_audios:', insertPayload);
        const { data: insertData, error: insertError } = await client
            .from('guide_audios') // 使用正确的表名 guide_audios 而不是 audio_guides
            .insert(insertPayload)
            .select()
            .single();

        if (insertError) {
            console.error('Supabase Insert Error (guide_audios):', insertError);
            // 尝试清理已上传的文件
            console.warn(`DB insert failed, attempting to remove uploaded file: ${uploadedFilePath}`);
            await client.storage.from(storageBucketName).remove([uploadedFilePath]); 
            throw createError({ statusCode: 500, statusMessage: `Database insert failed into guide_audios: ${insertError.message}` });
        }

        console.log('Successfully inserted guide_audios record:', insertData);

        // 7. Return Success Response
        event.node.res.statusCode = 201; // 201 Created
        return {
            success: true,
            message: 'Audio generated, uploaded, and record created successfully.',
            audioRecord: insertData
        };

    } catch (err: any) {
        // Catch errors thrown by createError or other unexpected issues
        console.error('Error in /api/generate-audio:', err);

        // Attempt cleanup if upload finished but something else failed later
        if (uploadedFilePath && !(err.statusCode === 500 && err.message?.includes('Database insert failed'))) { // Avoid double cleanup attempt
             console.warn(`Attempting to clean up potentially orphaned file due to later error: ${uploadedFilePath}`);
            try {
                 await client.storage.from(storageBucketName).remove([uploadedFilePath]);
                 console.log(`Cleanup successful for ${uploadedFilePath}`);
            } catch (cleanupError: any) {
                 console.error(`Failed to cleanup orphaned file ${uploadedFilePath}:`, cleanupError.message);
            }
        }

        if (err.statusCode) {
            // Re-throw errors created by createError
            throw err;
        } else {
            throw createError({
                statusCode: 500,
                statusMessage: `Internal Server Error generating audio: ${err.message}`
            });
        }
    }
}); 