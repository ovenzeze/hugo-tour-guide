<template>
  <div class="fixed bottom-0 left-0 right-0 h-16 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg z-50">
    <div class="flex items-center justify-between px-4 h-full max-w-screen-xl mx-auto">
      <!-- 导游头像 -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden relative">
          <!-- 使用内联SVG代替图片 -->
          <div class="flex items-center justify-center text-white">
            <span class="material-icons text-xl">person</span>
          </div>
          <!-- 语音波浪动画 -->
          <div v-if="isSpeaking" class="absolute inset-0 flex items-center justify-center">
            <div class="voice-wave"></div>
          </div>
        </div>
        <div class="text-sm text-gray-700 font-medium">Tour Guide</div>
      </div>

      <!-- 中间状态指示 -->
      <div v-if="statusText" class="text-center text-sm text-gray-600 flex-1 px-4 truncate">
        {{ statusText }}
      </div>

      <!-- 右侧操作按钮 -->
      <div class="flex items-center space-x-3">
        <!-- 楼层切换按钮 -->
        <div class="flex space-x-2 items-center mr-2">
          <button
            v-for="floor in ['G', '1', '2-3']" 
            :key="floor"
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-200"
            :class="currentFloor === floor ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            @click="changeFloor(floor)"
          >
            {{ floor }}
          </button>
        </div>

        <!-- 开始语音导览 -->
        <button 
          class="h-10 px-4 rounded-full bg-green-500 text-white flex items-center space-x-1 hover:bg-green-600 transition-colors duration-200"
          @click="startTour"
        >
          <span class="material-icons text-sm">play_arrow</span>
          <span>Guide</span>
        </button>

        <!-- 语音询问按钮 -->
        <button 
          class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
          @touchstart="startListening"
          @touchend="stopListening"
          @mousedown="startListening"
          @mouseup="stopListening"
          @mouseleave="stopListening"
        >
          <span class="material-icons">{{ isListening ? 'mic' : 'mic_none' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 定义属性
const props = defineProps({
  currentFloor: {
    type: String,
    default: '1'
  }
});

// 定义事件
const emit = defineEmits(['open-guide-dialog', 'update:currentFloor', 'start-tour']);

// 状态变量
const isSpeaking = ref(false);
const isListening = ref(false);
const statusText = ref('');

// 开始语音导览
function startTour() {
  emit('start-tour');
  isSpeaking.value = true;
  statusText.value = 'Starting guided tour...';
  
  // 模拟语音结束
  setTimeout(() => {
    isSpeaking.value = false;
    statusText.value = '';
  }, 5000);
}

// 切换楼层
function changeFloor(floor: string) {
  emit('update:currentFloor', floor === 'G' ? 0 : 
                             floor === '1' ? 1 : 
                             floor === '2-3' ? 2 : 1);
}

// 开始语音识别
function startListening() {
  isListening.value = true;
  statusText.value = 'Listening...';
}

// 停止语音识别
function stopListening() {
  if (!isListening.value) return;
  
  isListening.value = false;
  emit('open-guide-dialog');
  statusText.value = '';
}

// 检测语音合成状态
function checkSpeechStatus() {
  if (window.speechSynthesis) {
    isSpeaking.value = window.speechSynthesis.speaking;
    
    if (isSpeaking.value) {
      if (!statusText.value) {
        statusText.value = 'Guide is speaking...';
      }
    } else if (statusText.value === 'Guide is speaking...') {
      statusText.value = '';
    }
  }
}

// 设置语音状态检查定时器
let statusCheckInterval: number | null = null;

onMounted(() => {
  statusCheckInterval = window.setInterval(checkSpeechStatus, 500);
});

onBeforeUnmount(() => {
  if (statusCheckInterval !== null) {
    clearInterval(statusCheckInterval);
  }
});
</script>

<style scoped>
/* 语音波浪动画 */
.voice-wave {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: voice-wave 1.5s infinite ease-in-out;
}

@keyframes voice-wave {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>