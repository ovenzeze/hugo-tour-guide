import { ref, onMounted, onBeforeUnmount } from 'vue'

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const isSupported = ref(false)
  const recognition = ref<SpeechRecognition | null>(null)
  
  // 默认配置
  const defaultOptions = {
    continuous: true,
    interimResults: true,
    lang: 'zh-CN'
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  onMounted(() => {
    // 检查浏览器是否支持语音识别
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      isSupported.value = true
      
      // 创建SpeechRecognition实例
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.value = new SpeechRecognition()
      
      // 配置识别器
      recognition.value.continuous = mergedOptions.continuous
      recognition.value.interimResults = mergedOptions.interimResults
      recognition.value.lang = mergedOptions.lang
      
      // 处理识别结果
      recognition.value.onresult = (event) => {
        interimTranscript.value = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript.value += event.results[i][0].transcript
          } else {
            interimTranscript.value += event.results[i][0].transcript
          }
        }
      }
      
      // 处理错误
      recognition.value.onerror = (event) => {
        console.error('语音识别错误:', event.error)
      }
      
      // 处理结束事件
      recognition.value.onend = () => {
        isListening.value = false
      }
    }
  })
  
  // 开始语音识别
  function startListening() {
    if (!recognition.value) return
    
    // 重置文本
    transcript.value = ''
    interimTranscript.value = ''
    
    try {
      recognition.value.start()
      isListening.value = true
      console.log('开始语音识别')
    } catch (error) {
      console.error('启动语音识别时出错:', error)
    }
  }
  
  // 停止语音识别
  function stopListening() {
    if (!recognition.value || !isListening.value) return
    
    try {
      recognition.value.stop()
      isListening.value = false
      console.log('停止语音识别')
    } catch (error) {
      console.error('停止语音识别时出错:', error)
    }
  }
  
  // 在组件销毁时清理
  onBeforeUnmount(() => {
    stopListening()
    recognition.value = null
  })
  
  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening
  }
}