<template>
  <div
    class="h-dvh max-h-dvh w-full relative fullscreen-map-container" 
    :class="{ 'ios-footer-safe-area': isPwa && !isTour, 'ios-header-safe-area': isPwa && !isTour }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePwa } from '~/composables/usePwa'

const { isPwa } = usePwa()
const url = useRequestURL()
const isTour = computed(() => url.pathname.includes('/tour'))
</script>

<style scoped>
.fullscreen-map-container {
  /* 确保全屏地图能够正确渲染，不添加overflow限制 */
  position: relative;
  touch-action: pan-x pan-y;
}

.ios-header-safe-area {
  padding-top: calc(env(safe-area-inset-top, 0) + 1rem);
}

.ios-footer-safe-area {
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
}
</style> 