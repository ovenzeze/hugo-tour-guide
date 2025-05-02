# ElevenLabs API 配置指南

本文档详细说明如何在 Nuxt 3 应用中配置 ElevenLabs API，包括环境变量设置、API 密钥管理和常用参数配置。

## 环境变量配置

在 Nuxt 3 项目中，我们使用 `.env` 文件配置环境变量。为了安全起见，API 密钥等敏感信息应存储在环境变量中，并通过服务端 API 路由进行访问。

### 必要的环境变量

```bash
# ElevenLabs API 密钥
ELEVENLABS_API_KEY=your_api_key_here

# API 基本 URL (可选，默认值已设置)
ELEVENLABS_API_BASE_URL=https://api.elevenlabs.io/v1

# 默认使用的语音 ID (可选)
ELEVENLABS_DEFAULT_VOICE_ID=pNInz6obpgDQGcFmaJgB

# 默认使用的模型 ID (可选)
ELEVENLABS_DEFAULT_MODEL_ID=eleven_multilingual_v2
```

## 在 Nuxt 中访问环境变量

### 服务端访问

在 Nuxt 3 的服务端 API 路由中，可以通过 `process.env` 或 `useRuntimeConfig()` 访问环境变量：

```typescript
// server/api/elevenlabs/tts.post.ts
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // 获取运行时配置
  const config = useRuntimeConfig()
  
  // 访问环境变量
  const apiKey = config.elevenlabsApiKey
  const baseUrl = config.elevenlabsBaseUrl
  
  // 读取请求体
  const body = await readBody(event)
  
  // API 调用逻辑...
})
```

### 客户端安全访问

为保护 API 密钥，不应在客户端直接暴露密钥。相反，我们应该通过服务端 API 路由代理请求：

```typescript
// composables/useElevenLabs.ts
export function useElevenLabs() {
  const generate = async (text: string, voiceId?: string) => {
    return await useFetch('/api/elevenlabs/tts', {
      method: 'POST',
      body: {
        text,
        voiceId
      }
    })
  }
  
  return {
    generate
  }
}
```

## Nuxt 运行时配置

在 `nuxt.config.ts` 中设置运行时配置：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // 仅服务端可用的私有密钥
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    elevenlabsBaseUrl: process.env.ELEVENLABS_API_BASE_URL || 'https://api.elevenlabs.io/v1',
    
    // 可暴露给客户端的公共配置
    public: {
      elevenlabsDefaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      elevenlabsDefaultModelId: process.env.ELEVENLABS_DEFAULT_MODEL_ID || 'eleven_multilingual_v2'
    }
  }
})
```

## API 参数配置

### 语音设置 (Voice Settings)

根据需要配置语音生成参数，以下是推荐的配置：

```typescript
// 语音参数配置
interface VoiceSettings {
  stability: number;       // 语音稳定性，范围: 0-1，推荐值: 0.5
  similarity_boost: number; // 与原声音相似度，范围: 0-1，推荐值: 0.75
  style?: number;          // 风格强度，范围: 0-1，默认: 0
  use_speaker_boost?: boolean; // 是否增强说话者特征，默认: true
}

// 默认语音设置
const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  use_speaker_boost: true
}
```

### 模型选择指南

| 模型 ID | 特点 | 适用场景 |
|--------|------|---------|
| eleven_multilingual_v2 | 高质量，支持丰富表现力 | 预先生成的内容，如虚拟导游讲解 |
| eleven_turbo_v2 | 较快处理速度，中等质量 | 长文本处理，平衡速度和质量 |
| eleven_flash_v2_5 | 低延迟（约75ms）| 实时交互场景，如虚拟助手对话 | 