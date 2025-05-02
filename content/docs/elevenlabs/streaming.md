# ElevenLabs 实时语音流式生成

本文档介绍如何在 Nuxt 应用中实现 ElevenLabs 的实时语音流式生成功能，支持 WebSocket 和 HTTP 两种不同的流式传输方式。

## 环境配置

首先确保已配置 ElevenLabs API 相关环境变量：

```bash
# .env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_DEFAULT_VOICE_ID=your_default_voice_id
ELEVENLABS_DEFAULT_MODEL_ID=eleven_flash_v2_5
```

## 实现方案比较

| 特性 | WebSocket 流式 | HTTP 流式 |
|------|--------------|----------|
| 连接持久性 | 长连接，适合多次请求 | 单次请求 |
| 实时控制 | 支持双向通信，可中断 | 单向流，较难中断 |
| 复杂度 | 中等 | 低 |
| 兼容性 | 需要额外处理旧浏览器 | 广泛支持 |
| 适用场景 | 实时对话，互动应用 | 简单语音播放，一次性请求 |

## WebSocket 流式实现

### 服务端实现

创建 WebSocket 服务端接口处理语音流式生成：

```typescript
// server/api/elevenlabs/stream/ws.ts
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { defineEventHandler, getRequestURL } from 'h3'
import fetch from 'node-fetch'

// 活动连接存储
const activeConnections = new Map()

// 定义错误响应
function createErrorResponse(id: string, message: string) {
  return JSON.stringify({
    type: 'error',
    id,
    message
  })
}

// 创建 WebSocket 服务器
const httpServer = createServer()
const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws, req) => {
  const connectionId = req.headers['sec-websocket-key'] || Date.now().toString()
  
  // 存储连接
  activeConnections.set(connectionId, ws)
  
  console.log(`WebSocket 连接已建立: ${connectionId}`)
  
  // 发送连接成功消息
  ws.send(JSON.stringify({
    type: 'connected',
    id: connectionId,
    message: '已连接到语音流服务'
  }))
  
  // 处理收到的消息
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString())
      
      if (data.type === 'tts_request') {
        const { id, text, voiceId, modelId } = data
        
        if (!text) {
          ws.send(createErrorResponse(id, '缺少文本内容'))
          return
        }
        
        // 获取配置
        const config = useRuntimeConfig()
        const apiKey = config.elevenlabsApiKey
        const defaultVoiceId = config.elevenlabsDefaultVoiceId
        const defaultModelId = config.elevenlabsDefaultModelId || 'eleven_flash_v2_5'
        
        if (!apiKey) {
          ws.send(createErrorResponse(id, 'API 密钥未配置'))
          return
        }
        
        const voice = voiceId || defaultVoiceId
        if (!voice) {
          ws.send(createErrorResponse(id, '未指定声音 ID'))
          return
        }
        
        const model = modelId || defaultModelId
        
        // 发送开始生成消息
        ws.send(JSON.stringify({
          type: 'generation_started',
          id,
          message: '开始生成语音'
        }))
        
        // 调用 ElevenLabs 流式 API
        const streamUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`
        
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          ws.send(createErrorResponse(id, `API 请求失败: ${response.status} ${errorText}`))
          return
        }
        
        // 读取流并发送数据块
        if (!response.body) {
          ws.send(createErrorResponse(id, '无响应数据'))
          return
        }
        
        // 通知客户端流已准备好
        ws.send(JSON.stringify({
          type: 'stream_ready',
          id,
          message: '语音流已准备好'
        }))
        
        // 处理流数据
        for await (const chunk of response.body) {
          // 检查连接是否还存在
          if (ws.readyState !== ws.OPEN) {
            break
          }
          
          // 发送音频块
          ws.send(JSON.stringify({
            type: 'audio_chunk',
            id,
            chunk: Array.from(new Uint8Array(chunk))
          }))
        }
        
        // 发送完成消息
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'generation_completed',
            id,
            message: '语音生成完成'
          }))
        }
      }
    } catch (error: any) {
      console.error('处理 WebSocket 消息错误:', error)
      ws.send(createErrorResponse('unknown', error.message || '处理请求时发生错误'))
    }
  })
  
  // 处理连接关闭
  ws.on('close', () => {
    activeConnections.delete(connectionId)
    console.log(`WebSocket 连接已关闭: ${connectionId}`)
  })
})

