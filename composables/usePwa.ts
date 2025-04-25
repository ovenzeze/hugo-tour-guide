import { ref, onMounted, onBeforeUnmount, readonly } from 'vue'

/**
 * Detects if the application is running in PWA mode (launched from the home screen).
 * 
 * @returns {Object} An object containing a readonly ref `isPwa` and an update function `checkPwaStatus`.
 */
export function usePwa() {
  const isPwa = ref(false)
  let mediaQuery: MediaQueryList | null = null // Store the media query instance

  // Initial detection function
  const checkPwaStatus = () => {
    // Check only on the client-side
    if (typeof window !== 'undefined' && window.navigator) {
      // iOS Safari specific property
      if ('standalone' in window.navigator && typeof window.navigator.standalone === 'boolean') {
        isPwa.value = window.navigator.standalone
      } else if (window.matchMedia) {
        try {
          // Other browsers use the matchMedia API
          isPwa.value = window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches ||
                        window.matchMedia('(display-mode: minimal-ui)').matches
        } catch (e) {
          console.error('Error checking PWA status:', e)
        }
      }
      
      // Additional check for PWA manifest
      if (!isPwa.value && document.head) {
        // If there's a manifest link and we're not in a browser tab, likely a PWA
        const hasManifest = !!document.querySelector('link[rel="manifest"]')
        const isNotBrowserTab = !window.matchMedia('(display-mode: browser)').matches
        
        if (hasManifest && isNotBrowserTab) {
          isPwa.value = true
        }
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
        // Check all PWA display modes
        mediaQuery = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)')
        mediaQuery.addEventListener('change', displayModeHandler)
      } catch (e) {
        console.error('Error setting up PWA display mode listener:', e)
      }
    }
  })

  onBeforeUnmount(() => { // Changed from onUnmounted
    // Remove the listener using the stored instance
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', displayModeHandler)
      mediaQuery = null // Clean up the stored instance
    }
  })

  return {
    isPwa: readonly(isPwa), // Make state readonly
    checkPwaStatus
  }
} 