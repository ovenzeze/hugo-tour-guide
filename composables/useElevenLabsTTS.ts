import { ref, computed } from 'vue'
import type { Voice } from '~/types/voice'
import { getDefaultVoice, findVoiceById } from '~/config/elevenlabs'

interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export function useElevenLabsTTS() {
  const audioUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const audioData = ref<Blob | null>(null) // 添加一个新的 ref 存储原始音频数据
  const currentVoiceConfig = ref<Voice.Config | null>(null)

  // 使用预设配置生成声音
  const generateWithVoiceConfig = async (text: string, voiceConfig: Voice.Config) => {
    currentVoiceConfig.value = voiceConfig
    
    return generateTTS(text, {
      voiceId: voiceConfig.id,
      modelId: voiceConfig.modelId,
      voiceSettings: voiceConfig.settings ? {
        ...voiceConfig.settings,
        stability: voiceConfig.settings.stability ?? 0.5,
        similarity_boost: voiceConfig.settings.similarity_boost ?? 0.75
      } : undefined
    })
  }
  
  // 使用声音ID生成，自动加载预设配置
  const generateWithVoiceId = async (text: string, voiceId: string) => {
    const voiceConfig = findVoiceById(voiceId)
    
    if (voiceConfig) {
      return generateWithVoiceConfig(text, voiceConfig)
    } else {
      // 如果没找到预设配置，则使用基本的ID调用
      return generateTTS(text, { voiceId })
    }
  }
  
  // 默认声音生成
  const generateWithDefaultVoice = async (text: string) => {
    const defaultVoice = getDefaultVoice()
    return generateWithVoiceConfig(text, defaultVoice)
  }

  const generateTTS = async (text: string, options: TTSOptions = {}) => {
    isLoading.value = true
    error.value = null
    
    // 先清理旧的资源
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = null
    }
    audioData.value = null

    if (!text) {
      error.value = '文本不能为空'
      isLoading.value = false
      return
    }

    try {
      console.log(`[useElevenLabsTTS] 发送 TTS 请求，文本长度: ${text.length}`)
      
      // 调用服务端 API
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          ...options, // 包含 voiceId, modelId, voiceSettings
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => null)
        const errorData = errorText ? JSON.parse(errorText) : null
        throw new Error(errorData?.statusMessage || `语音生成失败: ${response.statusText} (状态码: ${response.status})`)
      }

      console.log('[useElevenLabsTTS] 响应头:', {
        type: response.headers.get('Content-Type'),
        size: response.headers.get('Content-Length') || '未知'
      })

      try {
        // 将 ArrayBuffer 转换为 Blob
        const audioBlob = await response.blob()
        
        // 记录关于 blob 的信息
        console.log('[useElevenLabsTTS] 收到音频 blob:', {
          size: audioBlob.size, 
          type: audioBlob.type || 'unknown'
        })
        
        if (audioBlob.size < 100) {
          throw new Error(`收到的音频数据过小 (${audioBlob.size} 字节)，可能不是有效的音频文件`)
        }
        
        // 保存原始 Blob
        audioData.value = audioBlob
        
        // 创建新的 Blob URL - 确保使用正确的 MIME 类型
        const blobType = audioBlob.type || 'audio/mpeg'
        const blobWithType = new Blob([audioBlob], { type: blobType })
        audioUrl.value = URL.createObjectURL(blobWithType)
        
        console.log('[useElevenLabsTTS] 创建 Blob URL:', audioUrl.value)
      } catch (blobError: any) {
        console.error('[useElevenLabsTTS] Blob 处理错误:', blobError)
        throw new Error(`音频数据处理失败: ${blobError.message}`)
      }

    } catch (err: any) {
      console.error('[useElevenLabsTTS] 错误:', err)
      error.value = err.message || '生成语音时发生未知错误'
      audioUrl.value = null
    } finally {
      isLoading.value = false
    }
  }
  
  // 清理函数，用于在不需要时释放 Blob URL
  const clearAudio = () => {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = null
    }
    audioData.value = null
    currentVoiceConfig.value = null
  }

  return {
    audioUrl,
    audioData,
    isLoading,
    error,
    currentVoiceConfig,
    
    // 基本生成方法
    generateTTS,
    
    // 高级配置方法
    generateWithVoiceConfig,
    generateWithVoiceId,
    generateWithDefaultVoice,
    
    clearAudio
  }
} 