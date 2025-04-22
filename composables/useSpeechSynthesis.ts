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
        // Special handling for speech playback permission error
        if (event.error === 'not-allowed') {
          console.info('Speech synthesis requires user interaction permission, content added to pending queue')
          isSpeaking.value = false
          isPaused.value = false
          pendingSpeech.push(text)
          resolve() // Resolve without error, add to pending queue and end normally
        } else {
          console.error('Speech synthesis error:', event.error)
          isSpeaking.value = false
          isPaused.value = false
          reject(new Error(`Speech synthesis error: ${event.error}`)) 
        }
      }
      
      // Cancel any ongoing speech before speaking
      window.speechSynthesis.cancel()
      
      // Speech synthesis requires user interaction before auto-playing sound
      try {
        // Attempt to use speech synthesis
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // Safe speech synthesis, only attempts playback after ensuring user interaction
  let hasUserInteracted = false
  let pendingSpeech: string[] = []
  
  // Listen for user interaction events to track if user has interacted with the page
  if (typeof window !== 'undefined') {
    const userInteractionEvents = ['click', 'touchstart', 'keydown']
    
    const markUserInteracted = () => {
      hasUserInteracted = true
      
      // Try to play pending speech
      if (pendingSpeech.length > 0) {
        const textToSpeak = pendingSpeech.shift()
        if (textToSpeak) speak(textToSpeak)
      }
      
      // Clean up event listeners (user only needs to interact once)
      userInteractionEvents.forEach(event => {
        window.removeEventListener(event, markUserInteracted)
      })
    }
    
    // Add event listeners
    onMounted(() => {
      userInteractionEvents.forEach(event => {
        window.addEventListener(event, markUserInteracted)
      })
    })
    
    // Remove event listeners
    onBeforeUnmount(() => {
      userInteractionEvents.forEach(event => {
        window.removeEventListener(event, markUserInteracted)
      })
    })
  }
  
  // Safe speech synthesis method that checks for user interaction
  function trySpeak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text) {
        reject(new Error('Text cannot be empty.'))
        return
      }
      
      if (hasUserInteracted) {
        // If user has already interacted, use speech synthesis directly
        speak(text).then(resolve).catch(reject)
      } else {
        // If user hasn't interacted yet, add text to pending queue
        console.info('Queuing speech until user interaction:', text)
        pendingSpeech.push(text)
        resolve() // Still resolve Promise to avoid unhandled Promise errors
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
    trySpeak, // Export safe speech synthesis method
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