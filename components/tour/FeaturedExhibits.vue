<template>
  <div>
    <h2
      class="text-xl font-semibold mb-3"
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.4 } }"
    >
      Featured Exhibits
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ExhibitCard
        v-for="(exhibit, index) in exhibits"
        :key="exhibit.id"
        :exhibit="exhibit"
        :delay="0.7 + index * 0.1"
        @view-details="$emit('view-details', exhibit)"
        @add-to-route="$emit('add-to-route', exhibit)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import ExhibitCard from './ExhibitCard.vue'

// 定义展品类型
interface Exhibit {
  id: number;
  name: string;
  description: string;
  floor: number;
}

// 定义Props
defineProps({
  exhibits: {
    type: Array as PropType<Exhibit[]>,
    required: true
  }
})

// 定义事件
defineEmits(['view-details', 'add-to-route'])
</script>