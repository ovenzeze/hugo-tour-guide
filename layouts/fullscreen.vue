<template>
  <!-- Fullscreen layout container: Takes full viewport height and width, adding safe area padding -->
  <div
    class="h-dvh max-h-dvh w-full relative overflow-hidden fullscreen-container" :class="{ 'ios-footer-safe-area': isPwa && !isTour, 'ios-header-safe-area': isPwa && !isTour }"
  >
    <!-- NuxtPage will be injected here, allowing the page content
         to control its own layout and scrolling within the safe area -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// No specific script logic needed for this simple layout
const { isPwa } = usePwa()
const url = useRequestURL()
const isTour = computed(() => url.pathname.includes('/tour'))
</script>

<style scoped>
/* Removed specific styles as inline styles are now handling dimensions and padding */
/* Add any additional fullscreen-specific styles below if needed */

.ios-header-safe-area {
  padding-top: calc(env(safe-area-inset-top, 0) + 1rem);
}
.ios-footer-safe-area {
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
}
</style> 