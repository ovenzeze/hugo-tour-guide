<template>
  <!-- Fullscreen layout container: Takes full viewport height and width, adding safe area padding -->
  <div
    class="h-dvh max-h-dvh w-full relative overflow-hidden fullscreen-container"
    :style="{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    }"
  >
    <!-- NuxtPage will be injected here, allowing the page content
         to control its own layout and scrolling within the safe area -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// No specific script logic needed for this simple layout
const { isPwa } = usePwa()
</script>

<style scoped>
/* Removed specific styles as inline styles are now handling dimensions and padding */
/* Add any additional fullscreen-specific styles below if needed */
.fullscreen-container {
  /* Ensure the container takes up the intended space */
  height: 100dvh; /* Use dynamic viewport height */
  width: 100vw;
  overflow: hidden; /* Prevent scrolling on the layout itself */
  position: relative; /* Needed for absolute positioning inside */
}
.ios-header-safe-area {
  padding-top: env(safe-area-inset-top, 0);
}
.ios-footer-safe-area {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style> 