// server/api/storage-check.get.ts
import { serverSupabaseClient } from '#supabase/server' 
import type { Database } from '~/types/supabase'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  console.log('API Route /api/storage-check called.'); 

  const client = await serverSupabaseClient<Database>(event);
  console.log('Supabase client obtained.');

  try {
    console.log('Attempting to list storage buckets...');
    const { data: buckets, error } = await client.storage.listBuckets();

    if (error) {
      console.error('Supabase Storage Error:', error);
      let statusMessage = `Failed to list storage buckets: ${error.message}`;
      let statusCode = 500;
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('Unauthorized')) {
          statusCode = 401;
          statusMessage = `Authentication error accessing storage. Check Service Role Key or RLS policies. Original: ${error.message}`;
      } else if (error.message.includes('fetch')) { 
          statusMessage = `Network error connecting to Supabase Storage. Check Supabase status or network. Original: ${error.message}`;
      }

      throw createError({
        statusCode: statusCode,
        statusMessage: statusMessage,
        data: error 
      });
    }

    console.log('Successfully listed buckets:', buckets);

    const expectedBucketName = 'guide-audios'; 
    const bucketExists = buckets.some(b => b.name === expectedBucketName);

    console.log(`Bucket '${expectedBucketName}' exists: ${bucketExists}`);

    return {
      success: true,
      message: 'Successfully connected to Supabase Storage and listed buckets.',
      buckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public })), 
      expectedBucketFound: bucketExists,
      expectedBucketName: expectedBucketName,
    };

  } catch (err: any) {
    console.error('Unexpected Error in /api/storage-check:', err);
    if (err.statusCode) {
      throw err;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: `Internal Server Error checking storage: ${err.message}`,
      });
    }
  }
}); 