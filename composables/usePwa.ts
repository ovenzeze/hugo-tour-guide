import { ref, onMounted, onBeforeUnmount, readonly } from 'vue'

/**
 * Detects if the application is running in PWA mode (launched from the home screen).
 * 当 PWA 模块被禁用时，将始终返回 false.
 * 
 * @returns {Object} An object containing a readonly ref `isPwa` and an update function `checkPwaStatus`.
 */
export function usePwa() {
  // 检查是否启用了 PWA 模块
  // 如果在 nuxt.config.ts 中禁用了 @vite-pwa/nuxt 模块，PWA 功能将不可用
  const isPwa = ref(false)
  let mediaQuery: MediaQueryList | null = null // Store the media query instance

  // Initial detection function
  const checkPwaStatus = () => {
    // 仅在客户端和存在 window.navigator 时检查
    if (typeof window !== 'undefined' && window.navigator) {
      try {
        // iOS Safari specific property
        if ('standalone' in window.navigator && typeof window.navigator.standalone === 'boolean') {
          isPwa.value = window.navigator.standalone
        } else if (window.matchMedia) {
          // Other browsers use the matchMedia API
          isPwa.value = window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches
        }
      } catch (error) {
        console.warn('Error checking PWA status:', error)
        isPwa.value = false
      }
    }
  }

  // Handler for display mode changes
  const displayModeHandler = (evt: MediaQueryListEvent) => {
    isPwa.value = evt.matches
  }

  onMounted(() => {
    checkPwaStatus()

    // Add listener for display-mode changes on client-side
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        // Check both standalone and fullscreen
        mediaQuery = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)')
        mediaQuery.addEventListener('change', displayModeHandler)
      } catch (error) {
        console.warn('Error setting up PWA display mode listener:', error)
      }
    }
  })

  onBeforeUnmount(() => {
    // Remove the listener using the stored instance
    if (mediaQuery) {
      try {
        mediaQuery.removeEventListener('change', displayModeHandler)
      } catch (error) {
        console.warn('Error removing PWA display mode listener:', error)
      }
      mediaQuery = null // Clean up the stored instance
    }
  })

  return {
    isPwa: readonly(isPwa), // Make state readonly
    checkPwaStatus
  }
} 