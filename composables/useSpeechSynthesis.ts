import { ref, onMounted, onBeforeUnmount } from 'vue'

interface UseSpeechSynthesisOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const isSupported = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])
  const currentVoice = ref<SpeechSynthesisVoice | null>(null)
  
  // 默认配置
  const defaultOptions = {
    lang: 'zh-CN',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  onMounted(() => {
    // 检查浏览器是否支持语音合成
    if ('speechSynthesis' in window) {
      isSupported.value = true
      
      // 获取可用的语音列表
      loadVoices()
      
      // 如果语音列表初始为空，等待voiceschanged事件
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  })
  
  // 加载语音列表
  function loadVoices() {
    voices.value = window.speechSynthesis.getVoices()
    
    // 设置默认语音为匹配语言的第一个语音
    if (voices.value.length > 0) {
      const matchingVoices = voices.value.filter(voice => voice.lang.startsWith(mergedOptions.lang))
      currentVoice.value = matchingVoices.length > 0 ? matchingVoices[0] : voices.value[0]
    }
  }
  
  // 播放文本
  function speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isSupported.value || !text) {
        reject('语音合成不受支持或文本为空')
        return
      }
      
      // 创建语音合成话语
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 应用设置
      utterance.lang = mergedOptions.lang
      utterance.rate = mergedOptions.rate
      utterance.pitch = mergedOptions.pitch
      utterance.volume = mergedOptions.volume
      
      // 设置语音
      if (currentVoice.value) {
        utterance.voice = currentVoice.value
      }
      
      // 事件处理
      utterance.onstart = () => {
        isSpeaking.value = true
        isPaused.value = false
      }
      
      utterance.onend = () => {
        isSpeaking.value = false
        isPaused.value = false
        resolve()
      }
      
      utterance.onerror = (error) => {
        console.error('语音合成错误:', error)
        isSpeaking.value = false
        isPaused.value = false
        reject(error)
      }
      
      // 在播放前取消所有正在进行的语音
      window.speechSynthesis.cancel()
      
      // 播放
      window.speechSynthesis.speak(utterance)
    })
  }
  
  // 暂停播放
  function pause() {
    if (isSpeaking.value && !isPaused.value) {
      window.speechSynthesis.pause()
      isPaused.value = true
    }
  }
  
  // 恢复播放
  function resume() {
    if (isPaused.value) {
      window.speechSynthesis.resume()
      isPaused.value = false
    }
  }
  
  // 取消当前播放
  function cancel() {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
  }
  
  // 设置语音
  function setVoice(voice: SpeechSynthesisVoice) {
    currentVoice.value = voice
  }
  
  // 更改语速
  function setRate(rate: number) {
    mergedOptions.rate = rate
  }
  
  // 在组件销毁时清理
  onBeforeUnmount(() => {
    if (isSpeaking.value) {
      cancel()
    }
  })
  
  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    currentVoice,
    speak,
    pause,
    resume,
    cancel,
    setVoice,
    setRate
  }
}