// 升级 HTTP 连接到 WebSocket
httpServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

// 启动 HTTP 服务器监听
let serverStarted = false

export default defineEventHandler(async (event) => {
  // 只在首次请求时启动服务器
  if (!serverStarted) {
    const url = getRequestURL(event)
    const port = 3001 // 可以从配置中获取
    
    httpServer.listen(port, () => {
      console.log(`WebSocket 服务器启动在端口 ${port}`)
      serverStarted = true
    })
  }
  
  // 返回 WebSocket URL 供客户端连接
  return {
    message: 'WebSocket 服务器已启动',
    wsUrl: `ws://${event.node.req.headers.host?.split(':')[0] || 'localhost'}:3001`
  }
})
```

### 客户端实现

创建客户端组件处理 WebSocket 连接和音频流播放：

```vue
<!-- components/StreamingTTS.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  voiceId: {
    type: String,
    default: ''
  },
  modelId: {
    type: String,
    default: ''
  },
  autoConnect: {
    type: Boolean,
    default: true
  }
})

const text = ref('')
const status = ref('未连接')
const isConnected = ref(false)
const isGenerating = ref(false)
const error = ref(null)
const wsUrl = ref('')
const audioQueue = ref([])
const currentRequestId = ref('')

// 音频上下文和源节点
let audioContext = null
let audioSource = null
let ws = null

// 初始化 WebSocket
async function initWebSocket() {
  try {
    // 获取 WebSocket URL
    const response = await $fetch('/api/elevenlabs/stream/ws')
    wsUrl.value = response.wsUrl
    
    // 创建 WebSocket 连接
    ws = new WebSocket(wsUrl.value)
    
    ws.onopen = () => {
      isConnected.value = true
      status.value = '已连接'
      error.value = null
    }
    
    ws.onclose = () => {
      isConnected.value = false
      status.value = '已断开连接'
    }
    
    ws.onerror = (e) => {
      error.value = '连接错误'
      console.error('WebSocket 错误:', e)
    }
    
    ws.onmessage = handleWebSocketMessage
  } catch (err) {
    error.value = '初始化错误: ' + (err.message || '未知错误')
    console.error('初始化 WebSocket 错误:', err)
  }
}

// 处理 WebSocket 消息
function handleWebSocketMessage(event) {
  try {
    const data = JSON.parse(event.data)
    
    switch (data.type) {
      case 'connected':
        status.value = '已连接，准备就绪'
        break
        
      case 'generation_started':
        if (data.id === currentRequestId.value) {
          status.value = '正在生成语音...'
          isGenerating.value = true
          // 重置音频队列
          audioQueue.value = []
        }
        break
        
      case 'stream_ready':
        if (data.id === currentRequestId.value) {
          status.value = '语音流准备就绪，开始接收音频...'
          
          // 初始化音频上下文
          if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
          }
        }
        break
        
      case 'audio_chunk':
        if (data.id === currentRequestId.value) {
          // 将接收到的音频数据添加到队列
          const chunk = new Uint8Array(data.chunk)
          audioQueue.value.push(chunk)
          
          // 如果是第一个块，开始播放
          if (audioQueue.value.length === 1) {
            playNextAudioChunk()
          }
        }
        break
        
      case 'generation_completed':
        if (data.id === currentRequestId.value) {
          status.value = '语音生成完成'
          isGenerating.value = false
        }
        break
        
      case 'error':
        error.value = data.message || '发生错误'
        status.value = '错误'
        isGenerating.value = false
        break
    }
  } catch (err) {
    console.error('处理 WebSocket 消息错误:', err)
    error.value = '处理消息错误'
  }
}

// 播放下一个音频块
async function playNextAudioChunk() {
  if (!audioQueue.value.length || !audioContext) return
  
  try {
    const chunk = audioQueue.value[0]
    
    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(chunk.buffer.slice(0))
    
    // 创建音频源
    audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)
    
    // 播放完成后，移除已播放的块并播放下一个
    audioSource.onended = () => {
      audioQueue.value.shift()
      
      if (audioQueue.value.length > 0) {
        playNextAudioChunk()
      }
    }
    
    // 开始播放
    audioSource.start(0)
  } catch (err) {
    console.error('播放音频块错误:', err)
    // 出错时跳过当前块，尝试下一个
    audioQueue.value.shift()
    
    if (audioQueue.value.length > 0) {
      playNextAudioChunk()
    }
  }
}

