---
title: Audio Generation and Upload API Guide
description: Complete guide for using the audio generation and upload APIs in Hugo Tour Guide
author: Zhen@Hugo
date: 2024-05-02
updatedAt: 2024-05-15
tags: ["api", "audio", "elevenlabs", "guide"]
---
## Overview

Hugo Tour Guide system provides two main API endpoints for generating and managing museum tour audio:

1. **Generate Audio API**: Uses ElevenLabs text-to-speech technology to automatically convert tour text into high-quality audio
2. **Ingest Audio API**: Allows uploading pre-recorded audio files, suitable for professional recording scenarios

Both APIs store audio files in Supabase's `guide-voices` bucket and create corresponding records in the `guide_audios` table.

## API Endpoints

### Generate Audio

This API accepts a guide text ID and optional parameters, uses ElevenLabs API to generate speech, stores the audio file, and creates a database record.

**URL:** `/api/generate-audio`  
**Method:** POST  
**Content-Type:** application/json

#### Request Parameters

```json
{
  "guide_text_id": 5,            // Required, guide text ID
  "audio_version": 1,            // Optional, audio version number (default: 1)
  "voice_id": "FGY2WhTYpPnrIDTdsKH5", // Optional, override default voice ID
  "model_id": "eleven_flash_v2_5", // Optional, ElevenLabs model ID
  "output_format": "mp3_44100_128", // Optional, output format
  "stability": 0.5,              // Optional, stability parameter (0-1)
  "similarity_boost": 0.75,      // Optional, similarity parameter (0-1)
  "style": 0.0,                  // Optional, style parameter (0-1)
  "use_speaker_boost": true      // Optional, enable speaker boost
}
```

#### Response

```json
{
  "success": true,
  "message": "Audio generated, uploaded, and record created successfully.",
  "audioRecord": {
    "audio_guide_id": 9,
    "persona_id": 2,
    "language": "en",
    "museum_id": 3,
    "gallery_id": null,
    "object_id": null,
    "audio_url": "public/2/2_p2_v1_1746154054497.mp3",
    "duration_seconds": 22,
    "version": 1,
    "is_latest_version": true,
    "is_active": true,
    "generated_at": "2025-05-02T02:47:35.100902+00:00",
    "metadata": {
      "elevenlabs": {
        "modelId": "eleven_flash_v2_5",
        "voiceId": "kqVT88a5QfII1HNAEPTJ",
        "outputFormat": "mp3_44100_128",
        "voiceSettings": {
          "style": 0,
          "stability": 0.5,
          "similarity_boost": 0.75,
          "use_speaker_boost": true
        }
      }
    },
    "guide_text_id": 2
  }
}
```

#### Processing Flow

1. Receive and validate request parameters
2. Query guide text and associated persona information
3. Prepare ElevenLabs API request parameters
4. Call ElevenLabs API to generate speech
5. Upload audio file to Supabase storage
6. Calculate audio duration
7. Create record in guide_audios table
8. Return success response and record information

### Ingest Audio

This API allows uploading pre-recorded audio files, associating them with existing guide texts, and creating database records.

**URL:** `/api/ingest-audio`  
**Method:** POST  
**Content-Type:** multipart/form-data

#### Request Parameters

