import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'
import type { H3Event } from 'h3'
import { readMultipartFormData, MultiPartData } from 'h3'

// Define the expected structure for guide_audios insert
// Assuming your table is named 'guide_audios'
// Adjust if your table name or columns are different
type GuideAudioInsert = Database['public']['Tables']['guide_audios']['Insert']

// Define the structure we expect for the guide_texts lookup
type GuideTextRow = Database['public']['Tables']['guide_texts']['Row']

// Helper function to find the file part
function findFile(parts: MultiPartData[] | undefined): MultiPartData | undefined {
    return parts?.find(part => part.name === 'audioFile' && part.filename && part.type?.startsWith('audio/'));
}

// Helper function to find a specific form field part
function findField(parts: MultiPartData[] | undefined, fieldName: string): string | undefined {
    const part = parts?.find(p => p.name === fieldName);
    return part?.data.toString('utf-8');
}

export default defineEventHandler(async (event: H3Event) => {
    console.log('API Route /api/ingest-audio called.');

    const client = await serverSupabaseClient<Database>(event);
    const storageBucketName = 'guide-voices'; // Updated bucket name

    let guideTextRecord: GuideTextRow | null = null;
    let uploadedFilePath: string | null = null;

    try {
        // 1. Parse Multipart Form Data
        const formData = await readMultipartFormData(event);
        if (!formData) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing form data.' });
        }

        // 2. Extract File and Metadata
        const audioFilePart = findFile(formData);
        const guideTextIdStr = findField(formData, 'guide_text_id');
        const audioVersionStr = findField(formData, 'audio_version');
        const durationSecondsStr = findField(formData, 'duration_seconds');
        const generationMetadataStr = findField(formData, 'generation_metadata');

        if (!audioFilePart || !audioFilePart.data) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid audio file (must be name=audioFile and audio/* type).' });
        }
        if (!guideTextIdStr) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing guide_text_id field.' });
        }

        const guideTextId = parseInt(guideTextIdStr, 10);
        if (isNaN(guideTextId)) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid guide_text_id format (must be an integer).' });
        }

        const audioVersion = audioVersionStr ? parseInt(audioVersionStr, 10) : 1;
        if (isNaN(audioVersion)) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid audio_version format (must be an integer).' });
        }

        const durationSeconds = durationSecondsStr ? parseInt(durationSecondsStr, 10) : null;
        if (durationSecondsStr && (durationSeconds === null || isNaN(durationSeconds))) {
             throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid duration_seconds format (must be an integer).' });
        }

        let generationMetadata: object | null = null;
        if (generationMetadataStr) {
            try {
                generationMetadata = JSON.parse(generationMetadataStr);
            } catch (e) {
                throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid generation_metadata format (must be valid JSON).' });
            }
        }

        // 3. Verify guide_text_id and fetch related data
        console.log(`Fetching guide_texts record for id: ${guideTextId}`);
        const { data: textData, error: textError } = await client
            .from('guide_texts')
            .select('*') // Select all needed fields
            .eq('guide_text_id', guideTextId)
            .maybeSingle(); // Use maybeSingle to handle null case gracefully

        if (textError) {
            console.error('Error fetching guide text:', textError);
            throw createError({ statusCode: 500, statusMessage: `Database error fetching guide text: ${textError.message}` });
        }
        if (!textData) {
            throw createError({ statusCode: 404, statusMessage: `Not Found: Guide text with id ${guideTextId} not found.` });
        }
        guideTextRecord = textData;
        console.log('Found guide text record:', guideTextRecord);

        // 4. Upload Audio to Supabase Storage
        const fileExt = audioFilePart.filename?.split('.').pop() || 'mp3'; // Default extension
        const uniqueFileName = `${guideTextRecord.guide_text_id}_v${audioVersion}_${Date.now()}.${fileExt}`;
        // Construct a path (e.g., using persona ID or entity type for organization)
        const filePath = `public/${guideTextRecord.persona_id}/${uniqueFileName}`; // Example path

        console.log(`Uploading file to bucket '${storageBucketName}' at path '${filePath}'`);
        const { data: uploadData, error: uploadError } = await client.storage
            .from(storageBucketName)
            .upload(filePath, audioFilePart.data, {
                contentType: audioFilePart.type,
                upsert: false // Don't overwrite existing files with the same name
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError);
            throw createError({ statusCode: 500, statusMessage: `Storage upload failed: ${uploadError.message}` });
        }
        if (!uploadData || !uploadData.path) {
             throw createError({ statusCode: 500, statusMessage: 'Storage upload succeeded but did not return a valid path.' });
        }
        uploadedFilePath = uploadData.path; // Store the path returned by storage
        console.log('File uploaded successfully. Path:', uploadedFilePath);

        // 5. Insert Metadata into Database (guide_audios table)
        const insertPayload: GuideAudioInsert = {
            guide_text_id: guideTextRecord.guide_text_id,
            persona_id: guideTextRecord.persona_id, // From fetched text record
            language: guideTextRecord.language, // From fetched text record
            museum_id: guideTextRecord.museum_id, // From fetched text record
            gallery_id: guideTextRecord.gallery_id, // From fetched text record
            object_id: guideTextRecord.object_id, // From fetched text record
            audio_url: uploadedFilePath, // Use the path from storage upload
            version: audioVersion,
            duration_seconds: durationSeconds,
            metadata: generationMetadata as any, // Cast if your DB type is JSONB
            // is_latest_version and is_active likely default to TRUE in DB schema
        };

        console.log('Inserting record into guide_audios:', insertPayload);
        const { data: insertData, error: insertError } = await client
            .from('guide_audios') // ** MAKE SURE THIS IS YOUR CORRECT TABLE NAME **
            .insert(insertPayload)
            .select()
            .single();

        if (insertError) {
            console.error('Supabase Insert Error (guide_audios):', insertError);
            // Attempt to clean up the uploaded file if DB insert fails?
            // Consider adding cleanup logic here: client.storage.from(storageBucketName).remove([uploadedFilePath])
            throw createError({ statusCode: 500, statusMessage: `Database insert failed: ${insertError.message}` });
        }

        console.log('Successfully inserted guide_audios record:', insertData);

        // 6. Return Success Response
        event.node.res.statusCode = 201; // 201 Created
        return {
            success: true,
            message: 'Audio file uploaded and record created successfully.',
            audioRecord: insertData
        };

    } catch (err: any) {
        // Catch errors thrown by createError or other unexpected issues
        console.error('Error in /api/ingest-audio:', err);

        // Attempt to clean up partially uploaded file if an error occurred after upload
        if (uploadedFilePath) {
            console.warn(`Attempting to clean up potentially orphaned file: ${uploadedFilePath}`);
            try {
                 await client.storage.from(storageBucketName).remove([uploadedFilePath]);
                 console.log(`Cleanup successful for ${uploadedFilePath}`);
            } catch (cleanupError: any) {
                 console.error(`Failed to cleanup orphaned file ${uploadedFilePath}:`, cleanupError.message);
                 // Log cleanup error but proceed with original error response
            }
        }

        if (err.statusCode) {
            // Re-throw errors created by createError
            throw err;
        } else {
            throw createError({
                statusCode: 500,
                statusMessage: `Internal Server Error processing audio: ${err.message}`,
            });
        }
    }
}); 