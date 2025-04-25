<template>
  <header class="bg-white/80 backdrop-blur-sm h-16 shrink-0 z-50">
    <div class="container mx-auto px-4 h-full flex flex-row items-center justify-between ">
      <!-- Left area: Back button -->
      <div class="h-full w-10 flex flex-row items-center justify-center pt-2">
        <Transition name="fade" mode="out-in">
          <button
            v-if="showBackButton"
            @click="goBack"
            class="rounded-full hover:bg-gray-100/70 transition-colors"
            aria-label="Back"
          >
            <Icon name="ph:arrow-left" class="w-5 h-5" />
          </button>
        </Transition>
      </div>
      
      <!-- Center area: Page title -->
      <Transition name="fade" mode="out-in">
        <p class="text-lg font-semibold text-center tracking-wide">{{ pageTitle }}</p>
      </Transition>
      
      <!-- Right area: Placeholder for future action buttons -->
      <div class="w-10">
        <!-- Action buttons will be added here in the future -->
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

// Get page title based on route meta or fallback to default titles
// This relies on pages using definePageMeta({ title: '...' }) for reactive updates
const pageTitle = computed(() => {
  // 1. Prioritize title from route meta (set via definePageMeta)
  if (route.meta && typeof route.meta.title === 'string' && route.meta.title.trim() !== '') {
    return route.meta.title
  }
  
  // 2. Fallback based on route path
  switch (currentRoute.value) {
    case '/':
      return 'Hugo Tour Guide'
    case '/guide':
      return 'Hugo Tour Guide' // Assuming same as home page
    case '/debug': // Updated path
      return 'Debug'
    case '/tour':
      return 'Tour Route'
    case '/chat':
      return 'Chat with Guide'
    case '/docs':
      return 'Documentation'
    // Remove meta-test cases if they were just for testing title logic
    // case '/meta-test':
    //   return 'Meta 测试页面 | 自定义标题'
    // case '/meta-test-page-meta':
    //   return '使用 definePageMeta 设置的标题'
    default:
      // Attempt to generate title for /docs/* routes
      if (currentRoute.value.startsWith('/docs/')) {
        const docName = currentRoute.value.split('/').pop()
        return docName ? `Doc: ${docName.charAt(0).toUpperCase() + docName.slice(1)}` : 'Documentation'
      }
      // Default fallback
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