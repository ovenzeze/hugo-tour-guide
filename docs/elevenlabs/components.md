# ElevenLabs 前端组件示例

本文档提供了在 Nuxt 应用中使用 ElevenLabs API 的前端组件示例，包括文字转语音播放器、语音选择器等功能组件。

## TTS 音频播放器

以下是一个基本的文字转语音播放器组件示例，支持文本输入和音频播放：

```vue
<!-- components/ElevenLabsPlayer.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  initialText: {
    type: String,
    default: '欢迎使用 ElevenLabs 文字转语音服务。这是一个示例文本。'
  },
  voiceId: {
    type: String,
    default: () => useRuntimeConfig().public.elevenlabsDefaultVoiceId
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const text = ref(props.initialText)
const isLoading = ref(false)
const isPlaying = ref(false)
const audioSrc = ref('')
const audio = ref<HTMLAudioElement | null>(null)

// 文本长度计数
const textLength = computed(() => text.value.length)

// 生成语音
async function generateSpeech() {
  if (!text.value.trim()) return
  
  isLoading.value = true
  
  try {
    const { data } = await useFetch('/api/elevenlabs/tts', {
      method: 'POST',
      body: {
        text: text.value,
        voiceId: props.voiceId
      },
      responseType: 'blob'
    })
    
    if (data.value) {
      // 创建音频 URL
      const blob = data.value as Blob
      audioSrc.value = URL.createObjectURL(blob)
      
      // 如果设置了自动播放，则播放音频
      if (props.autoplay) {
        playAudio()
      }
    }
  } catch (error) {
    console.error('生成语音失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 播放音频
function playAudio() {
  if (!audioSrc.value) return
  
  if (!audio.value) {
    audio.value = new Audio(audioSrc.value)
    
    // 监听事件
    audio.value.addEventListener('play', () => {
      isPlaying.value = true
    })
    
    audio.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
    
    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }
  
  audio.value.play()
}

// 暂停音频
function pauseAudio() {
  if (audio.value) {
    audio.value.pause()
  }
}

// 组件卸载时释放资源
onBeforeUnmount(() => {
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
  
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value)
  }
})
</script>

<template>
  <div class="elevenlabs-player">
    <div class="text-input">
      <textarea
        v-model="text"
        placeholder="输入要转换为语音的文本..."
        rows="4"
        class="w-full p-2 border rounded-md"
      ></textarea>
      <div class="text-sm text-gray-500 mt-1">
        字符数: {{ textLength }}
      </div>
    </div>
    
    <div class="mt-4 flex items-center space-x-2">
      <button
        @click="generateSpeech"
        class="px-4 py-2 bg-blue-600 text-white rounded-md"
        :disabled="isLoading || !text.trim()"
      >
        <span v-if="isLoading">
          生成中...
        </span>
        <span v-else>
          生成语音
        </span>
      </button>
      
      <button 
        v-if="audioSrc"
        @click="isPlaying ? pauseAudio() : playAudio()"
        class="px-4 py-2 bg-gray-600 text-white rounded-md"
      >
        {{ isPlaying ? '暂停' : '播放' }}
      </button>
    </div>
    
    <audio v-if="audioSrc" :src="audioSrc" controls class="mt-4 w-full"></audio>
  </div>
</template>
```

## 语音选择器组件

提供一个用于选择不同语音的组件：

