# ElevenLabs API 使用指南

本文档介绍如何在 Nuxt 应用中集成和使用 ElevenLabs API，包括基本设置、API 端点封装以及常见用例。

## 环境配置

首先，需要在项目中设置必要的环境变量：

```bash
# .env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_DEFAULT_VOICE_ID=your_default_voice_id
ELEVENLABS_DEFAULT_MODEL_ID=eleven_flash_v2_5
```

在 `nuxt.config.ts` 中添加相关配置：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // 私有配置（仅服务端可用）
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    elevenlabsDefaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID,
    elevenlabsDefaultModelId: process.env.ELEVENLABS_DEFAULT_MODEL_ID,
    
    // 公共配置（客户端可用）
    public: {
      elevenlabsApiBaseUrl: 'https://api.elevenlabs.io/v1',
      elevenlabsDefaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID,
      elevenlabsDefaultModelId: process.env.ELEVENLABS_DEFAULT_MODEL_ID
    }
  }
})
```

## API 服务封装

为了便于使用，创建一个统一的 API 服务封装：

### 服务端 API 封装

```typescript
// server/utils/elevenlabs-api.ts
import { H3Event } from 'h3'

// API 响应类型
export interface ElevenLabsVoice {
  voice_id: string
  name: string
  samples: Array<{ sample_id: string, file_name: string, mime_type: string, size_bytes: number, hash: string }>
  category: string
  fine_tuning: { model_id: string, is_allowed_to_fine_tune: boolean, fine_tuning_requested: boolean, finetuning_state: string, verification_attempts: number, verification_failures: number, verification_attempts_count: number }
  labels: Record<string, string>
  description: string
  preview_url: string
  available_for_tiers: string[]
  settings: { stability: number, similarity_boost: number, style?: number, use_speaker_boost?: boolean }
  sharing: { status: string, history_item_sample_id: string, original_voice_id: string, public_owner_id: string, liked_by_count: number, cloned_by_count: number, whitelisted_emails: string[], name: string, labels: Record<string, string>, description: string }
}

export interface ElevenLabsModel {
  model_id: string
  name: string
  token_cost_factor: number
  description: string
  can_be_finetuned: boolean
  can_do_text_to_speech: boolean
  can_do_voice_conversion: boolean
  languages: Array<{ language_id: string, name: string }>
  max_characters_request_free_user: number
  max_characters_request_subscription_user: number
}

// API 服务类
export class ElevenLabsAPI {
  private apiKey: string
  private baseUrl: string
  
  constructor(event: H3Event) {
    const config = useRuntimeConfig()
    this.apiKey = config.elevenlabsApiKey
    this.baseUrl = config.public.elevenlabsApiBaseUrl || 'https://api.elevenlabs.io/v1'
    
    if (!this.apiKey) {
      throw new Error('ElevenLabs API 密钥未配置')
    }
  }
  
  // 获取可用声音列表
  async getVoices(): Promise<ElevenLabsVoice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取声音列表失败: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.voices || []
  }
  
  // 获取可用模型列表
  async getModels(): Promise<ElevenLabsModel[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data || []
  }
  
  // 文本转语音（返回音频 Buffer）
  async textToSpeech(
    text: string,
    voiceId: string = useRuntimeConfig().elevenlabsDefaultVoiceId,
    modelId: string = useRuntimeConfig().elevenlabsDefaultModelId || 'eleven_flash_v2_5'
  ): Promise<Buffer> {
    if (!voiceId) {
      throw new Error('未指定声音 ID')
    }
    
    const url = `${this.baseUrl}/text-to-speech/${voiceId}`
    
    const requestData = {
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      throw new Error(`文本转语音失败: ${response.status} ${response.statusText}`)
    }
    
    // 获取二进制数据
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
  
  // 获取用户信息
  async getUserInfo() {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取用户信息失败: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  // 获取用户订阅信息
  async getUserSubscription() {
    const response = await fetch(`${this.baseUrl}/user/subscription`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取用户订阅信息失败: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  }
}
```

### 服务端 API 端点

创建 Nuxt 服务端 API 端点：

```typescript
// server/api/elevenlabs/voices.get.ts
import { ElevenLabsAPI } from '~/server/utils/elevenlabs-api'

export default defineEventHandler(async (event) => {
  try {
    const api = new ElevenLabsAPI(event)
    const voices = await api.getVoices()
    return voices
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取声音列表失败'
    })
  }
})
```

```typescript
// server/api/elevenlabs/models.get.ts
import { ElevenLabsAPI } from '~/server/utils/elevenlabs-api'

