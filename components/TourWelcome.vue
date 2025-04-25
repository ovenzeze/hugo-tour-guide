<template>
  <div
    class="fixed inset-0 z-50 h-full w-full bg-black/10 backdrop-blur-sm flex items-center justify-center"
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 0.3 } }"
  >
    <div
      class="w-full max-w-[380px] px-4 relative"
      v-motion
      :initial="{ scale: 0.9, y: 20, opacity: 0 }"
      :enter="{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } }"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-2 left-6 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 text-white/80 hover:text-white flex items-center justify-center transition-colors"
        aria-label="Close"
        v-motion
        :initial="{ opacity: 0, scale: 0.5 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 0.5 } }"
      >
        <icon name="ph:x" size="18" />
      </button>

      <!-- Mute Button -->
      <button
        @click="toggleMute"
        class="absolute top-2 right-6 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 text-white/80 hover:text-white flex items-center justify-center transition-colors"
        :aria-label="isMuted ? 'Unmute' : 'Mute'"
        v-motion
        :initial="{ opacity: 0, scale: 0.5 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 0.5 } }"
      >
        <icon :name="isMuted ? 'ph:speaker-simple-slash' : 'ph:speaker-high'" size="18" />
      </button>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Top image area with museum icon -->
        <div class="h-40 bg-blue-600 flex items-center justify-center relative overflow-hidden">
          <div
            class="absolute inset-0 opacity-20"
            style="background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 20px 20px;"
          ></div>
          <div
            class="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center z-10 shadow-lg"
            v-motion
            :initial="{ scale: 0.8, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.4 } }"
          >
            <icon name="ph:bank" class="text-blue-600 text-5xl" />
          </div>
        </div>

        <!-- Content area -->
        <div class="p-7 mx-auto">
          <h1
            class="text-2xl font-bold text-center mb-4 text-gray-800"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }"
          >
            {{ title }}
          </h1>
          <p
            class="text-gray-600 text-center mb-7 text-sm leading-relaxed"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 0.5, duration: 0.3 } }"
          >
            {{ description }}
          </p>

          <!-- Button -->
          <Button
            @click="$emit('start')"
            class="w-full py-6 text-base"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.3 } }"
          >
            <icon name="ph:play" class="mr-2" size="20" />
            <span>Start Voice Tour</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';

const emit = defineEmits(['start', 'toggle-mute', 'close']);

// Mute state
const isMuted = ref(false);

// Toggle mute function
function toggleMute() {
  isMuted.value = !isMuted.value;
  emit('toggle-mute', isMuted.value);
}

// 属性定义
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'Welcome to Voice Tour',
    description: 'Click the button below to start exploring the Metropolitan Museum\'s magnificent art treasures with your virtual guide',
  }
);
</script> 