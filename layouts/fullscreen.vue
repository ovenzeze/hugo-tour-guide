<template>
  <!-- Fullscreen layout container: Takes full viewport height and width, adding safe area padding -->
  <div
    class="overflow-hidden"
    :style="{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      height: '100dvh', /* Ensure height calculation respects padding */
      width: '100vw'    /* Ensure width calculation respects padding */
    }"
  >
    <!-- NuxtPage will be injected here, allowing the page content
         to control its own layout and scrolling within the safe area -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// No specific script logic needed for this simple layout
</script>

<style scoped>
/* Removed specific styles as inline styles are now handling dimensions and padding */
/* Add any additional fullscreen-specific styles below if needed */
.overflow-hidden {
  overflow: hidden; /* Keep preventing scrollbars on the layout itself */
}
</style> 