// 发送文本到语音请求
function generateSpeech() {
  if (!ws || ws.readyState !== WebSocket.OPEN || !text.value.trim()) {
    return
  }
  
  try {
    // 生成请求 ID
    currentRequestId.value = Date.now().toString()
    
    // 发送请求
    ws.send(JSON.stringify({
      type: 'tts_request',
      id: currentRequestId.value,
      text: text.value,
      voiceId: props.voiceId,
      modelId: props.modelId
    }))
    
    // 更新状态
    status.value = '发送请求...'
    error.value = null
  } catch (err) {
    console.error('发送请求错误:', err)
    error.value = '发送请求失败: ' + (err.message || '未知错误')
  }
}

// 停止当前播放
function stopPlayback() {
  if (audioSource) {
    try {
      audioSource.stop()
    } catch (e) {
      // 忽略已经停止的错误
    }
  }
  
  // 清空队列
  audioQueue.value = []
  isGenerating.value = false
  status.value = '已停止'
}

// 连接 WebSocket
function connect() {
  if (!isConnected.value) {
    initWebSocket()
  }
}

// 断开 WebSocket 连接
function disconnect() {
  if (ws) {
    ws.close()
    ws = null
  }
  
  stopPlayback()
  isConnected.value = false
  status.value = '已断开连接'
}

// 组件挂载时自动连接
onMounted(() => {
  if (props.autoConnect) {
    initWebSocket()
  }
})

// 组件卸载前断开连接
onBeforeUnmount(() => {
  disconnect()
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})

// 导出方法供父组件使用
defineExpose({
  connect,
  disconnect,
  generateSpeech,
  stopPlayback
})
</script>

<template>
  <div class="streaming-tts">
    <div class="connection-status">
      <div class="status">
        状态: <span :class="{ 'text-green-500': isConnected, 'text-red-500': !isConnected }">{{ status }}</span>
      </div>
      
      <div class="controls">
        <button 
          @click="connect" 
          :disabled="isConnected"
          class="px-3 py-1 bg-blue-500 text-white rounded mr-2"
          :class="{ 'opacity-50 cursor-not-allowed': isConnected }"
        >
          连接
        </button>
        
        <button 
          @click="disconnect" 
          :disabled="!isConnected"
          class="px-3 py-1 bg-red-500 text-white rounded"
          :class="{ 'opacity-50 cursor-not-allowed': !isConnected }"
        >
          断开
        </button>
      </div>
    </div>
    
    <div class="mt-4">
      <textarea
        v-model="text"
        class="w-full p-2 border rounded"
        rows="4"
        placeholder="输入要转换为语音的文本..."
        :disabled="!isConnected || isGenerating"
      ></textarea>
    </div>
    
    <div class="mt-2 flex space-x-2">
      <button
        @click="generateSpeech"
        :disabled="!isConnected || !text.trim() || isGenerating"
        class="px-4 py-2 bg-green-500 text-white rounded flex-grow"
        :class="{ 'opacity-50 cursor-not-allowed': !isConnected || !text.trim() || isGenerating }"
      >
        {{ isGenerating ? '生成中...' : '生成语音' }}
      </button>
      
      <button
        v-if="isGenerating"
        @click="stopPlayback"
        class="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        停止
      </button>
    </div>
    
    <div v-if="error" class="mt-2 text-red-500">
      错误: {{ error }}
    </div>
  </div>
