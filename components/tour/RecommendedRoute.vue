<template>
  <div class="mb-6">
    <h2
      class="text-xl font-semibold mb-3"
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }"
    >
      Recommended Route
    </h2>
    <div
      class="border rounded-lg p-4 shadow-sm"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }"
    >
      <div class="flex justify-between mb-3">
        <div>
          <span class="font-medium">Estimated Time:</span> 1 hour 15 minutes
        </div>
        <div>
          <span class="font-medium">Distance:</span> 0.8 km
        </div>
      </div>
      <div class="space-y-3">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-gray-50"
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
          <div
            class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2"
            v-motion:hover="{ scale: 1.1, rotate: 5 }"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <span>{{ item.name }}</span>
            <div class="text-xs text-gray-500">{{ item.location }}</div>
          </div>
          <button
            class="text-blue-600 text-sm hover:underline"
            v-motion:tap="{ scale: 0.95 }"
            @click.stop="$emit('show-on-map', item)"
          >
            Show
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

// 定义展品项目类型
interface ExhibitItem {
  id: number;
  name: string;
  location: string;
  floor: number;
  highlight: boolean;
}

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