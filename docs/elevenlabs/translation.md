# ElevenLabs 文本翻译功能集成指南

本文档介绍如何在 Nuxt 应用中集成 ElevenLabs 的文本翻译功能，实现多语言文本转换和语音合成。

## 功能简介

ElevenLabs 提供了强大的翻译 API，可以将文本从一种语言翻译成另一种语言，并支持生成翻译后语言的语音。主要特点：

- 支持 29 种语言的互译
- 保留原文的情感和语调
- 可以直接获取翻译后的文本
- 支持将翻译结果直接转为语音输出
- 可用于实时翻译和语音合成

## 环境配置

确保已配置 ElevenLabs API 相关环境变量：

```bash
# .env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_DEFAULT_VOICE_ID=your_default_voice_id
ELEVENLABS_DEFAULT_MODEL_ID=eleven_flash_v2_5
```

## 翻译 API 集成

### 服务端实现

创建翻译 API 服务端接口：

```typescript
// server/api/elevenlabs/translate.ts
import { defineEventHandler, readBody, createError } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      text, 
      sourceLanguage, 
      targetLanguage, 
      voiceId, 
      modelId, 
      outputFormat = 'text',
      voiceSettings
    } = body
    
    if (!text) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少文本内容'
      })
    }
    
    if (!targetLanguage) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少目标语言'
      })
    }
    
    // 获取配置
    const config = useRuntimeConfig()
    const apiKey = config.elevenlabsApiKey
    
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'API 密钥未配置'
      })
    }
    
    // 构建请求数据
    const requestData: any = {
      text,
      target_language: targetLanguage
    }
    
    // 添加可选参数
    if (sourceLanguage) {
      requestData.source_language = sourceLanguage
    }
    
    // 不同输出格式的处理
    let endpoint = 'https://api.elevenlabs.io/v1/translation'
    
    // 如果需要语音输出
    if (outputFormat === 'audio') {
      endpoint = 'https://api.elevenlabs.io/v1/translation/speech'
      
      const voice = voiceId || config.elevenlabsDefaultVoiceId
      if (!voice) {
        throw createError({
          statusCode: 400,
          statusMessage: '未指定声音 ID'
        })
      }
      
      requestData.voice_id = voice
      requestData.model_id = modelId || config.elevenlabsDefaultModelId || 'eleven_flash_v2_5'
      
      if (voiceSettings) {
        requestData.voice_settings = voiceSettings
      }
    }
    
    // 发送 API 请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw createError({
        statusCode: response.status,
        statusMessage: `API 请求失败: ${errorText}`
      })
    }
    
    // 根据输出格式处理响应
    if (outputFormat === 'audio') {
      // 返回音频数据的 Buffer
      const buffer = await response.arrayBuffer()
      return Buffer.from(buffer)
    } else {
      // 返回文本翻译结果
      const result = await response.json()
      return {
        translation: result.translation
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '处理请求时发生错误'
    })
  }
})
```

### 前端实现

创建翻译功能的 Composable 函数：

