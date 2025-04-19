<template>
  <div 
    class="bg-opacity-95 backdrop-blur-sm shadow-lg flex items-center px-4 py-2"
    v-motion
    :initial="{ y: 100, opacity: 0 }"
    :enter="{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
  >
    <!-- 左侧按钮组 -->
    <div class="flex space-x-2">
      <button 
        class="flex items-center justify-center h-10 w-10 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        @click="$emit('open-guide-dialog')"
        title="Ask Guide"
        v-motion:hover="{ scale: 1.05 }"
        v-motion:tap="{ scale: 0.95 }"
      >
        <span class="material-icons">question_answer</span>
      </button>
    </div>
    
    <!-- 中央导游状态 -->
    <div class="flex-1 flex justify-center">
      <div class="flex items-center" v-if="isGuideExplaining || isListening">
        <GuideAvatar :speaking="isGuideExplaining" class="mr-2" />
        <div 
          class="text-sm font-medium" 
          :class="isGuideExplaining ? 'text-green-600' : 'text-blue-600'"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
        >
          {{ isGuideExplaining ? 'Guide is speaking...' : isListening ? 'Listening...' : '' }}
        </div>
      </div>
    </div>
    
    <!-- 右侧语音按钮 -->
    <div class="relative">
      <button
        class="flex items-center justify-center h-11 w-11 bg-blue-600 rounded-full shadow-md text-white cursor-pointer overflow-hidden transition-all"
        @mousedown="startVoiceCapture"
        @mouseup="stopVoiceCapture"
        @touchstart="startVoiceCapture"
        @touchend="stopVoiceCapture"
        @mouseout="cancelVoiceIfNeeded"
        v-motion:active="{ scale: 0.95 }"
        v-motion:hover="{ scale: 1.05, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)' }"
      >
        <span v-if="!isListening" class="material-icons text-xl">mic</span>
        <span v-else class="material-icons text-xl">mic</span>
        
        <!-- 录音中的波纹动画 -->
        <div v-if="isListening" class="absolute inset-0 flex items-center justify-center">
          <div 
            class="absolute inset-0 bg-blue-400 bg-opacity-30 rounded-full"
            v-motion
            :animate="{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }"
            :transition="{ repeat: Infinity, duration: 1500 }"
          ></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import { ref, onMounted } from 'vue'
import GuideAvatar from './GuideAvatar.vue'

const tourStore = useTourStore()
const { isGuideExplaining } = storeToRefs(tourStore)
const { startListening, stopListening, isListening, transcriptText } = useVoiceNavigation()

// 定义事件
defineEmits(['open-guide-dialog'])

// 按钮悬停状态
const isButtonHovered = ref(false)

// 处理语音输入
function startVoiceCapture(event: Event) {
  event.preventDefault()
  isButtonHovered.value = true
  if (!isGuideExplaining.value) {
    startListening()
  }
}

function stopVoiceCapture() {
  stopListening()
  isButtonHovered.value = false
}

function cancelVoiceIfNeeded() {
  if (isListening.value) {
    stopListening()
  }
  isButtonHovered.value = false
}

// 确保在组件销毁时停止语音识别和合成
</script>

<style scoped>
/* 移动设备上的优化 */
@media (max-width: 640px) {
  .border-t {
    border-top-width: 2px;
  }
}

/* 在iOS环境下添加底部安全区域内边距 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  div {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom)) !important;
  }
}
</style>