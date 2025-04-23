/**
 * ElevenLabs Core Settings and Features
 * Provides basic functionality and settings for the voice system
 */

import type { Voice } from '../types/voice'
import config from './elevenlabs.config'

// Current active voice configuration list (can be dynamically updated)
let activeVoices: Voice.Config[] = [...config.voices]

/**
 * Fetch available voices from ElevenLabs API
 * @returns List of voices from API
 */
export async function fetchVoicesFromAPI(): Promise<Voice.Config[]> {
  try {
    // Use existing server API endpoint to avoid exposing API key on client side
    const response = await fetch('/api/elevenlabs/voices')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voice list: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    const voices = data.voices || []
    
    // Convert API response voice format to application format
    return voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      gender: voice.labels?.gender || 'neutral',
      language: voice.labels?.language,
      model_id: voice.high_quality_base_model_ids?.[0] || config.models.multilingual,
      preview_url: voice.preview_url,
      tags: Object.values(voice.labels || {}),
      description: voice.description,
      settings: voice.settings ? {
        stability: voice.settings.stability,
        similarity_boost: voice.settings.similarity_boost,
        style: voice.settings.style || 0,
        use_speaker_boost: voice.settings.use_speaker_boost !== undefined ? voice.settings.use_speaker_boost : true
      } : { ...config.defaultSettings }
    }))
  } catch (error) {
    console.error('Failed to fetch ElevenLabs voice list:', error)
    // Return default preset voices when error occurs
    return config.voices
  }
}

/**
 * Load voice configurations
 * Can be used to dynamically load voice configurations from external data sources
 * @param configs Voice configurations to load
 * @param replace Whether to replace existing configurations (default is false, i.e., append)
 */
export function loadVoices(configs: Voice.Config[], replace: boolean = false) {
  if (replace) {
    activeVoices = [...configs]
  } else {
    // Add unique voices (using ID as unique identifier)
    const existingIds = new Set(activeVoices.map(v => v.id))
    const newConfigs = configs.filter(config => !existingIds.has(config.id))
    activeVoices = [...activeVoices, ...newConfigs]
  }
}

/**
 * Find voice configuration by ID
 * @param id Voice ID
 * @returns Corresponding voice configuration, undefined if not found
 */
export function findVoiceById(id: string): Voice.Config | undefined {
  return activeVoices.find(voice => voice.id === id)
}

/**
 * Filter voices by tags
 * @param tags Array of tags
 * @returns Array of matching voice configurations
 */
export function findVoicesByTags(tags: string[]): Voice.Config[] {
  return activeVoices.filter(voice => 
    tags.some(tag => voice.tags?.includes(tag))
  )
}

/**
 * Filter voices by language
 * @param language Language
 * @returns Array of matching voice configurations
 */
export function findVoicesByLanguage(language: string): Voice.Config[] {
  return activeVoices.filter(voice => voice.language === language)
}

/**
 * Filter voices by gender
 * @param gender Gender
 * @returns Array of matching voice configurations
 */
export function findVoicesByGender(gender: 'male' | 'female' | 'neutral'): Voice.Config[] {
  return activeVoices.filter(voice => voice.gender === gender)
}

/**
 * Get default voice configuration
 * @returns Default voice configuration
 */
export function getDefaultVoice(): Voice.Config {
  return activeVoices.find(voice => voice.is_default) || activeVoices[0]
}

/**
 * Get all available voice configurations
 * @returns All voice configurations
 */
export function getAllVoices(): Voice.Config[] {
  return [...activeVoices]
}

/**
 * Get recommended model based on scenario
 * @param scenario Usage scenario
 * @returns Recommended model ID
 */
export function getModelForScenario(scenario: Voice.ScenarioType): string {
  switch (scenario) {
    case 'quality':
      return config.models.multilingual
    case 'balanced':
      return config.models.turbo
    case 'realtime':
      return config.models.flash
    default:
      return config.models.multilingual
  }
}

/**
 * Load and update available voices from ElevenLabs API
 * @param replace Whether to replace existing configurations (default is true)
 * @returns Updated voice list
 */
export async function updateVoicesFromAPI(replace: boolean = true): Promise<Voice.Config[]> {
  try {
    const apiVoices = await fetchVoicesFromAPI()
    
    if (apiVoices && apiVoices.length > 0) {
      loadVoices(apiVoices, replace)
      return getAllVoices()
    }
    
    return activeVoices
  } catch (error) {
    console.error('Failed to update voice list:', error)
    return activeVoices
  }
}

// Export configuration and types
export { config }
export type { Voice }

// Default export all features
export default {
  // Configuration
  models: config.models,
  defaultSettings: config.defaultSettings,
  voices: activeVoices,
  
  // Core features
  loadVoices,
  findVoiceById,
  findVoicesByTags,
  findVoicesByLanguage,
  findVoicesByGender,
  getDefaultVoice,
  getAllVoices,
  getModelForScenario,
  
  // API features
  fetchVoicesFromAPI,
  updateVoicesFromAPI
}