import { ref, computed, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useTourStore } from '~/stores/tourStore'
import { useSpeechRecognition } from './useSpeechRecognition' // Keep for listening
import { useElevenLabsTTS } from './useElevenLabsTTS'
import elevenLabsConfig, { findVoiceById, getDefaultVoice } from '~/config/elevenlabs'
import type { Voice } from '~/types/voice'

export function useVoiceNavigation() {
  const tourStore = useTourStore()
  // Import relevant state from tourStore if needed by logic (e.g., currentMuseum for context)
  const { currentMuseum } = storeToRefs(tourStore)

  // === ElevenLabs TTS Integration ===
  const {
    audioUrl,
    // audioData, // Not directly needed here, but available
    isLoading: isGeneratingAudio, // Renamed for clarity
    error: ttsError,
    generateTTS,
    clearAudio,
  } = useElevenLabsTTS()

  const audioElement = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  // Combined state: true if generating OR playing audio
  const isSpeaking = computed(() => isPlaying.value || isGeneratingAudio.value)

  // Function to clean up the audio element and listeners
  const cleanupAudio = () => {
    if (audioElement.value) {
      console.log("Cleaning up previous audio element...");
      audioElement.value.pause()
      audioElement.value.removeEventListener('play', handlePlay)
      audioElement.value.removeEventListener('pause', handlePause)
      audioElement.value.removeEventListener('ended', handleEnded)
      audioElement.value.removeEventListener('error', handleError)
      // Setting src to empty string is recommended for releasing resources
      audioElement.value.src = '' 
      audioElement.value = null
    }
    isPlaying.value = false
    isPaused.value = false
    // Clear URL/data from the TTS composable as well
    clearAudio() 
    console.log("Audio cleanup complete.");
  }

  // Audio Element Event Handlers
  const handlePlay = () => {
    console.log('Audio playback started via event.');
    isPlaying.value = true
    isPaused.value = false
  }
  const handlePause = () => {
    // This event fires both on pause() and when the track ends naturally
    console.log('Audio playback paused via event.');
    isPlaying.value = false
    // Only set isPaused if the audio hasn't reached the end
    if (audioElement.value && audioElement.value.currentTime < audioElement.value.duration) {
      console.log('Audio explicitly paused.')
      isPaused.value = true 
    } else {
      console.log('Audio pause event at end of track (or element cleared).')
      isPaused.value = false // Don't mark as paused if it just ended
      // The 'ended' event handler will perform the main cleanup
    }
  }
  const handleEnded = () => {
    console.log('Audio playback naturally ended via event.');
    // Ensure states reflect the end before cleanup
    isPlaying.value = false
    isPaused.value = false
    cleanupAudio() // Full cleanup
  }
  const handleError = (e: Event | string) => {
    console.error('Audio playback error event:', e)
    ttsError.value = 'Error occurred during audio playback.'
    cleanupAudio() // Clean up on error
  }

  // Core Speak Function using ElevenLabs
  const speak = async (text: string, voiceId?: string) => {
    if (!text) {
      console.warn("Speak function called with empty text.");
      return;
    }
    console.log(`Requesting TTS synthesis for: "${text.substring(0, 50)}..."`);
    // --- Stop and Cleanup Previous Audio --- 
    // Call cleanupAudio FIRST to ensure any existing playback stops
    // and resources are released before starting a new request.
    cleanupAudio(); 
    // --- End Cleanup ---

    const defaultVoice = getDefaultVoice()
    const targetVoiceId = voiceId || defaultVoice?.id

    if (!targetVoiceId) {
      const errorMsg = 'No default ElevenLabs voice configured.';
      ttsError.value = errorMsg
      console.error(errorMsg)
      return
    }

    const voiceConfig = findVoiceById(targetVoiceId)
    if (!voiceConfig) {
      const errorMsg = `Configuration for voice ID ${targetVoiceId} not found.`;
      ttsError.value = errorMsg
      console.error(errorMsg)
      return
    }

    // Prepare options for generateTTS
    const options: Voice.TTSRequestOptions = {
      voiceId: targetVoiceId,
      modelId: voiceConfig.modelId || elevenLabsConfig.models.multilingual, 
      voiceSettings: { 
        ...(elevenLabsConfig.defaultSettings || {}), 
        ...(voiceConfig.settings || {}), 
      },
    }
    // Clean up potential undefined optional settings after merging
    if (options.voiceSettings?.style === undefined) delete options.voiceSettings.style;
    if (options.voiceSettings?.use_speaker_boost === undefined) delete options.voiceSettings.use_speaker_boost;
    
    // Ensure required settings have fallbacks if still missing (shouldn't happen with defaults)
    options.voiceSettings.stability = options.voiceSettings.stability ?? 0.5; 
    options.voiceSettings.similarity_boost = options.voiceSettings.similarity_boost ?? 0.75;

    try {
      // isGeneratingAudio state is managed within useElevenLabsTTS
      console.log("Calling generateTTS...");
      await generateTTS(text, options)
      console.log("generateTTS call completed.");

      // Check for errors *after* await generateTTS completes
      if (ttsError.value || !audioUrl.value) {
        console.error('TTS Generation failed or produced no URL:', ttsError.value || 'No audio URL received')
        // No need to call cleanupAudio here as it was called at the start and error state is set
        return
      }

      // Create and setup the audio element for playback
      console.log('TTS generated successfully. Creating audio element with URL:', audioUrl.value);
      // Assign to ref immediately
      audioElement.value = new Audio(audioUrl.value)
      
      // Add event listeners BEFORE calling play()
      audioElement.value.addEventListener('play', handlePlay)
      audioElement.value.addEventListener('pause', handlePause)
      audioElement.value.addEventListener('ended', handleEnded)
      audioElement.value.addEventListener('error', handleError)

      // Attempt to play
      console.log("Initiating playback...");
      await audioElement.value.play()
      // State updates (isPlaying=true) will be handled by the 'play' event listener

    } catch (err: any) {
      console.error("Catch block: Error occurred during speak function execution:", err)
      ttsError.value = err.message || 'Failed to generate or play speech.'
      cleanupAudio() // Ensure cleanup on unexpected errors
    }
  }

  // === Speech Recognition (Keep as is, ensure names don't clash) ===
  const {
    isListening: isRecognitionListening, // Rename state
    transcript: recognitionTranscript,
    interimTranscript,
    recognitionError,
    commandError,
    startListening: startRecognition, // Rename functions
    stopListening: stopRecognition,
    // executeCommand, // Not directly used here
    // supportedCommands,
    // userLanguage // Not directly used here
  } = useSpeechRecognition({ lang: 'zh-CN', continuous: false, interimResults: true })

  // 添加音频控制函数
  const pauseAudio = () => {
    if (audioElement.value && isPlaying.value) {
      audioElement.value.pause()
      // isPaused状态会通过handlePause事件处理器更新
    }
  }

  const resumeAudio = () => {
    if (audioElement.value && isPaused.value) {
      audioElement.value.play().catch(err => {
        console.error('Failed to resume audio playback:', err)
        handleError(err)
      })
      // isPlaying状态会通过handlePlay事件处理器更新
    }
  }

  const stopAudio = () => {
    cleanupAudio() // 使用现有的cleanupAudio函数完全停止并清理资源
  }

  // === Logic using new speak/controls ===
  function playWelcomeIntroduction() {
    const museumName = currentMuseum.value?.name || 'the museum';
    const welcomeText = `Hello and welcome to ${museumName}. I am your virtual guide. Feel free to ask me questions about exhibits or request a tour.`;
    const welcomeVoiceId = elevenLabsConfig.voices.find(v => v.tags?.includes("welcome"))?.id; // Example: find voice by tag
    speak(welcomeText, welcomeVoiceId); // Use default if no specific welcome voice found
  }

  function explainExhibit(exhibit: Voice.ExhibitData) {
    if (!exhibit?.name) {
      console.warn("explainExhibit called with invalid exhibit data.")
      return;
    }
    const text = `Now looking at ${exhibit.name}. ${exhibit.description || 'No detailed description is available at this time.'}`
    // Example: potentially use a voice based on exhibit type or museum setting in the future
    speak(text) // Use default voice for now
  }

  // === Cleanup ===
  onBeforeUnmount(() => {
    console.log("VoiceNavigation composable unmounting. Cleaning up audio and stopping recognition.");
    cleanupAudio() // Ensure audio stops and resources are released
    stopRecognition() // Stop speech recognition listener if active
  })

  // === Return Exposed State and Functions ===
  return {
    // TTS Playback State & Controls
    isSpeaking, // Combined: true if generating OR playing
    isGeneratingAudio, // True only during API call
    isPlaying, // True only when audio is actively playing
    isPaused, // True only when audio is paused mid-track
    ttsError, // Any error from TTS generation or playback
    speak, // Function to generate and play speech
    pauseAudio, // Function to pause playback
    resumeAudio, // Function to resume playback
    stopAudio, // Function to stop playback and cleanup

    // Speech Recognition State & Controls (Renamed)
    isListening: isRecognitionListening,
    transcript: recognitionTranscript,
    interimTranscript,
    recognitionError,
    commandError,
    startListening: startRecognition,
    stopListening: stopRecognition,
    // userLanguage, // Expose if needed elsewhere

    // Functions that trigger speech
    playWelcomeIntroduction,
    explainExhibit,
  }
}

// --- Type Augmentation ---
// Ensure the ExhibitData type used by explainExhibit is defined.
declare module '~/types/voice' {
   export interface ExhibitData {
    id: number | string; // Allow string IDs if applicable
    name: string;
    description?: string;
    // Add other relevant fields if needed by explainExhibit
  }

  // Type for TTS Request Options passed to generateTTS
  export interface TTSRequestOptions {
    voiceId: string;
    modelId?: string; // Optional, defaults might be handled in TTS composable or config
    voiceSettings?: Partial<Voice.Settings>; // Allow partial settings override
  }
}