```typescript
// composables/useElevenLabsTranslation.ts
export function useElevenLabsTranslation() {
  // 支持的语言列表
  const supportedLanguages = [
    { code: 'en', name: '英语 (English)' },
    { code: 'ar', name: '阿拉伯语 (Arabic)' },
    { code: 'cs', name: '捷克语 (Czech)' },
    { code: 'da', name: '丹麦语 (Danish)' },
    { code: 'nl', name: '荷兰语 (Dutch)' },
    { code: 'fi', name: '芬兰语 (Finnish)' },
    { code: 'fr', name: '法语 (French)' },
    { code: 'de', name: '德语 (German)' },
    { code: 'hi', name: '印地语 (Hindi)' },
    { code: 'hu', name: '匈牙利语 (Hungarian)' },
    { code: 'id', name: '印尼语 (Indonesian)' },
    { code: 'it', name: '意大利语 (Italian)' },
    { code: 'ja', name: '日语 (Japanese)' },
    { code: 'ko', name: '韩语 (Korean)' },
    { code: 'no', name: '挪威语 (Norwegian)' },
    { code: 'pl', name: '波兰语 (Polish)' },
    { code: 'pt', name: '葡萄牙语 (Portuguese)' },
    { code: 'ro', name: '罗马尼亚语 (Romanian)' },
    { code: 'ru', name: '俄语 (Russian)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'sk', name: '斯洛伐克语 (Slovak)' },
    { code: 'es', name: '西班牙语 (Spanish)' },
    { code: 'sv', name: '瑞典语 (Swedish)' },
    { code: 'tr', name: '土耳其语 (Turkish)' },
    { code: 'uk', name: '乌克兰语 (Ukrainian)' },
    { code: 'bg', name: '保加利亚语 (Bulgarian)' },
    { code: 'el', name: '希腊语 (Greek)' },
    { code: 'he', name: '希伯来语 (Hebrew)' },
    { code: 'ur', name: '乌尔都语 (Urdu)' }
  ]
  
  // 翻译文本
  const translateText = async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ) => {
    try {
      const response = await $fetch('/api/elevenlabs/translate', {
        method: 'POST',
        body: {
          text,
          targetLanguage,
          sourceLanguage,
          outputFormat: 'text'
        }
      })
      
      return response.translation
    } catch (error: any) {
      console.error('翻译失败:', error)
      throw new Error(error.message || '翻译请求失败')
    }
  }
  
  // 翻译并生成语音
  const translateAndSpeak = async (
    text: string,
    targetLanguage: string,
    voiceId?: string,
    modelId?: string,
    sourceLanguage?: string,
    voiceSettings?: {
      stability?: number,
      similarity_boost?: number,
      style?: number,
      use_speaker_boost?: boolean
    }
  ) => {
    try {
      const response = await $fetch('/api/elevenlabs/translate', {
        method: 'POST',
        body: {
          text,
          targetLanguage,
          sourceLanguage,
          voiceId,
          modelId,
          outputFormat: 'audio',
          voiceSettings
        },
        responseType: 'blob'
      })
      
      // 创建音频 URL
      const audioBlob = new Blob([response], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      return {
        audioUrl,
        play: () => {
          const audio = new Audio(audioUrl)
          audio.play()
          
          // 清理
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
          }
          
          return audio
        },
        cleanup: () => {
          URL.revokeObjectURL(audioUrl)
        }
      }
    } catch (error: any) {
      console.error('翻译语音生成失败:', error)
      throw new Error(error.message || '翻译语音生成请求失败')
    }
  }
  
  // 检测语言
  const detectLanguage = async (text: string) => {
    // ElevenLabs 目前不提供语言检测 API，使用简单启发式方法
    // 实际项目中可以接入专门的语言检测服务
    const languagePatterns = {
      zh: /[\u4e00-\u9fff]/g,
      ja: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g,
      ko: /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/g,
      ru: /[\u0400-\u04FF]/g,
      ar: /[\u0600-\u06FF\u0750-\u077F]/g,
      hi: /[\u0900-\u097F]/g,
      el: /[\u0370-\u03FF\u1F00-\u1FFF]/g,
      he: /[\u0590-\u05FF]/g
    }
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang
      }
    }
    
    // 默认假设为英语
    return 'en'
  }
  
  return {
    supportedLanguages,
    translateText,
    translateAndSpeak,
    detectLanguage
  }
}
```

## 翻译组件

创建用于文本翻译的 Vue 组件：

