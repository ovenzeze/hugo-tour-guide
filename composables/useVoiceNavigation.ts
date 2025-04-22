import { ref, watch, computed, onMounted } from 'vue'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { useSpeechRecognition } from './useSpeechRecognition'

export function useVoiceNavigation() {
  const tourStore = useTourStore()
  const { isGuideExplaining } = storeToRefs(tourStore)
  
  // --- State --- 
  const userLanguage = ref('zh-CN') // Default language
  const commandError = ref<string | null>(null) // Errors during command processing

  // --- Initialize Dependent Composables --- 

  // Configure Speech Synthesis
  const synthesisOptions = computed(() => ({
    lang: userLanguage.value,
    // Add other synthesis options if needed (rate, pitch, volume)
  }))
  const { 
    speak: synthesisSpeak,
    trySpeak: synthesisTrySpeak, 
    isSpeaking: isSynthesisSpeaking, 
    setLang: setSynthesisLang,
    // Add other synthesis returns if needed (voices, currentVoice, pause, resume, cancel etc.)
  } = useSpeechSynthesis(synthesisOptions.value) // Pass reactive options

  // Configure Speech Recognition
  const recognitionOptions = computed(() => ({
    lang: userLanguage.value,
    continuous: false, // Listen for single commands
    interimResults: false,
    onError: (event: any) => { // Use 'any' type matching recognition composable
      console.error('Speech Recognition Error in Navigation:', event.error)
      commandError.value = `Recognition error: ${event.error}`
    }
  }))
  const { 
    startListening: recognitionStart, 
    stopListening: recognitionStop, 
    isListening: isRecognitionListening, 
    transcript: recognitionTranscript, 
    error: recognitionError, 
    setLang: setRecognitionLang
    // Add other recognition returns if needed (isSupported, interimTranscript)
  } = useSpeechRecognition(recognitionOptions.value) // Pass reactive options


  // --- Initialization and Language Detection --- 
  onMounted(() => {
    // Detect browser language only on client
    if (typeof window !== 'undefined' && navigator.language) {
        const detectedLang = navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US'
        userLanguage.value = detectedLang
        // No need to call init explicitly, composables handle their init in onMounted
    }
  })

  // Sync language changes to underlying composables
  watch(userLanguage, (newLang) => {
    setSynthesisLang(newLang)
    setRecognitionLang(newLang)
  })

  // --- Core Functions --- 

  // Play welcome message using synthesis composable
  function playWelcomeIntroduction() {
    const welcomeMessage = userLanguage.value.startsWith('zh') 
      ? '欢迎来到大都会博物馆导览。我是您的虚拟导游，您可以询问我任何关于展品或参观路线的问题。'
      : 'Welcome to the Metropolitan Museum tour! I\'m your virtual guide. Ask me about exhibits or routes.'
    
    synthesisTrySpeak(welcomeMessage)
      .then(() => {
        // Optional: Add logic after welcome message finishes
      })
      .catch(err => {
        console.error('Error speaking welcome message:', err)
        commandError.value = 'Could not play welcome message.'
      })
    
    // Still use store state for general guide activity, independent of exact speech timing
    isGuideExplaining.value = true 
    setTimeout(() => {
      isGuideExplaining.value = false
    }, 10000) // Keep existing timeout logic for guide presence
  }
  
  // Explain exhibit using synthesis composable
  function explainExhibit(exhibit: ExhibitItem) {
    let explanationText = '';
    
    if (userLanguage.value.startsWith('zh')) {
      explanationText = `这是${exhibit.name}。${exhibit.description || '这是我们收藏中的一件精彩展品。'}`;
    } else {
      explanationText = `This is ${exhibit.name}. ${exhibit.description || 'This is a fascinating exhibit in our collection.'}`;
    }
    
    isGuideExplaining.value = true // Set explaining state before speaking
    synthesisTrySpeak(explanationText)
      .then(() => {
          // Keep the store state management separate from the synthesis promise resolution
          // isGuideExplaining.value = false; // Or manage based on synthesis state if preferred
      })
      .catch(err => {
          console.error(`Error explaining exhibit ${exhibit.name}:`, err)
          commandError.value = `Could not explain ${exhibit.name}.`
          isGuideExplaining.value = false; // Ensure state is reset on error
      });
      // Let the synthesis `isSpeaking` handle the actual speech end, but keep `isGuideExplaining` for broader context
  }

  // Simplified speak function using the synthesis composable
  function speak(text: string) {
      isGuideExplaining.value = true; // Set explaining state
      synthesisTrySpeak(text)
        .catch(err => {
            console.error('Error during speak function:', err)
            commandError.value = 'Speech synthesis failed.'
            isGuideExplaining.value = false; // Reset state on error
        });
       // Let isSynthesisSpeaking handle the end of speech
  }

  // Watch the recognition transcript for commands
  watch(recognitionTranscript, (newTranscript) => {
    if (newTranscript && !isRecognitionListening.value) { // Process final transcript when listening stops
      handleVoiceCommand(newTranscript)
    }
  })
  
  // Handle parsed voice commands
  function handleVoiceCommand(command: string) {
    console.log(`Processing voice command: ${command}`)
    commandError.value = null // Clear previous command errors
    const lowerCommand = command.toLowerCase().trim()
    
    if (!lowerCommand) return; // Ignore empty commands

    // --- Command Logic (Simplified example) --- 
    let response = '';
    let actionTaken = false;

    // Language-specific command handling
    if (userLanguage.value.startsWith('zh')) {
        if (lowerCommand.includes('你好') || lowerCommand.includes('您好')) {
            response = '您好！我能为您提供什么帮助吗？';
        } else if (lowerCommand.includes('导游') || lowerCommand.includes('介绍')) {
            response = '我是您的AI导游。您可以询问我任何关于展品或艺术品的问题。';
        } else if (lowerCommand.includes('二楼') || lowerCommand.includes('2楼') || (lowerCommand.includes('楼层') && (lowerCommand.includes('二') || lowerCommand.includes('2')))) {
            response = '正在导航到二楼。这里您可以找到文艺复兴时期的绘画和现代艺术。';
            tourStore.currentFloor = 2;
            actionTaken = true;
        } else if (lowerCommand.includes('一楼') || lowerCommand.includes('1楼') || (lowerCommand.includes('楼层') && (lowerCommand.includes('一') || lowerCommand.includes('1')))) {
            response = '正在导航到一楼。这里您可以找到埃及收藏品和希腊雕塑。';
            tourStore.currentFloor = 1;
            actionTaken = true;
        } else if (lowerCommand.includes('埃及')) {
            const egyptExhibit = tourStore.routeItems.find(item => item.name.toLowerCase().includes('egyptian'));
            if (egyptExhibit) {
                tourStore.highlightExhibit(egyptExhibit);
                response = '埃及收藏展示了来自古埃及的文物，包括石棺、木乃伊和象形文字。';
                actionTaken = true;
            } else {
                response = '抱歉，在一楼没有找到埃及展品。';
            }
        } else {
            response = '抱歉，我没有理解您的问题。请尝试用其他方式提问。';
        }
    } else { // English commands
        if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
            response = 'Hello! How can I help you today?';
        } else if (lowerCommand.includes('guide') || lowerCommand.includes('explain')) {
            response = 'I am your AI guide. You can ask me about any exhibit or artwork.';
        } else if (lowerCommand.includes('second floor') || lowerCommand.includes('floor 2') || (lowerCommand.includes('floor') && lowerCommand.includes('2'))) {
            response = 'Navigating to the second floor. Here you can find Renaissance paintings and Modern Art.';
            tourStore.currentFloor = 2;
            actionTaken = true;
        } else if (lowerCommand.includes('first floor') || lowerCommand.includes('floor 1') || (lowerCommand.includes('floor') && lowerCommand.includes('1'))) {
            response = 'Navigating to the first floor. Here you can find the Egyptian Collection and Greek Sculptures.';
            tourStore.currentFloor = 1;
            actionTaken = true;
        } else if (lowerCommand.includes('egyptian')) {
            const egyptExhibit = tourStore.routeItems.find(item => item.name.toLowerCase().includes('egyptian'));
            if (egyptExhibit) {
                tourStore.highlightExhibit(egyptExhibit);
                response = 'The Egyptian Collection features artifacts from ancient Egypt, including sarcophagi, mummies, and hieroglyphic inscriptions.';
                actionTaken = true;
            } else {
                response = 'Sorry, I could not find the Egyptian exhibit on the first floor.';
            }
        } else {
            response = 'I\'m sorry, I didn\'t understand that. Could you please try another question?';
        }
    }

    // Speak the response if one was generated
    if (response) {
      speak(response)
    }
  }
  
  return {
    // Core Actions
    playWelcomeIntroduction,
    explainExhibit,
    startListening: recognitionStart, // Expose recognition start
    stopListening: recognitionStop,   // Expose recognition stop
    handleVoiceCommand,           // Allow manual command input if needed
    speak,                        // Expose general speak capability

    // State (Readonly where appropriate)
    isListening: isRecognitionListening, // Use state from recognition composable
    isSpeaking: isSynthesisSpeaking,  // Use state from synthesis composable
    transcript: recognitionTranscript, // Use transcript from recognition composable
    recognitionError,             // Expose recognition error state
    commandError,                 // Expose command processing error state
    userLanguage                  // Expose current language
  }
}