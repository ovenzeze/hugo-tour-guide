<template>
  <button
    class="fixed bottom-20 right-6 bg-blue-600 text-white rounded-full h-14 px-4 shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-all duration-300"
    title="Ask the AI guide"
    v-motion
    :initial="{ opacity: 0, scale: 0.8, y: 20 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: 0.8, duration: 0.5 },
    }"
    :hovered="{
      scale: 1.05,
      boxShadow:
        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }"
    :tap="{ scale: 0.95 }"
    @click="$emit('click')"
  >
    <Icon name="ph:microphone" class="w-5 h-5 mr-2" />
    <span class="font-medium">Ask Guide</span>
  </button>
</template>

<script setup lang="ts">
import { Icon } from "#components";

// 定义组件事件
defineEmits(["click"]);
</script>