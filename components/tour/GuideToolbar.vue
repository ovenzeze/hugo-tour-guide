<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg border-t h-16 z-40 flex items-center px-4">
    <!-- 导游头像 -->
    <GuideAvatar :speaking="isGuideExplaining" />
    
    <!-- 当前上下文信息 -->
    <div class="flex-1 text-center mx-4 text-sm text-gray-700 truncate">
      <template v-if="highlightedExhibit">
        {{ highlightedExhibit.name }}: {{ highlightedExhibit.description || 'Explore this exhibit' }}
      </template>
      <template v-else>
        Explore the Metropolitan Museum
      </template>
    </div>
    
    <!-- 按住说话按钮 -->
    <div 
      class="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-full shadow-md text-white cursor-pointer"
      @mousedown="startVoiceCapture"
      @mouseup="stopVoiceCapture"
      @touchstart="startVoiceCapture"
      @touchend="stopVoiceCapture"
      v-motion:active="{ scale: 0.95 }"
    >
      <span class="text-white">mic</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import GuideAvatar from './GuideAvatar.vue'

const tourStore = useTourStore()
const { isGuideExplaining, highlightedExhibit } = storeToRefs(tourStore)
const { handleVoiceCommand } = useVoiceNavigation()

function startVoiceCapture() {
  console.log('Started voice capture')
}

function stopVoiceCapture() {
  console.log('Stopped voice capture')
  handleVoiceCommand("Example voice command")
}
</script>