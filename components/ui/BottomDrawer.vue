<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 backdrop-blur-xs bg-stone-900/20 z-50"
        @click="$emit('update:modelValue', false)"
      ></div>
    </Transition>
    
    <Transition name="drawer">
      <div 
        v-if="modelValue" 
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 max-h-[90vh] overflow-auto drawer-container"
        :class="[
          fullscreen ? 'min-h-[90vh]' : '', 
          { 'ios-pwa-safe-area': isPwa },
          { 'pwa-mode': isPwa }
        ]"
      >
        <!-- 顶部拖动条 -->
        <div class="flex justify-center py-2">
          <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        <!-- 内容区域 -->
        <div class="px-4 drawer-content">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePwa } from '~/composables/usePwa'

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const { isPwa } = usePwa()
</script>

<style>
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.overlay-enter-to,
.overlay-leave-from {
  opacity: 1;
  backdrop-filter: blur(8px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

/* Apply bottom safe area padding only when in iOS PWA mode */
.ios-pwa-safe-area .drawer-content {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

/* Default padding when not in PWA mode */
.drawer-content {
  padding-bottom: 1rem; /* Keep the fallback as default */
}

/* Additional PWA mode optimizations */
.pwa-mode {
  /* Fix for potential SSR layout issues in PWA mode */
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform; /* Hint for browser optimization */
  position: fixed; /* Ensure proper positioning in PWA context */
  backface-visibility: hidden; /* Prevent flickering */
}

@supports (padding: env(safe-area-inset-bottom)) {
  .pwa-mode {
    /* Ensure proper bottom padding with notches/home indicators */
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
}
</style>