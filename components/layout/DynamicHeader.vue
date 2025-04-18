<template>
  <header class="bg-white/80 backdrop-blur-sm h-16 shrink-0 sticky top-0 z-50">
    <div class="container mx-auto px-4 h-full flex items-center justify-between">
      <!-- Left area: Back button -->
      <div class="w-10">
        <Transition name="fade" mode="out-in">
          <button
            v-if="showBackButton"
            @click="goBack"
            class="p-2 rounded-full hover:bg-gray-100/70 transition-colors"
            aria-label="Back"
          >
            <Icon name="ph:arrow-left" class="w-5 h-5" />
          </button>
        </Transition>
      </div>
      
      <!-- Center area: Page title -->
      <Transition name="fade" mode="out-in">
        <h1 class="text-lg font-semibold text-center tracking-wide">{{ pageTitle }}</h1>
      </Transition>
      
      <!-- Right area: Placeholder for future action buttons -->
      <div class="w-10">
        <!-- Action buttons will be added here in the future -->
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Get current route and router instance
const route = useRoute()
const router = useRouter()

// Voice mode state
const voiceMode = ref(false)

// Compute current route path
const currentRoute = computed(() => route.path)

// Determine whether to show back button based on route
const showBackButton = computed(() => {
  // Don't show back button on home page
  return currentRoute.value !== '/'
})

// Get page title based on current route
const pageTitle = computed(() => {
  switch (currentRoute.value) {
    case '/':
      return 'AI Tour Guide'
    case '/guide':
      return 'AI Tour Guide' // Same as home page
    case '/preference':
      return 'Preferences'
    case '/tour':
      return 'Tour Route'
    case '/chat':
      return 'Chat with Guide'
    default:
      return 'AI Tour Guide'
  }
})

// Go back to previous page
function goBack() {
  router.back()
}

// Toggle voice mode
function toggleVoiceMode() {
  voiceMode.value = !voiceMode.value
}
</script>

<style scoped>
/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>