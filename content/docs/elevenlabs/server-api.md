# Nuxt 服务端 API 实现

本文档详细介绍如何在 Nuxt 3 应用中实现 ElevenLabs API 的服务端接口，实现安全的文字转语音功能。

## 目录结构

```
server/
  └── api/
      └── elevenlabs/
          ├── tts.post.ts        # 基本文字转语音接口
          ├── voices.get.ts      # 获取可用语音列表
          ├── stream.post.ts     # 流式语音生成接口
          └── utils/             # 工具函数目录
              ├── client.ts      # API 客户端封装
              └── helpers.ts     # 辅助函数
```

## 基本 TTS API 实现

以下是基本文字转语音 API 的实现示例：

```typescript
// server/api/elevenlabs/tts.post.ts
import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from 'nuxt/app'
import { fetchElevenLabsAPI } from '../utils/client'

export default defineEventHandler(async (event) => {
  try {
    // 获取运行时配置
    const config = useRuntimeConfig()
    
    // 读取请求体
    const { 
      text, 
      voiceId = config.public.elevenlabsDefaultVoiceId,
      modelId = config.public.elevenlabsDefaultModelId,
      voiceSettings
    } = await readBody(event)
    
    // 参数验证
    if (!text) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: '缺少必要参数: text'
      }))
    }
    
    // 调用 ElevenLabs API
    const audioResponse = await fetchElevenLabsAPI({
      endpoint: `/text-to-speech/${voiceId}`,
      method: 'POST',
      body: {
        text,
        model_id: modelId,
        voice_settings: voiceSettings
      },
      responseType: 'arraybuffer'
    })
    
    // 设置适当的响应头
    event.node.res.setHeader('Content-Type', 'audio/mpeg')
    event.node.res.setHeader('Cache-Control', 'public, max-age=86400')
    
    // 返回音频数据
    return audioResponse
  } catch (error) {
    console.error('TTS API Error:', error)
    return sendError(event, createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '语音生成失败'
    }))
  }
})
```

## API 客户端封装

为了简化 API 调用，我们可以创建一个通用的客户端工具：

```typescript
// server/api/elevenlabs/utils/client.ts
import { useRuntimeConfig } from 'nuxt/app'
import { createError } from 'h3'

interface ApiOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
  headers?: Record<string, string>;
}

export async function fetchElevenLabsAPI(options: ApiOptions) {
  const config = useRuntimeConfig()
  const {
    endpoint,
    method = 'GET',
    body,
    responseType = 'json',
    headers = {}
  } = options
  
  // 构建完整 URL
  const baseUrl = config.elevenlabsBaseUrl
  const url = `${baseUrl}${endpoint}`
  
  // 设置通用请求头
  const requestHeaders = {
    'xi-api-key': config.elevenlabsApiKey,
    ...headers
  }
  
  if (body && method !== 'GET' && !headers['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json'
  }
  
  try {
    // 发送请求
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    })
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      throw createError({
        statusCode: response.status,
        statusMessage: `ElevenLabs API 错误: ${errorText}`
      })
    }
    
    // 根据指定的响应类型返回数据
    if (responseType === 'arraybuffer') {
      return response.arrayBuffer()
    } else if (responseType === 'blob') {
      return response.blob()
    } else if (responseType === 'text') {
      return response.text()
    } else {
      return response.json()
    }
  } catch (error) {
    console.error('ElevenLabs API 请求错误:', error)
    throw error
  }
}
```

## 获取可用语音列表

```typescript
// server/api/elevenlabs/voices.get.ts
import { defineEventHandler } from 'h3'
import { fetchElevenLabsAPI } from '../utils/client'

export default defineEventHandler(async () => {
  try {
    // 获取所有可用语音
    const voices = await fetchElevenLabsAPI({
      endpoint: '/voices',
      method: 'GET'
    })
    
    return voices
  } catch (error) {
    console.error('获取语音列表失败:', error)
    throw error
  }
})
```

## 流式语音生成 API

对于需要实时流式返回语音数据的场景，我们可以使用 WebSocket 或 HTTP 流：

```typescript
// server/api/elevenlabs/stream.post.ts
import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from 'nuxt/app'

export default defineEventHandler(async (event) => {
  try {
    // 获取运行时配置
    const config = useRuntimeConfig()
    
    // 读取请求体
    const { 
      text, 
      voiceId = config.public.elevenlabsDefaultVoiceId,
      modelId = config.public.elevenlabsDefaultModelId
    } = await readBody(event)
    
    // 参数验证
    if (!text) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: '缺少必要参数: text'
      }))
    }
    
    // 设置流响应头
    event.node.res.setHeader('Content-Type', 'audio/mpeg')
    event.node.res.setHeader('Transfer-Encoding', 'chunked')
    
    // 调用 ElevenLabs 流式 API
    const url = `${config.elevenlabsBaseUrl}/text-to-speech/${voiceId}/stream`
    
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        stream: true
      })
    })
    
    if (!fetchResponse.ok || !fetchResponse.body) {
      throw createError({
        statusCode: fetchResponse.status,
        statusMessage: '流式语音生成失败'
      })
    }
    
    // 转发流数据
    const reader = fetchResponse.body.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      // 写入数据块
      event.node.res.write(value)
    }
    
    // 结束响应
    event.node.res.end()
  } catch (error) {
    console.error('Stream API Error:', error)
    
    // 如果响应还没有发送，则发送错误
    if (!event.node.res.headersSent) {
      return sendError(event, createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.message || '流式语音生成失败'
      }))
    }
    
    // 如果已经发送了一部分响应，则直接结束
    event.node.res.end()
  }
})
```

## 缓存策略

为了减少 API 请求并改善性能，可以实现简单的缓存策略：

```typescript
// server/api/elevenlabs/utils/cache.ts
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { createHash } from 'crypto'

// 创建文件系统存储
const storage = createStorage({
  driver: fsDriver({ base: './.data/elevenlabs-cache' })
})

// 生成缓存键
export function generateCacheKey(text: string, voiceId: string, modelId: string) {
  const data = `${text}:${voiceId}:${modelId}`
  return createHash('md5').update(data).digest('hex')
}

// 获取缓存
export async function getCache(key: string) {
  return await storage.getItem(key)
}

// 设置缓存
export async function setCache(key: string, value: any) {
  await storage.setItem(key, value)
}

// 检查缓存是否存在
export async function hasCache(key: string) {
  return await storage.hasItem(key)
}
```

然后，在 TTS API 中可以使用缓存：

```typescript
// 在 tts.post.ts 中添加缓存支持
import { generateCacheKey, getCache, setCache, hasCache } from '../utils/cache'

// 在 API 处理函数中
const cacheKey = generateCacheKey(text, voiceId, modelId)

// 检查缓存
if (await hasCache(cacheKey)) {
  const cachedAudio = await getCache(cacheKey)
  
  // 设置响应头
  event.node.res.setHeader('Content-Type', 'audio/mpeg')
  event.node.res.setHeader('Cache-Control', 'public, max-age=86400')
  event.node.res.setHeader('X-Cache', 'HIT')
  
  return cachedAudio
}

// 如果没有缓存，获取新数据
const audioResponse = await fetchElevenLabsAPI(/* ... */)

// 缓存结果
await setCache(cacheKey, audioResponse)
``` 