<template>
  <div class="mb-6">
    <div class="flex items-center justify-between mb-3">
      <h2
        class="text-xl font-semibold"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }"
      >
        Recommended Route
      </h2>
      <button 
        class="text-sm text-blue-600 flex items-center"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 0.5 } }"
        v-motion:hover="{ scale: 1.05 }"
      >
        <span>Start Tour</span>
        <span class="material-icons text-sm ml-1">play_arrow</span>
      </button>
    </div>
    <div
      class="border rounded-lg shadow-sm overflow-hidden bg-white"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }"
    >
      <!-- 路线信息 -->
      <div class="bg-gradient-to-r from-blue-50 to-white p-4 border-b">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">schedule</span>
            <span class="text-sm">Estimated Time: <span class="font-medium">1 hour 15 minutes</span></span>
          </div>
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">straighten</span>
            <span class="text-sm">Distance: <span class="font-medium">0.8 km</span></span>
          </div>
        </div>
      </div>

      <!-- 路线项目列表 -->
      <div class="divide-y max-h-[300px] overflow-y-auto">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="flex items-center p-3 transition-all duration-300 cursor-pointer"
          :class="{ 'bg-blue-50': item.highlight }"
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{
            opacity: 1,
            x: 0,
            transition: {
              delay: 0.5 + index * 0.1,
              duration: 0.4
            }
          }"
          @click="$emit('highlight-exhibit', item)"
        >
          <!-- 路线项目编号 -->
          <div
            class="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 font-medium shadow-sm"
            v-motion:hover="{ scale: 1.1, rotate: 5 }"
          >
            {{ index + 1 }}
          </div>
          
          <!-- 项目信息 -->
          <div class="flex-1">
            <div class="font-medium text-gray-900">{{ item.name }}</div>
            <div class="text-xs text-gray-500 flex items-center mt-1">
              <span class="material-icons text-xs mr-1">place</span>
              {{ item.location }}
            </div>
          </div>
          
          <!-- 按钮组 -->
          <div class="flex space-x-2">
            <!-- 在地图上显示 -->
            <button
              class="text-blue-600 text-sm hover:underline flex items-center"
              v-motion:tap="{ scale: 0.95 }"
              @click.stop="$emit('show-on-map', item)"
            >
              <span class="material-icons text-sm mr-1">map</span>
              <span class="hidden sm:inline">Map</span>
            </button>
            
            <!-- 导游介绍 -->
            <button
              class="text-green-600 text-sm hover:underline hidden sm:flex items-center"
              v-motion:tap="{ scale: 0.95 }"
              @click.stop="explainExhibit(item)"
            >
              <span class="material-icons text-sm mr-1">record_voice_over</span>
              <span>Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'

// 定义展品项目类型
interface ExhibitItem {
  id: number;
  name: string;
  location: string;
  floor: number;
  highlight: boolean;
  description?: string;
}

// 使用语音导航
const { explainExhibit } = useVoiceNavigation()

// 定义Props
defineProps({
  items: {
    type: Array as PropType<ExhibitItem[]>,
    required: true
  }
})

// 定义事件
defineEmits(['highlight-exhibit', 'show-on-map'])
</script>

<style scoped>
/* 自定义滚动条 */
.max-h-\[300px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[300px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>