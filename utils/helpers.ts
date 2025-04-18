/**
 * Helper utility functions for the AI Tour Guide application
 */

import type { Exhibit, TourRoute } from '~/types'

/**
 * Format duration in minutes to a human-readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string (e.g., "1 hour 15 minutes")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Less than a minute'
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  let result = ''
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  if (remainingMinutes > 0) {
    if (result) result += ' '
    result += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
  }
  
  return result
}

/**
 * Format distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted distance string (e.g., "800 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`
  } else {
    const kilometers = (meters / 1000).toFixed(1)
    return `${kilometers} km`
  }
}

/**
 * Calculate estimated completion time for a tour
 * @param route Tour route
 * @param startTime Start time (defaults to current time)
 * @returns Estimated completion time as Date object
 */
export function calculateCompletionTime(route: TourRoute, startTime: Date = new Date()): Date {
  const completionTime = new Date(startTime)
  completionTime.setMinutes(completionTime.getMinutes() + route.estimatedDurationMinutes)
  return completionTime
}

/**
 * Format a date to a time string (e.g., "14:30")
 * @param date Date object
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Group exhibits by category
 * @param exhibits Array of exhibits
 * @returns Object with categories as keys and arrays of exhibits as values
 */
export function groupExhibitsByCategory(exhibits: Exhibit[]): Record<string, Exhibit[]> {
  const grouped: Record<string, Exhibit[]> = {}
  
  exhibits.forEach(exhibit => {
    exhibit.category.forEach(category => {
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(exhibit)
    })
  })
  
  return grouped
}

/**
 * Generate a unique ID for new items
 * @returns Unique ID string
 */
export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}