</template>
```

## HTTP 流式实现

### 服务端实现

创建 HTTP 流式接口：

```typescript
// server/api/elevenlabs/stream/http.ts
import { defineEventHandler, readBody, createError, appendResponseHeader, sendStream } from 'h3'
import { Readable } from 'node:stream'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { text, voiceId, modelId } = body
    
    if (!text) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少文本内容'
      })
    }
    
    // 获取配置
    const config = useRuntimeConfig()
    const apiKey = config.elevenlabsApiKey
    const defaultVoiceId = config.elevenlabsDefaultVoiceId
    const defaultModelId = config.elevenlabsDefaultModelId || 'eleven_flash_v2_5'
    
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'API 密钥未配置'
      })
    }
    
    const voice = voiceId || defaultVoiceId
    if (!voice) {
      throw createError({
        statusCode: 400,
        statusMessage: '未指定声音 ID'
      })
    }
    
    const model = modelId || defaultModelId
    
    // 调用 ElevenLabs 流式 API
    const streamUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`
    
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw createError({
        statusCode: response.status,
        statusMessage: `API 请求失败: ${errorText}`
      })
    }
    
    // 设置响应头
    appendResponseHeader(event, 'Content-Type', 'audio/mpeg')
    appendResponseHeader(event, 'Transfer-Encoding', 'chunked')
    
    // 流式发送响应
    if (!response.body) {
      throw createError({
        statusCode: 500,
        statusMessage: '无响应数据'
      })
    }
    
    // 将 fetch 响应流转换为 Node.js 可读流
    const readable = Readable.fromWeb(response.body)
    return sendStream(event, readable)
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '处理请求时发生错误'
    })
  }
})
```

### 客户端实现

创建客户端 HTTP 流式组件：

```vue
<!-- components/HttpStreamingTTS.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  voiceId: {
    type: String,
    default: ''
  },
  modelId: {
    type: String,
    default: ''
  }
})

const text = ref('')
const status = ref('就绪')
const isGenerating = ref(false)
const error = ref(null)
const audioElement = ref(null)

// 生成并播放语音
async function generateSpeech() {
  if (!text.value.trim() || isGenerating.value) {
    return
  }
  
  try {
    isGenerating.value = true
    status.value = '正在请求...'
    error.value = null
    
    // 创建请求数据
    const requestData = {
      text: text.value,
      voiceId: props.voiceId,
      modelId: props.modelId
    }
    
    // 创建请求 URL
    const url = `/api/elevenlabs/stream/http`
    
    // 创建 fetch 请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`请求失败: ${response.status} ${errorText}`)
    }
    
    // 获取流式响应
    status.value = '接收音频...'
    
    // 使用响应流创建 Blob
    const reader = response.body.getReader()
    const chunks = []
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      chunks.push(value)
    }
    
    // 合并所有块创建 Blob
    const blob = new Blob(chunks, { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(blob)
    
    // 设置音频元素源
    if (audioElement.value) {
      audioElement.value.src = audioUrl
      audioElement.value.oncanplaythrough = () => {
        status.value = '准备播放'
        audioElement.value.play()
          .then(() => {
            status.value = '正在播放'
          })
          .catch(err => {
            console.error('播放错误:', err)
            status.value = '播放失败'
            error.value = '播放音频失败: ' + (err.message || '未知错误')
          })
      }
      
      audioElement.value.onended = () => {
        status.value = '播放完成'
        URL.revokeObjectURL(audioUrl)
      }
      
      audioElement.value.onerror = (err) => {
        console.error('音频错误:', err)
        status.value = '音频错误'
        error.value = '音频加载失败'
        URL.revokeObjectURL(audioUrl)
      }
    }
  } catch (err) {
    console.error('生成语音错误:', err)
    error.value = '生成失败: ' + (err.message || '未知错误')
    status.value = '错误'
  } finally {
    isGenerating.value = false
  }
}

// 停止播放
function stopPlayback() {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    status.value = '已停止'
  }
}

// 组件卸载前清理
onBeforeUnmount(() => {
  stopPlayback()
})

// 导出方法供父组件使用
defineExpose({
  generateSpeech,
  stopPlayback
})
</script>

<template>
  <div class="http-streaming-tts">
    <div class="status-display">
      状态: <span :class="{ 'text-green-500': status === '正在播放', 'text-red-500': status === '错误' }">{{ status }}</span>
    </div>
    
    <div class="mt-4">
      <textarea
        v-model="text"
        class="w-full p-2 border rounded"
        rows="4"
        placeholder="输入要转换为语音的文本..."
        :disabled="isGenerating"
      ></textarea>
    </div>
    
    <div class="mt-2 flex space-x-2">
      <button
        @click="generateSpeech"
        :disabled="!text.trim() || isGenerating"
        class="px-4 py-2 bg-green-500 text-white rounded flex-grow"
        :class="{ 'opacity-50 cursor-not-allowed': !text.trim() || isGenerating }"
      >
        {{ isGenerating ? '处理中...' : '生成语音' }}
      </button>
      
      <button
        @click="stopPlayback"
        :disabled="!audioElement?.src"
        class="px-4 py-2 bg-yellow-500 text-white rounded"
        :class="{ 'opacity-50 cursor-not-allowed': !audioElement?.src }"
      >
        停止
      </button>
    </div>
    
    <div v-if="error" class="mt-2 text-red-500">
      错误: {{ error }}
    </div>
    
    <audio ref="audioElement" class="w-full mt-4" controls hidden></audio>
  </div>
</template>
```

