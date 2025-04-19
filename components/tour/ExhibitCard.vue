<template>
  <div
    class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    v-motion
    :initial="{ opacity: 0, y: 30 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.5
      }
    }"
    v-motion:hover="{ y: -5 }"
  >
    <div class="bg-gray-200 h-40 flex items-center justify-center relative overflow-hidden">
      <span class="text-gray-500">Exhibit Image</span>
      <div class="absolute inset-0 bg-blue-600 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
    </div>
    <div class="p-3">
      <h3 class="font-medium">{{ exhibit.name }}</h3>
      <p class="text-sm text-gray-600 mb-2">{{ exhibit.description }}</p>
      <div class="flex justify-between">
        <button
          class="text-blue-600 text-sm hover:underline"
          v-motion:tap="{ scale: 0.95 }"
          @click="$emit('view-details')"
        >
          View Details
        </button>
        <button
          class="text-blue-600 text-sm hover:underline"
          v-motion:tap="{ scale: 0.95 }"
          @click="$emit('add-to-route')"
        >
          Add to Route
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

// 定义展品类型
interface Exhibit {
  id: number;
  name: string;
  description: string;
  floor: number;
}

// 定义Props
defineProps({
  exhibit: {
    type: Object as PropType<Exhibit>,
    required: true
  },
  delay: {
    type: Number,
    default: 0.7
  }
})

// 定义事件
defineEmits(['view-details', 'add-to-route'])
</script>