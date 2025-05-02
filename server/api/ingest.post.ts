import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase' // Adjust the path if your types file is located elsewhere
import type { H3Event } from 'h3'

type MuseumInsert = Database['public']['Tables']['museums']['Insert']
type GalleryInsert = Database['public']['Tables']['galleries']['Insert']
type ObjectInsert = Database['public']['Tables']['objects']['Insert']

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