```vue
<!-- components/VoiceSelector.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: () => useRuntimeConfig().public.elevenlabsDefaultVoiceId
  },
  label: {
    type: String,
    default: '选择语音'
  }
})

const emit = defineEmits(['update:modelValue'])

interface Voice {
  voice_id: string
  name: string
  preview_url?: string
  category?: string
  languages?: string[] 
}

const voices = ref<Voice[]>([])
const isLoading = ref(false)
const selectedVoice = ref(props.modelValue)
const previewAudio = ref<HTMLAudioElement | null>(null)

// 获取可用语音列表
async function fetchVoices() {
  isLoading.value = true
  
  try {
    const { data } = await useFetch<{ voices: Voice[] }>('/api/elevenlabs/voices')
    
    if (data.value?.voices) {
      voices.value = data.value.voices
    }
  } catch (error) {
    console.error('获取语音列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 更新选中的语音
function updateVoice(voiceId: string) {
  selectedVoice.value = voiceId
  emit('update:modelValue', voiceId)
}

// 播放预览音频
function playPreview(previewUrl?: string) {
  if (!previewUrl) return
  
  // 暂停当前播放的音频
  if (previewAudio.value) {
    previewAudio.value.pause()
  }
  
  // 创建新的音频元素
  previewAudio.value = new Audio(previewUrl)
  previewAudio.value.play()
}

// 组件挂载时获取语音列表
onMounted(() => {
  fetchVoices()
})

// 组件卸载时释放资源
onBeforeUnmount(() => {
  if (previewAudio.value) {
    previewAudio.value.pause()
    previewAudio.value = null
  }
})
</script>

<template>
  <div class="voice-selector">
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    
    <div v-if="isLoading" class="text-center py-4">
      <span>加载中...</span>
    </div>
    
    <div v-else-if="voices.length === 0" class="text-center py-4">
      <span>没有可用的语音</span>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div 
        v-for="voice in voices" 
        :key="voice.voice_id"
        class="border p-3 rounded-md cursor-pointer"
        :class="{ 'border-blue-500 bg-blue-50': selectedVoice === voice.voice_id }"
        @click="updateVoice(voice.voice_id)"
      >
        <div class="flex justify-between items-center">
          <div>
            <div class="font-medium">{{ voice.name }}</div>
            <div class="text-xs text-gray-500">
              {{ voice.languages?.join(', ') || 'Unknown' }}
            </div>
          </div>
          
          <button 
            v-if="voice.preview_url"
            @click.stop="playPreview(voice.preview_url)"
            class="text-sm text-blue-600"
          >
            试听
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 实时语音交互组件

以下是一个支持实时语音交互的组件示例，适用于虚拟导游等场景：

```vue
<!-- components/VirtualGuide.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps({
  voiceId: {
    type: String,
    default: () => useRuntimeConfig().public.elevenlabsDefaultVoiceId
  },
  modelId: {
    type: String,
    default: () => useRuntimeConfig().public.elevenlabsDefaultModelId || 'eleven_flash_v2_5'
  }
})

interface Message {
  id: string
  text: string
  audioUrl?: string
  isPlaying: boolean
}

const messages = ref<Message[]>([])
const currentInput = ref('')
const isGenerating = ref(false)
const currentAudio = ref<HTMLAudioElement | null>(null)

// 添加消息
function addMessage(text: string) {
  const id = Date.now().toString()
  
  messages.value.push({
    id,
    text,
    isPlaying: false
  })
  
  return id
}

// 生成回复
async function generateReply() {
  if (!currentInput.value.trim()) return
  
  const userText = currentInput.value
  currentInput.value = ''
  
  // 添加用户消息
  addMessage(userText)
  
  // 模拟导游回复
  isGenerating.value = true
  const replyId = addMessage('...')
  
  try {
    // 调用服务端 API 生成语音
    const { data } = await useFetch('/api/elevenlabs/tts', {
      method: 'POST',
      body: {
        text: `这是对"${userText}"的回复。我是您的虚拟导游，很高兴为您服务。`,
        voiceId: props.voiceId,
        modelId: props.modelId
      },
      responseType: 'blob'
    })
    
    if (data.value) {
      // 更新消息内容和音频
      const blob = data.value as Blob
      const audioUrl = URL.createObjectURL(blob)
      
      // 查找并更新消息
      const messageIndex = messages.value.findIndex(m => m.id === replyId)
      if (messageIndex >= 0) {
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          text: `这是对"${userText}"的回复。我是您的虚拟导游，很高兴为您服务。`,
          audioUrl
        }
        
        // 自动播放回复
        playAudio(replyId)
      }
    }
  } catch (error) {
    console.error('生成回复失败:', error)
    
    // 更新消息显示错误
    const messageIndex = messages.value.findIndex(m => m.id === replyId)
    if (messageIndex >= 0) {
      messages.value[messageIndex].text = '抱歉，语音生成失败。'
    }
  } finally {
    isGenerating.value = false
  }
}

// 播放音频
function playAudio(messageId: string) {
  const message = messages.value.find(m => m.id === messageId)
  if (!message || !message.audioUrl) return
  
  // 暂停当前播放的音频
  if (currentAudio.value) {
    currentAudio.value.pause()
    
    // 重置所有消息的播放状态
    messages.value.forEach(m => {
      m.isPlaying = false
    })
  }
  
  // 播放新音频
  currentAudio.value = new Audio(message.audioUrl)
  
  // 设置播放状态
  const index = messages.value.findIndex(m => m.id === messageId)
  if (index >= 0) {
    messages.value[index].isPlaying = true
  }
  
  // 音频播放结束时更新状态
  currentAudio.value.addEventListener('ended', () => {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index >= 0) {
      messages.value[index].isPlaying = false
    }
  })
  
  currentAudio.value.play()
}

