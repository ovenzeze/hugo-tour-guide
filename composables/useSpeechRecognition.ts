import { ref, onMounted, onBeforeUnmount, reactive, watch, readonly } from 'vue'

// --- Web Speech API Type Declarations (Workaround) ---
// Ideally, install @types/dom-speech-recognition
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
    // Use 'any' for event types if specific types cause issues
    type SpeechRecognitionErrorEvent = any; 
    type SpeechRecognitionEvent = any;
    type SpeechRecognition = any; // Define the type for the instance
}
// --- End Type Declarations ---

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onError?: (event: SpeechRecognitionErrorEvent) => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref<SpeechRecognitionErrorEvent | null>(null)
  const isSupported = ref(false)
  const recognition = ref<SpeechRecognition | null>(null)
  
  // Default options
  const defaultOptions = {
    continuous: true,
    interimResults: true,
    lang: 'zh-CN',
    onError: (event: SpeechRecognitionErrorEvent) => { 
        console.error('Speech recognition error:', event.error)
    }
  }
  
  // Reactive options
  const reactiveOptions = reactive({ ...defaultOptions, ...options })

  // Watch for external option changes
  watch(() => options, (newOptions) => {
    Object.assign(reactiveOptions, { ...defaultOptions, ...newOptions })
    // Apply changes to the existing recognition instance if possible
    if (recognition.value) {
        recognition.value.lang = reactiveOptions.lang;
        recognition.value.continuous = reactiveOptions.continuous;
        recognition.value.interimResults = reactiveOptions.interimResults;
    }
  }, { deep: true })
  
  onMounted(() => {
    // Check browser support on client-side
    const SpeechRecognitionAPI = (typeof window !== 'undefined') ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

    if (SpeechRecognitionAPI) {
      isSupported.value = true
      
      // Create SpeechRecognition instance
      recognition.value = new SpeechRecognitionAPI()
      
      // Configure recognizer using reactive options
      recognition.value.continuous = reactiveOptions.continuous
      recognition.value.interimResults = reactiveOptions.interimResults
      recognition.value.lang = reactiveOptions.lang
      
      // Handle results
      recognition.value.onresult = (event: SpeechRecognitionEvent) => {
        interimTranscript.value = ''
        let finalTranscript = '' // Build final transcript for the event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const currentTranscript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += currentTranscript
          } else {
            interimTranscript.value += currentTranscript
          }
        }
        // Append final part to the main transcript
        transcript.value += finalTranscript;
      }
      
      // Handle errors
      recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
        error.value = event
        reactiveOptions.onError(event) // Call user-provided or default handler
      }
      
      // Handle end event
      recognition.value.onend = () => {
        isListening.value = false
        // Optionally restart listening if continuous is true and it ended unexpectedly
        // Can add logic here if needed based on error state or specific needs
      }
    } else {
        isSupported.value = false;
    }
  })
  
  // Start speech recognition
  function startListening() {
    if (!isSupported.value || !recognition.value || isListening.value) return
    
    // Reset state
    transcript.value = ''
    interimTranscript.value = ''
    error.value = null
    
    try {
      recognition.value.start()
      isListening.value = true
      console.log('Speech recognition started')
    } catch (err) {
      error.value = err as SpeechRecognitionErrorEvent // Capture start error
      console.error('Error starting speech recognition:', err)
      reactiveOptions.onError(err as SpeechRecognitionErrorEvent) // Trigger error handler
    }
  }
  
  // Stop speech recognition
  function stopListening() {
    if (!isSupported.value || !recognition.value || !isListening.value) return
    
    try {
      recognition.value.stop()
      // onend handler will set isListening.value to false
      console.log('Speech recognition stopped')
    } catch (err) {
       // While stop() itself doesn't typically throw errors documented in MDN,
       // capturing potential unexpected issues is good practice.
      error.value = err as SpeechRecognitionErrorEvent // Capture stop error
      console.error('Error stopping speech recognition:', err)
      reactiveOptions.onError(err as SpeechRecognitionErrorEvent) // Trigger error handler
    }
  }

  // Setters for reactive options
  function setLang(lang: string) {
    reactiveOptions.lang = lang
  }

  function setContinuous(continuous: boolean) {
    reactiveOptions.continuous = continuous
  }

  function setInterimResults(interim: boolean) {
    reactiveOptions.interimResults = interim
  }
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (recognition.value) {
        try {
            recognition.value.abort(); // Use abort for immediate stop and cleanup
        } catch (err) {
             console.error('Error aborting speech recognition on unmount:', err)
        }
        recognition.value = null
    }
  })
  
  return {
    isSupported: readonly(isSupported),
    isListening: readonly(isListening),
    transcript: readonly(transcript),
    interimTranscript: readonly(interimTranscript),
    error: readonly(error),
    startListening,
    stopListening,
    // Expose setters
    setLang,
    setContinuous,
    setInterimResults
  }
}