```vue
<!-- components/TranslationWidget.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useElevenLabsTranslation } from '~/composables/useElevenLabsTranslation'

const props = defineProps({
  initialText: {
    type: String,
    default: ''
  },
  initialSourceLang: {
    type: String,
    default: ''
  },
  initialTargetLang: {
    type: String,
    default: 'en'
  },
  showAudioControls: {
    type: Boolean,
    default: true
  },
  voiceId: {
    type: String,
    default: ''
  },
  modelId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['translation-complete', 'error'])

const { supportedLanguages, translateText, translateAndSpeak, detectLanguage } = useElevenLabsTranslation()

const sourceText = ref(props.initialText)
const sourceLang = ref(props.initialSourceLang)
const targetLang = ref(props.initialTargetLang)
const translatedText = ref('')
const isTranslating = ref(false)
const isGeneratingAudio = ref(false)
const currentAudio = ref(null)
const error = ref(null)
const audioUrl = ref('')

// 自动检测源语言
const detectSource = async () => {
  if (!sourceText.value) return
  sourceLang.value = await detectLanguage(sourceText.value)
}

// 翻译文本
const translate = async () => {
  if (!sourceText.value || !targetLang.value) return
  
  error.value = null
  isTranslating.value = true
  
  try {
    // 如果未指定源语言，尝试检测
    if (!sourceLang.value) {
      await detectSource()
    }
    
    translatedText.value = await translateText(
      sourceText.value,
      targetLang.value,
      sourceLang.value || undefined
    )
    
    emit('translation-complete', {
      sourceText: sourceText.value,
      translatedText: translatedText.value,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value
    })
  } catch (err) {
    error.value = err.message || '翻译失败'
    emit('error', error.value)
  } finally {
    isTranslating.value = false
  }
}

// 生成并播放翻译后的语音
const generateAudio = async () => {
  if (!translatedText.value || !targetLang.value) return
  
  error.value = null
  isGeneratingAudio.value = true
  
  try {
    // 如果有正在播放的音频，停止播放
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
    }
    
    // 如果有之前的 URL，清理
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = ''
    }
    
    const result = await translateAndSpeak(
      sourceText.value,
      targetLang.value,
      props.voiceId,
      props.modelId,
      sourceLang.value || undefined
    )
    
    audioUrl.value = result.audioUrl
    currentAudio.value = result.play()
  } catch (err) {
    error.value = err.message || '生成语音失败'
    emit('error', error.value)
  } finally {
    isGeneratingAudio.value = false
  }
}

// 停止当前音频播放
const stopAudio = () => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
  }
}

// 在组件销毁时清理资源
onBeforeUnmount(() => {
  stopAudio()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

// 交换源语言和目标语言
const swapLanguages = () => {
  if (translatedText.value) {
    const temp = sourceText.value
    sourceText.value = translatedText.value
    translatedText.value = temp
    
    const tempLang = sourceLang.value
    sourceLang.value = targetLang.value
    targetLang.value = tempLang
  }
}

// 获取语言显示名称
const getLanguageName = (code) => {
  const language = supportedLanguages.find(lang => lang.code === code)
  return language ? language.name : code
}

// 导出组件方法
defineExpose({
  translate,
  generateAudio,
  stopAudio,
  swapLanguages
})
</script>

<template>
  <div class="translation-widget">
    <div class="grid gap-4 md:grid-cols-2">
      <!-- 源语言 -->
      <div class="source-section">
        <div class="flex items-center justify-between mb-2">
          <select 
            v-model="sourceLang"
            class="p-2 border rounded"
          >
            <option value="">自动检测</option>
            <option v-for="lang in supportedLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
          
          <button 
            @click="detectSource" 
            class="px-3 py-1 text-xs border rounded"
            :disabled="!sourceText"
          >
            检测语言
          </button>
        </div>
        
        <textarea
          v-model="sourceText"
          class="w-full p-3 border rounded h-40"
          placeholder="输入要翻译的文本..."
        ></textarea>
      </div>
      
      <!-- 目标语言 -->
      <div class="target-section">
        <div class="flex items-center justify-between mb-2">
          <select 
            v-model="targetLang"
            class="p-2 border rounded"
            required
          >
            <option v-for="lang in supportedLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
          
          <button 
            @click="swapLanguages" 
            class="px-3 py-1 border rounded"
            :disabled="!translatedText"
            title="交换语言"
          >
            ⇄
          </button>
        </div>
        
        <textarea
          v-model="translatedText"
          class="w-full p-3 border rounded h-40"
          placeholder="翻译结果将显示在这里..."
          readonly
        ></textarea>
      </div>
    </div>
    
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        @click="translate"
        class="px-4 py-2 bg-blue-500 text-white rounded"
        :disabled="isTranslating || !sourceText"
        :class="{ 'opacity-50': isTranslating || !sourceText }"
      >
        {{ isTranslating ? '翻译中...' : '翻译' }}
      </button>
      
      <button
        v-if="showAudioControls"
        @click="generateAudio"
        class="px-4 py-2 bg-green-500 text-white rounded"
        :disabled="isGeneratingAudio || !translatedText"
        :class="{ 'opacity-50': isGeneratingAudio || !translatedText }"
      >
        {{ isGeneratingAudio ? '生成中...' : '播放翻译语音' }}
      </button>
      
      <button
        v-if="showAudioControls && currentAudio"
        @click="stopAudio"
        class="px-4 py-2 bg-red-500 text-white rounded"
      >
        停止播放
      </button>
    </div>
    
    <div v-if="error" class="mt-2 p-2 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>
```

## 使用示例

创建一个示例页面，展示翻译功能的使用：

```vue
<!-- pages/translation-demo.vue -->
<script setup>
import { ref } from 'vue'

const translationResult = ref(null)
const handleTranslationComplete = (result) => {
  translationResult.value = result
}

const handleError = (error) => {
  console.error('翻译错误:', error)
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">ElevenLabs 翻译演示</h1>
    
    <TranslationWidget
      initial-target-lang="zh"
      @translation-complete="handleTranslationComplete"
      @error="handleError"
    />
    
    <div v-if="translationResult" class="mt-8 p-4 bg-gray-100 rounded">
      <h2 class="font-bold mb-2">翻译结果详情：</h2>
      <p><strong>源语言:</strong> {{ translationResult.sourceLang }}</p>
      <p><strong>目标语言:</strong> {{ translationResult.targetLang }}</p>
      <p><strong>原文:</strong> {{ translationResult.sourceText }}</p>
      <p><strong>译文:</strong> {{ translationResult.translatedText }}</p>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">使用提示</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li>选择"自动检测"可以让系统自动判断输入文本的语言</li>
        <li>点击"检测语言"按钮可以手动触发语言检测</li>
        <li>使用语言交换按钮(⇄)可以在源语言和目标语言之间快速切换</li>
        <li>"播放翻译语音"按钮将使用 ElevenLabs 的语音合成功能朗读翻译后的文本</li>
        <li>翻译质量可能因语言对和文本长度而异</li>
      </ul>
    </div>
  </div>
</template>
```