export default defineEventHandler(async (event) => {
  try {
    const api = new ElevenLabsAPI(event)
    const models = await api.getModels()
    return models
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取模型列表失败'
    })
  }
})
```

```typescript
// server/api/elevenlabs/text-to-speech.post.ts
import { ElevenLabsAPI } from '~/server/utils/elevenlabs-api'
import { createRequiredError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { text, voiceId, modelId } = body
    
    if (!text) {
      throw createRequiredError('text')
    }
    
    const api = new ElevenLabsAPI(event)
    const audioBuffer = await api.textToSpeech(text, voiceId, modelId)
    
    // 设置响应头
    setResponseHeaders(event, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString()
    })
    
    // 返回音频数据
    return audioBuffer
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '文本转语音失败'
    })
  }
})
```

## 客户端使用

在客户端，创建一个可复用的 composable 函数：

```typescript
// composables/useElevenLabs.ts
import { ref, computed } from 'vue'

export function useElevenLabs() {
  const config = useRuntimeConfig()
  const defaultVoiceId = computed(() => config.public.elevenlabsDefaultVoiceId)
  const defaultModelId = computed(() => config.public.elevenlabsDefaultModelId || 'eleven_flash_v2_5')
  
  // 状态
  const voices = ref<any[]>([])
  const models = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 获取可用声音列表
  async function fetchVoices() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/elevenlabs/voices')
      voices.value = response
      return response
    } catch (err: any) {
      error.value = err.message || '获取声音列表失败'
      console.error('获取声音列表错误:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // 获取可用模型列表
  async function fetchModels() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/elevenlabs/models')
      models.value = response
      return response
    } catch (err: any) {
      error.value = err.message || '获取模型列表失败'
      console.error('获取模型列表错误:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // 执行文本转语音
  async function textToSpeech(text: string, voiceId = defaultVoiceId.value, modelId = defaultModelId.value) {
    isLoading.value = true
    error.value = null
    
    try {
      // 直接获取音频 Blob
      const response = await $fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        body: { text, voiceId, modelId },
        responseType: 'blob'
      })
      
      // 创建音频 URL
      const audioBlob = new Blob([response], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      return {
        audioUrl,
        audioBlob,
        // 播放音频的辅助函数
        play: () => {
          const audio = new Audio(audioUrl)
          return audio.play()
        },
        // 释放资源的辅助函数
        release: () => {
          URL.revokeObjectURL(audioUrl)
        }
      }
    } catch (err: any) {
      error.value = err.message || '文本转语音失败'
      console.error('文本转语音错误:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // 状态
    voices,
    models,
    isLoading,
    error,
    defaultVoiceId,
    defaultModelId,
    
    // 方法
    fetchVoices,
    fetchModels,
    textToSpeech
  }
}
```

## 常见用例

### 基本文本转语音

```vue
<script setup>
import { ref } from 'vue'
import { useElevenLabs } from '~/composables/useElevenLabs'

const text = ref('欢迎使用 ElevenLabs 文本转语音服务！')
const audioResult = ref(null)
const { textToSpeech, isLoading, error } = useElevenLabs()

async function generateSpeech() {
  try {
    // 释放之前的资源
    if (audioResult.value) {
      audioResult.value.release()
    }
    
    // 生成新的语音
    audioResult.value = await textToSpeech(text.value)
    
    // 自动播放
    await audioResult.value.play()
  } catch (err) {
    console.error('生成语音失败:', err)
  }
}
</script>

<template>
  <div>
    <textarea v-model="text" class="w-full p-2 border rounded" rows="3"></textarea>
    
    <button 
      @click="generateSpeech" 
      class="px-4 py-2 bg-blue-600 text-white rounded mt-2"
      :disabled="isLoading || !text.trim()"
    >
      {{ isLoading ? '生成中...' : '生成语音' }}
    </button>
    
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
    
    <div v-if="audioResult" class="mt-4">
      <audio controls :src="audioResult.audioUrl" class="w-full"></audio>
      
      <a 
        :href="audioResult.audioUrl" 
        download="audio.mp3"
        class="inline-block px-4 py-2 bg-green-600 text-white rounded mt-2"
      >
        下载音频
      </a>
    </div>
  </div>
</template>
```

### 使用不同声音和模型

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useElevenLabs } from '~/composables/useElevenLabs'

const text = ref('这是一段测试文本，使用不同的声音和模型生成语音。')
const selectedVoiceId = ref('')
const selectedModelId = ref('')

const { 
  fetchVoices, 
  fetchModels, 
  textToSpeech, 
  voices, 
  models, 
  isLoading, 
  defaultVoiceId, 
  defaultModelId 
} = useElevenLabs()

// 初始化选择的声音和模型
onMounted(async () => {
  // 获取可用声音和模型
  await Promise.all([fetchVoices(), fetchModels()])
  
  // 默认选择
  selectedVoiceId.value = defaultVoiceId.value || (voices.value[0]?.voice_id ?? '')
  selectedModelId.value = defaultModelId.value || (models.value[0]?.model_id ?? '')
})

async function generateSpeech() {
  if (!text.value.trim() || !selectedVoiceId.value || !selectedModelId.value) return
  
  try {
    const result = await textToSpeech(text.value, selectedVoiceId.value, selectedModelId.value)
    await result.play()
  } catch (err) {
    console.error('生成语音失败:', err)
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <label class="block mb-2">选择声音：</label>
      <select v-model="selectedVoiceId" class="w-full p-2 border rounded">
        <option v-for="voice in voices" :key="voice.voice_id" :value="voice.voice_id">
          {{ voice.name }}
        </option>
      </select>
    </div>
    
    <div class="mb-4">
      <label class="block mb-2">选择模型：</label>
      <select v-model="selectedModelId" class="w-full p-2 border rounded">
        <option v-for="model in models" :key="model.model_id" :value="model.model_id">
          {{ model.name }}
        </option>
      </select>
    </div>
    
    <textarea v-model="text" class="w-full p-2 border rounded mb-4" rows="3"></textarea>
    
    <button 
      @click="generateSpeech" 
      class="px-4 py-2 bg-blue-600 text-white rounded"
      :disabled="isLoading || !text.trim() || !selectedVoiceId || !selectedModelId"
    >
      {{ isLoading ? '生成中...' : '使用所选声音和模型生成' }}
    </button>
  </div>
</template>
```

## 错误处理

创建一个通用的错误处理工具：

```typescript
// server/utils/errors.ts
import { H3Error } from 'h3'

export function createRequiredError(field: string): H3Error {
  return createError({
    statusCode: 400,
    statusMessage: `缺少必要的字段: ${field}`
  })
}

export function createApiError(message: string, statusCode = 500): H3Error {
  return createError({
    statusCode,
    statusMessage: message
  })
}
```

## API 速率限制处理

为避免超出 API 限制，可以实现一个简单的速率限制中间件：

```typescript
// server/middleware/rate-limit.ts
import { H3Event } from 'h3'

interface RateLimitData {
  timestamp: number
  count: number
}

// 内存存储计数器
const rateLimitStore = new Map<string, RateLimitData>()

// 配置
const MAX_REQUESTS = 10 // 最大请求数
const TIME_WINDOW = 60 * 1000 // 时间窗口（毫秒）

export default defineEventHandler((event: H3Event) => {
  // 只对 ElevenLabs API 路由进行限制
  if (!event.path.startsWith('/api/elevenlabs')) {
    return
  }
  
  // 获取客户端 IP 作为唯一标识
  const clientIp = getRequestHeader(event, 'x-forwarded-for') || 
                  getRequestHeader(event, 'x-real-ip') || 
                  event.node.req.socket.remoteAddress || 
                  'unknown'
  
  const now = Date.now()
  const rateLimitData = rateLimitStore.get(clientIp) || { timestamp: now, count: 0 }
  
  // 检查是否在时间窗口内
  if (now - rateLimitData.timestamp > TIME_WINDOW) {
    // 重置计数器
    rateLimitData.timestamp = now
    rateLimitData.count = 1
  } else {
    // 增加计数
    rateLimitData.count++
    
    // 检查是否超出限制
    if (rateLimitData.count > MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: '请求过于频繁，请稍后再试'
      })
    }
  }
  
  // 更新存储
  rateLimitStore.set(clientIp, rateLimitData)
})
```

## API Key 管理与安全性

为了保护 API 密钥，请遵循以下最佳实践：

1. **永远不要在客户端代码中暴露 API 密钥**
2. **使用服务端 API 代理所有请求**
3. **实现适当的用户认证和授权**
4. **加入请求速率限制**
5. **不要在版本控制系统中提交 .env 文件**

## 本地开发建议

创建一个 `.env.example` 文件，其中包含必要的环境变量（但不包含实际值）：

```bash
# .env.example
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_DEFAULT_VOICE_ID=your_default_voice_id
ELEVENLABS_DEFAULT_MODEL_ID=eleven_flash_v2_5
```

为本地开发创建 `.env.local` 文件（已在 .gitignore 中忽略）：

```bash
# .env.local (本地开发，不提交到版本控制)
ELEVENLABS_API_KEY=actual_api_key
ELEVENLABS_DEFAULT_VOICE_ID=actual_voice_id
ELEVENLABS_DEFAULT_MODEL_ID=eleven_flash_v2_5
```

## 常见问题与解决方案

### 问题：API 请求超时

**解决方案**：
- 增加服务端请求超时时间
- 对较长文本实现分段处理
- 考虑使用流式 API 处理长文本

```typescript
// 增加超时设置的例子
const fetchOptions = {
  timeout: 30000, // 30秒
  // ... 其他选项
}
```

### 问题：音频生成质量不佳

**解决方案**：
- 调整 `stability` 和 `similarity_boost` 参数
- 尝试不同的模型
- 确保文本格式化和标点符号正确

```typescript
// 调整音频生成参数
const requestData = {
  text,
  model_id: modelId,
  voice_settings: {
    stability: 0.7, // 更高的稳定性
    similarity_boost: 0.8 // 更高的相似度提升
  }
}
```

### 问题：处理多语言文本

**解决方案**：
- 选择适合目标语言的声音
- 对于混合语言文本，可能需要分段处理
- 确保文本使用正确的 Unicode 编码

```typescript
// 处理不同语言文本的例子
async function generateMultilingualSpeech(texts: Record<string, string>, voiceIds: Record<string, string>) {
  const audioResults = []
  
  for (const [lang, text] of Object.entries(texts)) {
    const voiceId = voiceIds[lang]
    if (text && voiceId) {
      const result = await textToSpeech(text, voiceId)
      audioResults.push(result)
    }
  }
  
  return audioResults
}
```

## 参考资源

- [ElevenLabs API 文档](https://docs.elevenlabs.io/api-reference)
- [Nuxt 服务端 API 文档](https://nuxt.com/docs/guide/directory-structure/server)
- [Vue 组合式 API 文档](https://vuejs.org/guide/extras/composition-api-faq.html) 