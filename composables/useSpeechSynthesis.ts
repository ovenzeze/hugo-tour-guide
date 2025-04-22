import { ref, onMounted, onBeforeUnmount, reactive, watch, readonly } from 'vue'

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
  
  // Default options
  const defaultOptions = {
    lang: 'zh-CN',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  }
  
  // Use reactive for options to handle potential dynamic changes
  const reactiveOptions = reactive({ ...defaultOptions, ...options })

  // Watch for external option changes
  watch(() => options, (newOptions) => {
    Object.assign(reactiveOptions, { ...defaultOptions, ...newOptions })
  }, { deep: true })
  
  // Load voices function
  const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices()
    // Set default voice based on the reactive lang option
    if (voices.value.length > 0) {
      const matchingVoices = voices.value.filter(voice => voice.lang.startsWith(reactiveOptions.lang))
      currentVoice.value = matchingVoices.length > 0 ? matchingVoices[0] : voices.value[0]
    }
  }

  onMounted(() => {
    // Ensure code runs only on the client-side
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      isSupported.value = true
      
      // Get available voices
      loadVoices()
      
      // Listen for voice list changes if initially empty
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    } else {
      isSupported.value = false;
    }
  })
  
  // Remove event listener on unmount
  onBeforeUnmount(() => {
    if (isSupported.value && window.speechSynthesis.onvoiceschanged !== undefined) {
       window.speechSynthesis.onvoiceschanged = null // Clean up listener
    }
    if (isSpeaking.value) {
      cancel()
    }
  })
  
  // Speak text
  function speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isSupported.value) {
        reject(new Error('Speech synthesis is not supported by this browser.'))
        return
      }
      if (!text) {
        reject(new Error('Text cannot be empty.'))
        return
      }
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply settings from reactive options
      utterance.lang = reactiveOptions.lang
      utterance.rate = reactiveOptions.rate
      utterance.pitch = reactiveOptions.pitch
      utterance.volume = reactiveOptions.volume
      
      // Set voice
      if (currentVoice.value) {
        utterance.voice = currentVoice.value
      }
      
      // Event handlers
      utterance.onstart = () => {
        isSpeaking.value = true
        isPaused.value = false
      }
      
      utterance.onend = () => {
        isSpeaking.value = false
        isPaused.value = false
        resolve()
      }
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        isSpeaking.value = false
        isPaused.value = false
        reject(new Error(`Speech synthesis error: ${event.error}`)) // Provide more specific error
      }
      
      // Cancel any ongoing speech before speaking
      window.speechSynthesis.cancel()
      
      // 语音合成必须在用户交互后才能自动播放声音
      try {
        // 尝试使用语音合成
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 安全的语音合成，只在确保用户交互后才尝试播放
  let hasUserInteracted = false
  let pendingSpeech: string[] = []
  
  // 监听用户交互事件，用于跟踪用户是否与页面交互过
  if (typeof window !== 'undefined') {
    const userInteractionEvents = ['click', 'touchstart', 'keydown']
    
    const markUserInteracted = () => {
      hasUserInteracted = true
      
      // 尝试播放之前等待的语音
      if (pendingSpeech.length > 0) {
        const textToSpeak = pendingSpeech.shift()
        if (textToSpeak) speak(textToSpeak)
      }
      
      // 清理事件监听器（用户只需要交互一次）
      userInteractionEvents.forEach(event => {
        window.removeEventListener(event, markUserInteracted)
      })
    }
    
    // 添加事件监听器
    onMounted(() => {
      userInteractionEvents.forEach(event => {
        window.addEventListener(event, markUserInteracted)
      })
    })
    
    // 清除事件监听器
    onBeforeUnmount(() => {
      userInteractionEvents.forEach(event => {
        window.removeEventListener(event, markUserInteracted)
      })
    })
  }
  
  // 安全的尝试语音合成方法，会检查用户是否已交互
  function trySpeak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text) {
        reject(new Error('Text cannot be empty.'))
        return
      }
      
      if (hasUserInteracted) {
        // 如果用户已经交互过，直接使用语音合成
        speak(text).then(resolve).catch(reject)
      } else {
        // 如果用户尚未交互，将文本添加到待处理队列
        console.info('Queuing speech until user interaction:', text)
        pendingSpeech.push(text)
        resolve() // 我们仍然解析Promise，以避免未处理的Promise错误
      }
    })
  }
  
  // Pause speech
  function pause() {
    if (isSpeaking.value && !isPaused.value && isSupported.value) {
      window.speechSynthesis.pause()
      isPaused.value = true
    }
  }
  
  // Resume speech
  function resume() {
    if (isPaused.value && isSupported.value) {
      window.speechSynthesis.resume()
      isPaused.value = false
    }
  }
  
  // Cancel speech
  function cancel() {
     if (isSupported.value) {
        window.speechSynthesis.cancel()
     }
    isSpeaking.value = false
    isPaused.value = false
  }
  
  // Set voice
  function setVoice(voice: SpeechSynthesisVoice) {
    currentVoice.value = voice
    // Optionally update reactiveOptions lang if needed, or keep them separate
    // reactiveOptions.lang = voice.lang;
  }
  
  // Set rate
  function setRate(rate: number) {
    reactiveOptions.rate = rate
  }
  
  // Set pitch
  function setPitch(pitch: number) {
    reactiveOptions.pitch = pitch
  }

  // Set volume
  function setVolume(volume: number) {
    reactiveOptions.volume = volume
  }

  // Set Language
  function setLang(lang: string) {
      reactiveOptions.lang = lang
      // Optionally reload/reset voice after lang change
      if(isSupported.value) loadVoices();
  }

  // Cleanup logic moved to onBeforeUnmount

  return {
    isSupported: readonly(isSupported), // Make support status readonly
    isSpeaking: readonly(isSpeaking),
    isPaused: readonly(isPaused),
    voices: readonly(voices),
    currentVoice: readonly(currentVoice),
    speak,
    trySpeak, // 导出安全的语音合成方法
    pause,
    resume,
    cancel,
    setVoice,
    setRate,
    setPitch, // Expose pitch setter
    setVolume, // Expose volume setter
    setLang // Expose lang setter
  }
}