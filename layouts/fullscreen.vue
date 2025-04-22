<template>
  <!-- Fullscreen layout container: Takes full viewport height and width -->
  <div class="h-dvh w-screen overflow-hidden">
    <!-- NuxtPage will be injected here, allowing the page content 
         to control its own layout and scrolling within the full viewport -->
    <slot /> 
  </div>
</template>

<script setup lang="ts">
// No specific script logic needed for this simple layout
</script>

<style scoped>
/* Minimal styles, ensuring the container fills the viewport */
.h-dvh {
  height: 100dvh; /* Use dynamic viewport height */
}
.w-screen {
  width: 100vw;
}
.overflow-hidden {
  overflow: hidden; /* Prevent scrollbars on the layout itself */
}
</style> 