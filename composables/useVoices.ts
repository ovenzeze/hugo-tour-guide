import { ref, computed, onMounted } from 'vue'
import type { Voice } from '~/types/voice'
import elevenlabs, { updateVoicesFromAPI, getAllVoices } from '~/config/elevenlabs'

/**
 * Voice Management Composable
 * Provides voice list management and filtering functionality
 */
export function useVoices() {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const voices = ref<Voice.Config[]>(getAllVoices())
  const selectedVoiceId = ref<string | null>(elevenlabs.getDefaultVoice().id)
  
  // Computed properties
  const selectedVoice = computed(() => {
    return selectedVoiceId.value ? 
      voices.value.find(voice => voice.id === selectedVoiceId.value) || null : null
  })
  
  // Methods
  const fetchVoices = async (replaceExisting = true) => {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedVoices = await updateVoicesFromAPI(replaceExisting)
      voices.value = updatedVoices
      
      // If selected voice is not in the updated list, set to default voice
      if (selectedVoiceId.value && 
          !updatedVoices.some(voice => voice.id === selectedVoiceId.value)) {
        selectedVoiceId.value = elevenlabs.getDefaultVoice().id
      }
      
      return updatedVoices
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch voice list'
      console.error('Failed to fetch voice list:', err)
      return voices.value
    } finally {
      isLoading.value = false
    }
  }
  
  const setSelectedVoice = (voiceId: string) => {
    const voice = voices.value.find(v => v.id === voiceId)
    if (voice) {
      selectedVoiceId.value = voiceId
      return true
    }
    return false
  }
  
  const filterVoicesByGender = (gender: 'male' | 'female' | 'neutral') => {
    return voices.value.filter(voice => voice.gender === gender)
  }
  
  const filterVoicesByLanguage = (language: string) => {
    return voices.value.filter(voice => voice.language === language)
  }
  
  const filterVoicesByTags = (tags: string[]) => {
    return voices.value.filter(voice => 
      tags.some(tag => voice.tags?.includes(tag))
    )
  }
  
  // Lifecycle
  onMounted(() => {
    // Automatically load voices if the list is empty when component is mounted
    if (voices.value.length === 0) {
      fetchVoices()
    }
  })
  
  return {
    // State
    voices,
    isLoading,
    error,
    selectedVoiceId,
    selectedVoice,
    
    // Methods
    fetchVoices,
    setSelectedVoice,
    filterVoicesByGender,
    filterVoicesByLanguage,
    filterVoicesByTags,
  }
}