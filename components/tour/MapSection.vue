<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-3">
      <h2
        class="text-xl font-semibold"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
      >
        Metropolitan Museum Map
      </h2>
      
      <!-- 楼层选择器 -->
      <div
        class="flex space-x-2"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 0.3, duration: 0.4 } }"
      >
        <button
          v-for="floor in [1, 2]"
          :key="floor"
          class="px-3 py-1 rounded transition-all duration-200"
          :class="currentFloor === floor ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          @click="$emit('update:currentFloor', floor)"
          v-motion:tap="{ scale: 0.95 }"
        >
          Floor {{ floor }}
        </button>
      </div>
    </div>
    
    <div
      class="h-80 rounded-lg overflow-hidden mb-2 relative shadow-md"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.5 } }"
    >
      <MuseumMap 
        ref="mapRef"
        :current-floor="currentFloor" 
        @select-exhibit="$emit('exhibit-selected', $event)"
        @map-error="handleMapError"
      />
      
      <!-- 地图状态诊断 -->
      <div v-if="mapDiagnostics.enabled" class="absolute bottom-0 right-0 bg-white bg-opacity-80 p-2 text-xs text-gray-700 max-w-xs overflow-auto max-h-32 rounded-tl shadow-md">
        <p><strong>地图状态:</strong> {{ mapDiagnostics.status }}</p>
        <p v-if="mapDiagnostics.error"><strong>错误:</strong> {{ mapDiagnostics.error }}</p>
      </div>
    </div>
    
    <div class="flex justify-between">
      <div
        class="text-sm text-gray-600"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 0.4 } }"
      >
        <span class="font-medium">Current View:</span> {{ currentFloor === 1 ? 'First Floor' : 'Second Floor' }}
      </div>
      
      <!-- 地图诊断切换按钮 - 仅在开发环境显示 -->
      <button 
        v-if="isDev"
        @click="toggleDiagnostics" 
        class="text-xs text-gray-500 hover:text-gray-700"
      >
        {{ mapDiagnostics.enabled ? '隐藏诊断' : '显示地图诊断' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import MuseumMap from '~/components/tour/MuseumMap.vue'

// 定义Props
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
})

// 定义事件
defineEmits(['update:currentFloor', 'exhibit-selected'])

// 定义地图组件类型
interface MapComponent {
  zoomIn: () => void;
  zoomOut: () => void;
  highlightExhibit: (id: number) => void;
}

// 地图引用
const mapRef = ref<MapComponent | null>(null)

// 地图诊断状态
const mapDiagnostics = reactive({
  enabled: false,
  status: '初始化中...',
  error: null as string | null
})

// 检测是否为开发环境
const isDev = process.env.NODE_ENV === 'development'

// 处理地图错误
function handleMapError(error: string) {
  mapDiagnostics.error = error
  mapDiagnostics.status = '加载失败'
  console.error('Map error:', error)
}

// 切换诊断显示
function toggleDiagnostics() {
  mapDiagnostics.enabled = !mapDiagnostics.enabled
}

// 暴露方法给父组件
defineExpose({
  highlightExhibit: (id: number) => mapRef.value?.highlightExhibit(id),
  zoomIn,
  zoomOut
})

// 地图缩放功能
function zoomIn() {
  if (mapRef.value) {
    mapRef.value.zoomIn()
  }
}

function zoomOut() {
  if (mapRef.value) {
    mapRef.value.zoomOut()
  }
}
</script>