## 注意事项与最佳实践

### 翻译 API 限制

1. **字符限制**：ElevenLabs 翻译 API 可能对单次请求的文本长度有限制，对于长文本，考虑分段处理。

2. **请求频率**：注意 API 调用频率限制，实现节流或限流机制避免超出配额。

3. **支持语言**：确保使用支持的语言代码，不支持的语言可能导致翻译失败。

### 性能优化

1. **缓存翻译结果**：对于频繁翻译的相同内容，实现缓存机制：

```typescript
// 简单的翻译缓存实现
const translationCache = new Map()

const getCacheKey = (text, sourceLang, targetLang) => 
  `${text}|${sourceLang || 'auto'}|${targetLang}`

const getFromCache = (text, sourceLang, targetLang) => {
  const key = getCacheKey(text, sourceLang, targetLang)
  return translationCache.get(key)
}

const saveToCache = (text, sourceLang, targetLang, translation) => {
  const key = getCacheKey(text, sourceLang, targetLang)
  translationCache.set(key, translation)
}
```

2. **延迟翻译**：对于用户输入，使用防抖动实现延迟翻译，避免频繁 API 调用：

```typescript
import { debounce } from 'lodash-es'

// 延迟 500ms 执行翻译
const debouncedTranslate = debounce(() => {
  translate()
}, 500)
```

### 错误处理

实现完善的错误处理和重试机制：

```typescript
// 带重试的翻译请求
const translateWithRetry = async (text, targetLang, sourceLang, maxRetries = 3) => {
  let retries = 0
  
  while (retries < maxRetries) {
    try {
      return await translateText(text, targetLang, sourceLang)
    } catch (error) {
      retries++
      
      // 如果是最后一次尝试，抛出错误
      if (retries === maxRetries) {
        throw error
      }
      
      // 等待时间递增，实现退避策略
      await new Promise(resolve => setTimeout(resolve, 1000 * retries))
    }
  }
}
```

### 安全考虑

1. **API 密钥保护**：确保 API 密钥只在服务端使用，避免暴露给客户端。

2. **输入验证**：实施输入验证和清理，避免恶意输入。

```typescript
// 简单的输入验证
const validateInput = (text) => {
  if (!text || text.length > 5000) {
    throw new Error('文本长度必须在 1-5000 字符之间')
  }
  
  // 移除潜在的 XSS 或危险字符
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
```

## 高级功能

### 批量翻译

对多段文本进行批量翻译的辅助函数：

```typescript
// 批量翻译函数
const batchTranslate = async (
  texts: string[],
  targetLanguage: string,
  sourceLanguage?: string
) => {
  const results = []
  
  for (const text of texts) {
    try {
      const translation = await translateText(text, targetLanguage, sourceLanguage)
      results.push({
        original: text,
        translation,
        success: true
      })
    } catch (error) {
      results.push({
        original: text,
        error: error.message,
        success: false
      })
    }
  }
  
  return results
}
```

### 语言自动检测增强

增强语言检测的准确性：

```typescript
// 更准确的语言检测
const enhancedLanguageDetection = (text) => {
  // 1. 检查特定字符集
  const languagePatterns = {
    // ... 现有模式 ...
  }
  
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    // 如果匹配字符占比超过 30%，可能是该语言
    const matches = text.match(pattern) || []
    if (matches.length > 0 && matches.join('').length / text.length > 0.3) {
      return lang
    }
  }
  
  // 2. 词汇特征检测
  const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'that']
  const spanishWords = ['el', 'la', 'es', 'en', 'y', 'de', 'que']
  const frenchWords = ['le', 'la', 'est', 'en', 'et', 'de', 'que']
  
  const words = text.toLowerCase().split(/\s+/)
  
  const englishMatches = words.filter(w => englishWords.includes(w)).length
  const spanishMatches = words.filter(w => spanishWords.includes(w)).length
  const frenchMatches = words.filter(w => frenchWords.includes(w)).length
  
  if (englishMatches > spanishMatches && englishMatches > frenchMatches) {
    return 'en'
  } else if (spanishMatches > englishMatches && spanishMatches > frenchMatches) {
    return 'es'
  } else if (frenchMatches > englishMatches && frenchMatches > spanishMatches) {
    return 'fr'
  }
  
  // 默认返回英语
  return 'en'
}
```

## 参考资源

- [ElevenLabs 翻译 API 文档](https://docs.elevenlabs.io/api-reference/translation)
- [支持的语言列表](https://help.elevenlabs.io/hc/en-us/articles/15695690247057-What-languages-does-ElevenLabs-support-)
- [Nuxt Fetch API](https://nuxt.com/docs/api/composables/use-fetch)
- [音频 Web API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API) 