<template>
  <div class="py-6">
    <h1 class="text-2xl font-bold mb-6 border-b pb-2">Debug Information</h1>

    <div class="space-y-6">
      <!-- Environment Info -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Environment</h2>
        <div class="bg-gray-50 p-4 rounded-lg text-sm border">
          <pre>Mode: {{ runtimeConfig.public.NODE_ENV || 'N/A' }}</pre>
          <pre>SSR: {{ isSSR ? 'Enabled' : 'Disabled' }}</pre>
          <pre>PWA Mode: {{ isPwa ? 'Yes' : 'No' }}</pre>
          <pre>User Language: {{ userLanguage }}</pre>
          <!-- Add more relevant environment variables here -->
        </div>
      </section>

      <!-- Store State (Example) -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Tour Store State</h2>
        <div class="bg-gray-50 p-4 rounded-lg text-sm border max-h-60 overflow-auto">
          <pre>{{ JSON.stringify(tourStoreState, null, 2) }}</pre>
        </div>
      </section>

      <!-- Composables State (Example) -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Voice Navigation State</h2>
        <div class="bg-gray-50 p-4 rounded-lg text-sm border">
          <pre>Listening: {{ voiceNavState.isListening.value }}</pre>
          <pre>Speaking: {{ voiceNavState.isSpeaking.value }}</pre>
          <pre>Transcript: {{ voiceNavState.transcript.value || 'N/A' }}</pre>
          <pre>Recognition Error: {{ voiceNavState.recognitionError.value || 'N/A' }}</pre>
          <pre>Command Error: {{ voiceNavState.commandError.value || 'N/A' }}</pre>
        </div>
      </section>

      <!-- Action Buttons (Example) -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Actions</h2>
        <div class="flex flex-wrap gap-4">
          <button
            @click="clearStoreState"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
          >
            Reset Tour Store
          </button>
          <button
            @click="testSpeak"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
          >
            Test Speak
          </button>
          <button
            @click="testNotification"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
          >
            Test Notification
          </button>
          <button
            @click="resetGuidePopup"
            class="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition text-sm"
          >
            Reset Guide Popup
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import { usePwa } from '~/composables/usePwa'

// Define page meta for title
definePageMeta({
  title: 'Debug'
})

// Use unhead for title consistency (optional, if definePageMeta doesn't work as expected)
// useHead({
//   title: 'Debug'
// })

const runtimeConfig = useRuntimeConfig()
const tourStore = useTourStore()
const voiceNavState = useVoiceNavigation()
const { isPwa } = usePwa()
const { userLanguage } = useVoiceNavigation()

// Check if running on server or client
const isSSR = computed(() => process.server)

// Get reactive store state
const tourStoreState = computed(() => tourStore.$state)

// Example actions
function clearStoreState() {
  console.log('Attempting to reset tour store state...');
  // In a real app, you might call a specific action in the store
  // For simplicity, just logging here
  alert('Store reset action triggered (check console). Implement actual logic in store.') 
}

function testSpeak() {
  console.log('Testing speech synthesis...');
  voiceNavState.speak('This is a test message from the debug page.')
}

function testNotification() {
  console.log('Testing notification...');
  // Example: Requires a notification system (like vue-toastification) to be set up
  // toast.info('This is a test notification!') 
  alert('Notification action triggered. Implement actual notification logic.')
}

function resetGuidePopup() {
  localStorage.removeItem('hasShownGuidePopup')
  alert('Guide popup has been reset. It will show again on the next page load in Safari.')
}

</script>

<style scoped>
/* Add any page-specific styles here */
pre {
  white-space: pre-wrap; /* Allow text wrapping in pre tags */
  word-break: break-all;
  font-family: monospace; /* Ensure monospaced font */
}
</style> 