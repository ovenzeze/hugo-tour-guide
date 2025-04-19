<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white shadow-md p-3 flex items-center justify-between z-50">
    <!-- Guide Avatar -->
    <div class="flex items-center">
      <GuideAvatar />
      <span class="ml-2 text-sm font-medium text-gray-700">Your Guide</span>
    </div>

    <!-- Voice Interaction Button -->
    <button 
      class="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      @mousedown="startRecording" 
      @mouseup="stopRecording"
      @touchstart="startRecording"
      @touchend="stopRecording"
      v-motion:tap="{ scale: 0.95 }"
    >
      <!-- Placeholder for Microphone Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTourStore } from '../../stores/tourStore'; // 使用相对路径导入
import GuideAvatar from './GuideAvatar.vue'

const tourStore = useTourStore()

const startRecording = () => {
  console.log('Start recording...')
  // 调用 tourStore 中的开始录音方法 (如果存在)
  // tourStore.startVoiceInput?.() 
}

const stopRecording = () => {
  console.log('Stop recording...')
  // 调用 tourStore 中的停止录音方法 (如果存在)
  // tourStore.stopVoiceInput?.()
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>