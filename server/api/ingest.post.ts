import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase' // Adjust the path if your types file is located elsewhere
import type { H3Event } from 'h3'

type MuseumInsert = Database['public']['Tables']['museums']['Insert']
type GalleryInsert = Database['public']['Tables']['galleries']['Insert']
type ObjectInsert = Database['public']['Tables']['objects']['Insert']

// 添加 OpenAPI 元数据
defineRouteMeta({
  openAPI: {
    summary: '数据导入接口',
    description: '导入博物馆、展厅或展品数据到数据库',
    tags: ['数据管理'],
    requestBody: {
      description: '要导入的数据',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['type', 'data'],
            properties: {
              type: { 
                type: 'string', 
                enum: ['museum', 'gallery', 'object'],
                description: '数据类型，可以是博物馆、展厅或展品' 
              },
              data: { 
                type: 'object',
                description: '根据类型提供相应的数据结构',
                oneOf: [
                  {
                    type: 'object',
                    title: '博物馆',
                    properties: {
                      name: { type: 'string', example: '国家博物馆' },
                      description: { type: 'string' },
                      location: { type: 'string', example: '北京市' },
                      image_url: { type: 'string' }
                    },
                    required: ['name']
                  },
                  {
                    type: 'object',
                    title: '展厅',
                    properties: {
                      name: { type: 'string', example: '古代文明展厅' },
                      description: { type: 'string' },
                      museum_id: { type: 'integer', example: 1 },
                      floor: { type: 'string', example: '1F' }
                    },
                    required: ['name', 'museum_id']
                  },
                  {
                    type: 'object',
                    title: '展品',
                    properties: {
                      name: { type: 'string', example: '青铜器' },
                      description: { type: 'string' },
                      gallery_id: { type: 'integer', example: 1 },
                      image_url: { type: 'string' }
                    },
                    required: ['name', 'gallery_id']
                  }
                ]
              }
            }
          }
        }
      }
    },
    responses: {
      '201': {
        description: '数据创建成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                type: { type: 'string', example: 'museum' },
                insertedData: { 
                  type: 'object',
                  description: '插入的数据记录'
                }
              }
            }
          }
        }
      },
      '400': {
        description: '请求格式错误',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 400 },
                statusMessage: { type: 'string', example: 'Bad Request: Missing type or data in request body.' }
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
                statusMessage: { type: 'string', example: 'Failed to insert museum.' }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody(event)

  if (!body || !body.type || !body.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing type or data in request body.',
    })
  }

  const { type, data } = body

  try {
    let resultData: any = null
    let error: any = null

    switch (type) {
      case 'museum':
        ({ data: resultData, error } = await client
          .from('museums')
          .insert(data as MuseumInsert)
          .select()
          .single()) // Use .single() if you expect exactly one row back after insert
        break
      case 'gallery':
        ({ data: resultData, error } = await client
          .from('galleries')
          .insert(data as GalleryInsert)
          .select()
          .single())
        break
      case 'object':
        // Note: Supabase insert can take an array. If you want to insert multiple objects at once,
        // the client-side should send `data` as an array of ObjectInsert.
        // The current code assumes `data` is a single object for consistency.
        // If inserting an array, remove .single()
        ({ data: resultData, error } = await client
          .from('objects')
          .insert(data as ObjectInsert)
          .select()
          .single())
        break
      default:
        throw createError({
          statusCode: 400,
          statusMessage: `Bad Request: Invalid type specified. Must be 'museum', 'gallery', or 'object'.`,
        })
    }

    if (error) {
      console.error(`Supabase Insert Error (${type}):`, error)
      // Attempt to provide a more specific error message
      let errorMessage = `Failed to insert ${type}.`;
      if (error.message) {
        errorMessage += ` Supabase error: ${error.message}`;
        // Check for common constraint violations
        if (error.message.includes('unique constraint')) {
           errorMessage += ` A record with a similar unique identifier (like name or ID) might already exist.`;
        } else if (error.message.includes('foreign key constraint')) {
           errorMessage += ` Make sure the referenced entity (e.g., museum_id for a gallery) exists.`;
        }
      }

      throw createError({
        statusCode: 500,
        statusMessage: errorMessage,
        data: { code: error.code, details: error.details, hint: error.hint } // Include Supabase error details if helpful
      })
    }

    // Set status to 201 Created for successful insertions
    event.node.res.statusCode = 201
    return { success: true, type, insertedData: resultData }

  } catch (err: any) {
    // Catch errors thrown by createError or other unexpected issues
    if (err.statusCode) {
        // Re-throw errors created by createError
       throw err;
    } else {
        console.error('Unexpected Error during ingestion:', err)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error during data ingestion.',
        })
    }
  }
}) 