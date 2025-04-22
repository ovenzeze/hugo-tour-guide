<template>
  <div class="py-6">
    <h1 class="text-2xl font-bold mb-6 border-b pb-2">Debug Information</h1>

    <!-- Debug Tools Section -->
    <div class="mb-6">
      <button 
        @click="toggleTools = !toggleTools" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Debug Tools</span>
        <Icon :name="toggleTools ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleTools" class="space-y-4 p-4 border rounded-lg">
          <!-- Safari Guide Popup Debug -->
          <section class="p-4 border border-amber-300 bg-amber-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-amber-800">Safari Guide Popup</h2>
            <p class="text-sm text-gray-700 mb-3">
              Reset the Safari guide popup that prompts users to add the app to their home screen.
            </p>
            <button
              @click="resetGuidePopup"
              class="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition text-sm flex items-center"
            >
              <Icon name="ph:arrow-counter-clockwise" class="mr-2 w-4 h-4" />
              Reset Safari Guide Popup
            </button>
          </section>
          
          <!-- Tour Store Debug -->
          <section class="p-4 border border-blue-300 bg-blue-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-blue-800">Tour Store</h2>
            <p class="text-sm text-gray-700 mb-3">
              Reset the tour store state to its initial values.
            </p>
            <button
              @click="clearStoreState"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm flex items-center"
            >
              <Icon name="ph:database" class="mr-2 w-4 h-4" />
              Reset Tour Store
            </button>
          </section>
          
          <!-- Voice Navigation Debug -->
          <section class="p-4 border border-green-300 bg-green-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-green-800">Voice Navigation</h2>
            <p class="text-sm text-gray-700 mb-3">
              Test the speech synthesis functionality.
            </p>
            <button
              @click="testSpeak"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm flex items-center"
            >
              <Icon name="ph:speaker-high" class="mr-2 w-4 h-4" />
              Test Speak
            </button>
          </section>
          
          <!-- Notification Debug -->
          <section class="p-4 border border-purple-300 bg-purple-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-purple-800">Notifications</h2>
            <p class="text-sm text-gray-700 mb-3">
              Test the notification system.
            </p>
            <button
              @click="testNotification"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm flex items-center"
            >
              <Icon name="ph:bell" class="mr-2 w-4 h-4" />
              Test Notification
            </button>
          </section>
        </div>
      </Transition>
    </div>

    <!-- Environment Info -->
    <div class="mb-6">
      <button 
        @click="toggleEnv = !toggleEnv" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Environment Information</span>
        <Icon :name="toggleEnv ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleEnv" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border">
            <pre>Mode: {{ runtimeConfig.public.NODE_ENV || 'N/A' }}</pre>
            <pre>SSR: {{ isSSR ? 'Enabled' : 'Disabled' }}</pre>
            <pre>PWA Mode: {{ isPwa ? 'Yes' : 'No' }}</pre>
            <pre>User Language: {{ userLanguage }}</pre>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Store State -->
    <div class="mb-6">
      <button 
        @click="toggleStore = !toggleStore" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Tour Store State</span>
        <Icon :name="toggleStore ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleStore" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border max-h-60 overflow-auto">
            <pre>{{ JSON.stringify(tourStoreState, null, 2) }}</pre>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Voice Navigation State -->
    <div class="mb-6">
      <button 
        @click="toggleVoice = !toggleVoice" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Voice Navigation State</span>
        <Icon :name="toggleVoice ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleVoice" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border">
            <pre>Listening: {{ voiceNavState.isListening.value }}</pre>
            <pre>Speaking: {{ voiceNavState.isSpeaking.value }}</pre>
            <pre>Transcript: {{ voiceNavState.transcript.value || 'N/A' }}</pre>
            <pre>Recognition Error: {{ voiceNavState.recognitionError.value || 'N/A' }}</pre>
            <pre>Command Error: {{ voiceNavState.commandError.value || 'N/A' }}</pre>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import { usePwa } from '~/composables/usePwa'
import { ref } from 'vue'

// Define page meta for title
definePageMeta({
  title: 'Debug'
})

// Toggle states for collapsible sections
const toggleTools = ref(true)  // Open by default
const toggleEnv = ref(false)
const toggleStore = ref(false)
const toggleVoice = ref(false)

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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>