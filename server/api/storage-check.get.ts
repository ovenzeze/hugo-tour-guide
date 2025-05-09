// server/api/storage-check.get.ts
import { serverSupabaseClient } from '#supabase/server' 
import type { Database } from '~/types/supabase'
import type { H3Event } from 'h3'

// 添加 OpenAPI 元数据
defineRouteMeta({
  openAPI: {
    summary: '检查存储桶状态',
    description: '检查 Supabase 存储桶是否存在并可访问，返回所有存储桶列表和状态信息',
    tags: ['系统'],
    responses: {
      '200': {
        description: '成功获取存储桶信息',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Successfully connected to Supabase Storage and listed buckets.' },
                buckets: { 
                  type: 'array', 
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'bucket-id-123' },
                      name: { type: 'string', example: 'guide-audios' },
                      public: { type: 'boolean', example: false }
                    }
                  }
                },
                expectedBucketFound: { type: 'boolean', example: true },
                expectedBucketName: { type: 'string', example: 'guide-audios' }
              }
            }
          }
        }
      },
      '401': {
        description: '认证错误',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                statusMessage: { type: 'string', example: 'Authentication error accessing storage' }
              }
            }
          }
        }
      },
      '500': {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 500 },
                statusMessage: { type: 'string', example: 'Failed to list storage buckets' }
              }
            }
          }
        }
      }
    }
  }
})

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