// 组件卸载时释放资源
onBeforeUnmount(() => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
  
  // 释放所有音频URL
  messages.value.forEach(message => {
    if (message.audioUrl) {
      URL.revokeObjectURL(message.audioUrl)
    }
  })
})
</script>

<template>
  <div class="virtual-guide">
    <!-- 消息列表 -->
    <div class="messages-container mb-4 h-96 overflow-y-auto border rounded-md p-4">
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-10">
        开始与虚拟导游对话
      </div>
      
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message mb-4"
      >
        <div class="message-text p-3 rounded-lg max-w-3/4 inline-block">
          {{ message.text }}
        </div>
        
        <div v-if="message.audioUrl" class="mt-1">
          <button 
            @click="playAudio(message.id)"
            class="text-sm text-blue-600"
          >
            {{ message.isPlaying ? '暂停' : '播放语音' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-container flex space-x-2">
      <input
        v-model="currentInput"
        type="text"
        placeholder="输入您的问题..."
        class="flex-1 p-2 border rounded-md"
        :disabled="isGenerating"
        @keyup.enter="generateReply"
      />
      
      <button
        @click="generateReply"
        class="px-4 py-2 bg-blue-600 text-white rounded-md"
        :disabled="isGenerating || !currentInput.trim()"
      >
        <span v-if="isGenerating">生成中...</span>
        <span v-else>发送</span>
      </button>
    </div>
  </div>
</template>
```

## 页面示例

以下是一个整合了上述组件的页面示例：

```vue
<!-- pages/elevenlabs-demo.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const selectedVoiceId = ref(useRuntimeConfig().public.elevenlabsDefaultVoiceId)
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">ElevenLabs 语音演示</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：语音选择和基本播放器 -->
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-4">基础功能</h2>
        
        <VoiceSelector v-model="selectedVoiceId" />
        
        <div class="mt-6">
          <ElevenLabsPlayer :voice-id="selectedVoiceId" />
        </div>
      </div>
      
      <!-- 右侧：虚拟导游演示 -->
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-4">虚拟导游演示</h2>
        
        <VirtualGuide :voice-id="selectedVoiceId" />
      </div>
    </div>
  </div>
</template>
```

## 配置 TailwindCSS (可选)

如果您使用 TailwindCSS 作为样式框架，请确保在您的 `tailwind.config.js` 中包含组件目录：

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 使用组合式 API (Composables)

为了更好地重用逻辑，我们可以创建一个组合式函数：

```typescript
// composables/useElevenLabs.ts
import { ref, computed } from 'vue'

export function useElevenLabs() {
  const isLoading = ref(false)
  const audioSrc = ref('')
  const audio = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  
  // 生成语音
  async function generateSpeech(text: string, voiceId?: string, modelId?: string) {
    if (!text.trim()) return null
    
    isLoading.value = true
    
    try {
      const { data } = await useFetch('/api/elevenlabs/tts', {
        method: 'POST',
        body: {
          text,
          voiceId,
          modelId
        },
        responseType: 'blob'
      })
      
      if (data.value) {
        // 释放之前的音频URL
        if (audioSrc.value) {
          URL.revokeObjectURL(audioSrc.value)
        }
        
        // 创建新的音频URL
        const blob = data.value as Blob
        audioSrc.value = URL.createObjectURL(blob)
        
        return audioSrc.value
      }
      
      return null
    } catch (error) {
      console.error('生成语音失败:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // 播放音频
  function playAudio(src?: string) {
    const source = src || audioSrc.value
    if (!source) return
    
    if (audio.value) {
      audio.value.pause()
    }
    
    audio.value = new Audio(source)
    
    audio.value.addEventListener('play', () => {
      isPlaying.value = true
    })
    
    audio.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
    
    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
    
    audio.value.play()
  }
  
  // 暂停音频
  function pauseAudio() {
    if (audio.value) {
      audio.value.pause()
    }
  }
  
  // 组件卸载时清理资源
  function cleanup() {
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
    
    if (audioSrc.value) {
      URL.revokeObjectURL(audioSrc.value)
      audioSrc.value = ''
    }
  }
  
  return {
    isLoading,
    audioSrc,
    isPlaying,
    generateSpeech,
    playAudio,
    pauseAudio,
    cleanup
  }
}
``` 