## 使用示例

创建一个页面集成这两种流式方式：

```vue
<!-- pages/streaming-demo.vue -->
<script setup>
import { ref } from 'vue'

const activeTab = ref('websocket')
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">ElevenLabs 语音流式生成演示</h1>
    
    <div class="tabs mb-4">
      <button 
        @click="activeTab = 'websocket'" 
        class="px-4 py-2 mr-2 rounded-t"
        :class="activeTab === 'websocket' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
      >
        WebSocket 流式
      </button>
      
      <button 
        @click="activeTab = 'http'" 
        class="px-4 py-2 rounded-t"
        :class="activeTab === 'http' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
      >
        HTTP 流式
      </button>
    </div>
    
    <div class="tab-content p-4 border rounded">
      <StreamingTTS v-if="activeTab === 'websocket'" />
      <HttpStreamingTTS v-else-if="activeTab === 'http'" />
    </div>
    
    <div class="mt-6 p-4 bg-gray-100 rounded text-sm">
      <h2 class="font-bold mb-2">性能优化技巧：</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>对于长文本，将文本分段处理可以提高响应速度</li>
        <li>WebSocket 方式适合需要多次生成的场景，可以复用连接</li>
        <li>HTTP 流式适合简单的一次性请求</li>
        <li>移动设备上可能需要用户交互才能播放音频</li>
        <li>考虑添加缓存机制，避免重复请求相同文本</li>
      </ul>
    </div>
  </div>
</template>
```

## 性能优化与注意事项

### 跨域问题

如果前端与服务端部署在不同域名下，需要处理跨域问题：

```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, xi-api-key'
  })
  
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})
```

### 服务器负载

WebSocket 服务需要考虑连接数和服务器负载，增加以下限制：

```typescript
// 连接数限制
const MAX_CONNECTIONS = 100
// ...

wss.on('connection', (ws, req) => {
  // 检查连接数
  if (wss.clients.size > MAX_CONNECTIONS) {
    ws.close(1013, '连接数超出限制')
    return
  }
  
  // ... 其余代码
})
```

### 浏览器兼容性

对于较旧浏览器，提供兼容性检查：

```javascript
// 客户端检查 WebSocket 支持
function checkWebSocketSupport() {
  if (typeof WebSocket === 'undefined') {
    return {
      supported: false,
      message: '您的浏览器不支持 WebSocket，请使用 HTTP 流式或更新浏览器'
    }
  }
  return { supported: true }
}

// 检查 AudioContext 支持
function checkAudioSupport() {
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    return {
      supported: false,
      message: '您的浏览器不支持 Web Audio API，可能无法播放流式音频'
    }
  }
  return { supported: true }
}
```

### 移动设备兼容性

在移动设备上，音频播放通常需要用户交互才能开始，添加必要处理：

```javascript
// 移动设备音频初始化
function initMobileAudio() {
  // 在用户交互时初始化音频上下文
  document.addEventListener('touchstart', () => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
  }, { once: true })
}
```

### API 使用限制

添加节流机制避免过度请求 API：

```typescript
// 客户端节流
import { useThrottleFn } from '@vueuse/core'

// 节流包装的生成函数
const throttledGenerate = useThrottleFn(() => {
  generateSpeech()
}, 1000) // 1秒内只能调用一次
```

## 参考资源

- [ElevenLabs 官方流式 API 文档](https://docs.elevenlabs.io/api-reference/streaming)
- [WebSocket 规范](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Nuxt 服务器 API 文档](https://nuxt.com/docs/guide/directory-structure/server)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) 