| Field              | Type       | Required | Description                          |
|-------------------|-----------|----------|--------------------------------------|
| audioFile         | File      | Yes      | Audio file, Content-Type must be audio/* |
| guide_text_id     | Integer   | Yes      | Associated guide text ID              |
| audio_version     | Integer   | No       | Audio version number, default is 1    |
| duration_seconds  | Integer   | No       | Audio duration in seconds             |
| generation_metadata | JSON String | No    | Generation metadata as JSON string    |

#### Response

```json
{
  "success": true,
  "message": "Audio file uploaded and record created successfully.",
  "audioRecord": {
    "audio_guide_id": 10,
    "persona_id": 1,
    "language": "en",
    "museum_id": null,
    "gallery_id": null,
    "object_id": 12345,
    "audio_url": "public/1/1_v1_1746154100000.mp3",
    "duration_seconds": 30,
    "version": 1,
    "is_latest_version": true,
    "is_active": true,
    "generated_at": "2025-05-02T03:00:00.000000+00:00",
    "metadata": {
      "source": "professional_studio",
      "recorder": "John Doe"
    },
    "guide_text_id": 1
  }
}
```

#### Processing Flow

1. Parse multipart/form-data request
2. Validate audio file and guide_text_id parameters
3. Query guide text information
4. Upload audio file to Supabase storage
5. Create record in guide_audios table
6. Return success response and record information

## Database Relations

The audio guide database relationships are as follows:

```
personas
    |
    ↓
guide_texts ――→ guide_audios
    |              ↑
    |              |
    ↓              |
museums/galleries/objects ――┘
```

### Important Constraints

1. Each guide text or audio can only be associated with one target entity (museum, gallery, or object)
2. A guide text can have multiple audio versions, managed by `is_latest_version` and `version` fields
3. Guide audios are linked to guide texts through the `guide_text_id` field
4. When a guide text is deleted, associated audio records are preserved but `guide_text_id` is set to NULL

## Use Cases

### Case 1: Generate Audio for Existing Guide Text

When curators complete a guide text, they can use the generate-audio API to automatically create corresponding audio. The system uses the associated persona's voice model to generate natural and fluent speech.

### Case 2: Upload Professional Audio Recordings

For audio requiring higher quality or special processing, recordings can be made in a professional studio and then uploaded using the ingest-audio API to associate with the corresponding guide text.

### Case 3: Update or Replace Existing Audio

When guide text is updated or audio quality needs improvement, new versions can be generated or uploaded. The system automatically manages versions and marks the latest version with `is_latest_version=true`.

## Best Practices

### Audio Generation

1. **Choose Appropriate Voice Models**:
    - Select suitable ElevenLabs voice models for each persona
    - Use language-specific voice models for different languages

2. **Optimize Stability and Similarity Parameters**:
    - Lower stability (e.g., 0.3): More expressive but potentially unstable
    - Higher stability (e.g., 0.7): More stable but less expressive
    - Recommended similarity value around 0.75 for best results

3. **Version Management**:
    - Increment version number for each new generation
    - Use `is_active=false` to disable outdated audio instead of deleting

### Audio Upload

1. **File Format**:
    - Recommend MP3 format (44.1kHz, 128kbps)
    - Ensure clear audio quality with minimal noise

2. **File Size**:
    - Control individual audio file size, recommended under 10MB
    - Consider splitting longer tours into segments

3. **Provide Accurate Duration**:
    - Include accurate `duration_seconds` when uploading
    - Important for correct progress display in frontend player

## Troubleshooting

### Common Issues

1. **ElevenLabs API Errors**
    - Verify API key validity
    - Check voice model ID correctness
    - Confirm text length within allowed range

2. **Storage Upload Failures**
    - Check Supabase bucket permissions
    - Verify supported file formats
    - Validate file size limits

3. **Database Insert Errors**
    - Confirm guide_text_id exists
    - Check constraints (e.g., unique constraints)
    - Verify required fields are provided

### Error Handling

API design includes recovery mechanisms:

- Automatically deletes uploaded files if database insertion fails
- Returns detailed error information in responses
- Logs complete error stack traces on server

## Code Examples

### Generate Audio Using curl

```bash
curl -X POST http://localhost:3000/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "guide_text_id": 5,
    "stability": 0.6,
    "similarity_boost": 0.8
  }'
```

### Upload Audio Using curl

```bash
curl -X POST http://localhost:3000/api/ingest-audio \
  -F "audioFile=@/path/to/audio.mp3" \
  -F "guide_text_id=5" \
  -F "audio_version=1" \
  -F "duration_seconds=24" \
  -F 'generation_metadata={"source":"studio","recorder":"John Doe"}'
```

### Generate Audio Using JavaScript

```javascript
async function generateAudio(guideTextId) {
  try {
    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guide_text_id: guideTextId,
        audio_version: 1
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Audio generated successfully:', result.audioRecord);
      return result.audioRecord;
    } else {
      console.error('Failed to generate audio:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error generating audio:', error);
    return null;
  }
}
```

### Upload Audio Using JavaScript

```javascript
async function uploadAudio(file, guideTextId, version, durationSeconds) {
  try {
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('guide_text_id', guideTextId);
    formData.append('audio_version', version || 1);
    
    if (durationSeconds) {
      formData.append('duration_seconds', durationSeconds);
    }
    
    const response = await fetch('/api/ingest-audio', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Audio uploaded successfully:', result.audioRecord);
      return result.audioRecord;
    } else {
      console.error('Failed to upload audio:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error uploading audio:', error);
    return null;
  }
}
```