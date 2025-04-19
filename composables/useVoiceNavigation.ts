import { ref } from 'vue'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'

export function useVoiceNavigation() {
  const tourStore = useTourStore()
  const { isGuideExplaining } = storeToRefs(tourStore)
  
  // 语音合成实例
  let speechSynthesis: SpeechSynthesis | null = null
  let speechRecognition: any = null
  const isListening = ref(false)
  const transcriptText = ref('')
  
  // 检测用户首选语言
  const userLanguage = ref('zh-CN') // 默认使用中文
  
  // 初始化语音API
  function initSpeechAPI() {
    // 检查浏览器支持
    if (typeof window !== 'undefined') {
      // 检测浏览器语言
      if (navigator.language) {
        userLanguage.value = navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US'
      }
      
      speechSynthesis = window.speechSynthesis
      
      // 语音识别API (SpeechRecognition可能需要前缀)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition()
        speechRecognition.continuous = false
        speechRecognition.interimResults = false
        speechRecognition.lang = userLanguage.value  // 设置为用户首选语言
        
        speechRecognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          transcriptText.value = transcript
          handleVoiceCommand(transcript)
        }
        
        speechRecognition.onend = () => {
          isListening.value = false
        }
      }
    }
  }
  
  // 自动播放欢迎介绍
  function playWelcomeIntroduction() {
    initSpeechAPI()
    
    const welcomeMessage = userLanguage.value.startsWith('zh') 
      ? '欢迎来到大都会博物馆导览。我是您的虚拟导游，您可以询问我任何关于展品或参观路线的问题。'
      : 'Welcome to the Metropolitan Museum tour! I\'m your virtual guide. Would you like to start with the highlights or explore specific exhibitions?'
    
    speak(welcomeMessage)
    isGuideExplaining.value = true
    
    // 设置说话状态持续时间
    setTimeout(() => {
      isGuideExplaining.value = false
    }, 10000)
  }
  
  // 文本转语音
  function speak(text: string) {
    if (!speechSynthesis) return
    
    // 取消任何正在进行的语音
    speechSynthesis.cancel()
    
    // 创建新的语音合成请求
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = userLanguage.value  // 设置语言
    
    // 获取合适的声音
    const voices = speechSynthesis.getVoices()
    
    // 尝试获取对应语言的声音
    const preferredVoice = voices.find(voice => 
      voice.lang.includes(userLanguage.value.split('-')[0]) && 
      (voice.name.includes('female') || voice.name.includes('Female'))
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    // 开始说话状态
    isGuideExplaining.value = true
    
    utterance.onend = () => {
      isGuideExplaining.value = false
    }
    
    speechSynthesis.speak(utterance)
  }
  
  // 根据展品解释内容
  function explainExhibit(exhibit: ExhibitItem) {
    let explanationText = '';
    
    if (userLanguage.value.startsWith('zh')) {
      explanationText = `这是${exhibit.name}。${exhibit.description || '这是我们收藏中的一件精彩展品。'}`;
    } else {
      explanationText = `This is ${exhibit.name}. ${exhibit.description || 'This is a fascinating exhibit in our collection.'}`;
    }
    
    speak(explanationText)
  }
  
  // 开始语音识别
  function startListening() {
    if (!speechRecognition) return
    
    try {
      isListening.value = true
      speechRecognition.start()
    } catch (error) {
      console.error('Speech recognition error:', error)
      isListening.value = false
    }
  }
  
  // 停止语音识别
  function stopListening() {
    if (!speechRecognition) return
    
    try {
      if (isListening.value) {
        speechRecognition.stop()
        isListening.value = false
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error)
    }
  }
  
  // 处理语音命令
  function handleVoiceCommand(command: string) {
    console.log(`Processing voice command: ${command}`)
    
    // 将命令转为小写便于匹配
    const lowerCommand = command.toLowerCase()
    
    // 中文命令处理
    if (userLanguage.value.startsWith('zh')) {
      if (lowerCommand.includes('你好') || lowerCommand.includes('您好')) {
        speak('您好！我能为您提供什么帮助吗？')
      }
      else if (lowerCommand.includes('导游') || lowerCommand.includes('介绍')) {
        speak('我是您的AI导游。您可以询问我任何关于展品或艺术品的问题。')
      }
      else if (lowerCommand.includes('楼层') && lowerCommand.includes('二') || lowerCommand.includes('2')) {
        speak('正在导航到二楼。这里您可以找到文艺复兴时期的绘画和现代艺术。')
        tourStore.currentFloor = 2
      }
      else if (lowerCommand.includes('楼层') && lowerCommand.includes('一') || lowerCommand.includes('1')) {
        speak('正在导航到一楼。这里您可以找到埃及收藏品和希腊雕塑。')
        tourStore.currentFloor = 1
      }
      else if (lowerCommand.includes('埃及')) {
        const egyptExhibit = tourStore.routeItems.find(item => item.name.includes('Egyptian'))
        if (egyptExhibit) {
          tourStore.highlightExhibit(egyptExhibit)
          speak('埃及收藏展示了来自古埃及的文物，包括石棺、木乃伊和象形文字。')
        }
      }
      else {
        speak('抱歉，我没有理解您的问题。请尝试用其他方式提问。')
      }
    } 
    // 英文命令处理
    else {
      if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        speak('Hello! How can I help you today?')
      } 
      else if (lowerCommand.includes('guide') || lowerCommand.includes('explain')) {
        speak('I am your AI guide for the Metropolitan Museum. You can ask me about any exhibit or artwork.')
      }
      else if (lowerCommand.includes('floor') && lowerCommand.includes('2')) {
        speak('Navigating to the second floor. Here you can find Renaissance paintings and Modern Art.')
        tourStore.currentFloor = 2
      }
      else if (lowerCommand.includes('floor') && lowerCommand.includes('1')) {
        speak('Navigating to the first floor. Here you can find the Egyptian Collection and Greek Sculptures.')
        tourStore.currentFloor = 1
      }
      else if (lowerCommand.includes('egyptian')) {
        const egyptExhibit = tourStore.routeItems.find(item => item.name.includes('Egyptian'))
        if (egyptExhibit) {
          tourStore.highlightExhibit(egyptExhibit)
          speak('The Egyptian Collection features artifacts from ancient Egypt, including sarcophagi, mummies, and hieroglyphic inscriptions.')
        }
      }
      else {
        speak('I\'m sorry, I didn\'t understand that. Could you please try another question?')
      }
    }
  }
  
  return {
    playWelcomeIntroduction,
    explainExhibit,
    handleVoiceCommand,
    startListening,
    stopListening,
    isListening,
    transcriptText,
    speak,
    userLanguage
  }
}