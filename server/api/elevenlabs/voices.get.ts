import type { H3Event } from 'h3'

// Add OpenAPI metadata using defineRouteMeta
defineRouteMeta({
  openAPI: {
    summary: 'Get Available ElevenLabs Voices',
    description: 'Retrieves a list of available voices from the ElevenLabs API.',
    tags: ['ElevenLabs'],
    responses: {
      '200': {
        description: 'Successfully retrieved the list of voices.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                voices: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Voice ID' },
                      name: { type: 'string', description: 'Voice name' },
                      category: { type: 'string', description: 'Voice category (e.g., premade, cloned)', nullable: true },
                      labels: { type: 'object', description: 'Key-value labels (e.g., accent, gender)', additionalProperties: { type: 'string' }, nullable: true },
                      preview_url: { type: 'string', format: 'url', description: 'URL to preview the voice', nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '401': { description: 'Unauthorized: Invalid API Key' },
      '500': { description: 'Server Configuration Error or failed to fetch from ElevenLabs.' }
    }
  }
});

// Define the expected structure of a voice object from ElevenLabs API
// Based on typical API responses, adjust if necessary
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string; // e.g., 'premade', 'cloned'
  labels?: Record<string, string>; // e.g., { "accent": "british", "gender": "female" }
  description?: string;
  preview_url?: string;
  settings?: any; // Voice settings if available
}

export default defineEventHandler(async (event: H3Event) => {
  // --- Configuration ---
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const apiEndpoint = 'https://api.elevenlabs.io/v1/voices';

  // --- Input Validation ---
  if (!apiKey) {
    console.error('ElevenLabs API key is missing. Please set ELEVENLABS_API_KEY environment variable.');
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Configuration Error: ElevenLabs API key not found.',
    });
  }

  // --- API Call ---
  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey,
      }
    }
    const response = await $fetch<{ voices: ElevenLabsVoice[] }>(apiEndpoint, fetchOptions);

    // --- Response Handling ---
    if (!response || !response.voices) {
        throw new Error('Invalid response structure received from ElevenLabs API.');
    }

    // Optional: You might want to filter or map the voices here
    // For example, only return premade voices or extract specific labels
    const voices = response.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        labels: voice.labels,
        // Add other relevant fields you might want to expose
        preview_url: voice.preview_url
    }));

    return { success: true, voices };

  } catch (error: any) {
    // --- Error Handling ---
    console.error('Error fetching voices from ElevenLabs:', error);

    let statusCode = 500;
    let statusMessage = 'Failed to fetch voices from ElevenLabs.';

    // Check if the error is an FetchError from $fetch
    if (error.response && error.response.status) {
      statusCode = error.response.status;
      if (statusCode === 401) {
        statusMessage = 'Unauthorized: Invalid ElevenLabs API key.';
      } else {
        statusMessage = `ElevenLabs API Error (${statusCode}): ${error.data?.message || error.message}`;
      }
    } else if (error.message.includes('Invalid response structure')) {
        statusMessage = error.message;
    }

    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 