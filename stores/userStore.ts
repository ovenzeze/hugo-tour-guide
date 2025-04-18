import { defineStore } from 'pinia'
import type { UserPreferences } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    preferences: {
      visitDuration: 1, // Default: 1 hour
      regionOfOrigin: 'north-america', // Default region
      interests: ['Western Art'] // Default interests
    } as UserPreferences,
    isLoggedIn: false,
    profile: {
      name: 'Guest',
      email: '',
      avatar: ''
    }
  }),
  
  getters: {
    /**
     * Get user's preferred visit duration in minutes
     */
    visitDurationMinutes: (state) => {
      return state.preferences.visitDuration * 60
    },
    
    /**
     * Check if user has selected any interests
     */
    hasSelectedInterests: (state) => {
      return state.preferences.interests.length > 0
    },
    
    /**
     * Get user display name (or "Guest" if not logged in)
     */
    displayName: (state) => {
      return state.isLoggedIn ? state.profile.name : 'Guest'
    }
  },
  
  actions: {
    /**
     * Update user preferences
     */
    updatePreferences(preferences: Partial<UserPreferences>) {
      this.preferences = {
        ...this.preferences,
        ...preferences
      }
      
      // In a real app, we might save to localStorage or backend here
      localStorage.setItem('user-preferences', JSON.stringify(this.preferences))
    },
    
    /**
     * Toggle an interest in the user's preferences
     */
    toggleInterest(interest: string) {
      const index = this.preferences.interests.indexOf(interest)
      
      if (index === -1) {
        // Add interest if not present
        this.preferences.interests.push(interest)
      } else {
        // Remove interest if already present
        this.preferences.interests.splice(index, 1)
      }
      
      // Save updated preferences
      localStorage.setItem('user-preferences', JSON.stringify(this.preferences))
    },
    
    /**
     * Load saved preferences from localStorage
     */
    loadSavedPreferences() {
      const saved = localStorage.getItem('user-preferences')
      
      if (saved) {
        try {
          const parsedPreferences = JSON.parse(saved)
          this.preferences = {
            ...this.preferences,
            ...parsedPreferences
          }
        } catch (error) {
          console.error('Failed to parse saved preferences:', error)
        }
      }
    }
  }
})