<template>
  <div class="my-8">
    <div class="flex items-center justify-between mb-4">
      <h2
        class="text-xl font-semibold"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.4 } }"
      >
        Featured Exhibits
      </h2>
      
      <button 
        class="text-sm text-blue-600 flex items-center"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 0.7 } }"
        v-motion:hover="{ scale: 1.05 }"
      >
        <span>View All</span>
        <span class="material-icons text-sm ml-1">arrow_forward</span>
      </button>
    </div>
    
    <!-- 展品滚动区域 -->
    <div 
      class="relative"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 0.7 } }"
    >
      <!-- 左滚动按钮 -->
      <button 
        v-if="exhibits.length > 3"
        class="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center"
        v-motion:hover="{ scale: 1.1 }"
        v-motion:tap="{ scale: 0.95 }"
        @click="scrollExhibits('left')"
      >
        <span class="material-icons text-gray-600">chevron_left</span>
      </button>
      
      <!-- 滚动容器 -->
      <div 
        ref="scrollContainer"
        class="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar snap-x"
      >
        <ExhibitCard
          v-for="(exhibit, index) in exhibits"
          :key="exhibit.id"
          :exhibit="exhibit"
          :delay="0.7 + index * 0.1"
          class="snap-start min-w-[300px] flex-shrink-0"
          @view-details="$emit('view-details', exhibit)"
          @add-to-route="$emit('add-to-route', exhibit)"
        />
      </div>
      
      <!-- 右滚动按钮 -->
      <button 
        v-if="exhibits.length > 3"
        class="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center"
        v-motion:hover="{ scale: 1.1 }"
        v-motion:tap="{ scale: 0.95 }"
        @click="scrollExhibits('right')"
      >
        <span class="material-icons text-gray-600">chevron_right</span>
      </button>
    </div>
    
    <!-- 指示器小点 -->
    <div v-if="exhibits.length > 3" class="flex justify-center space-x-2 mt-4">
      <button 
        v-for="(_, index) in Math.ceil(exhibits.length / 3)"
        :key="index"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="currentPage === index ? 'bg-blue-600 w-4' : 'bg-gray-300'"
        @click="scrollToPage(index)"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { PropType } from 'vue'
import ExhibitCard from './ExhibitCard.vue'

// 定义展品类型
interface Exhibit {
  id: number;
  name: string;
  description: string;
  floor: number;
}

// 滚动控制
const scrollContainer = ref<HTMLElement | null>(null)
const currentPage = ref(0)

// 计算总页数
const totalPages = computed(() => Math.ceil(props.exhibits.length / 3))

// 定义Props
const props = defineProps({
  exhibits: {
    type: Array as PropType<Exhibit[]>,
    required: true
  }
})

// 定义事件
defineEmits(['view-details', 'add-to-route'])

// 滚动方法
function scrollExhibits(direction: 'left' | 'right') {
  if (!scrollContainer.value) return
  
  const container = scrollContainer.value
  const scrollAmount = container.offsetWidth * 0.8
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    if (currentPage.value > 0) currentPage.value--
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    if (currentPage.value < totalPages.value - 1) currentPage.value++
  }
}

// 滚动到指定页面
function scrollToPage(pageIndex: number) {
  if (!scrollContainer.value) return
  
  const container = scrollContainer.value
  const scrollAmount = container.offsetWidth * pageIndex
  container.scrollTo({ left: scrollAmount, behavior: 'smooth' })
  currentPage.value = pageIndex
}

// 监听滚动位置更新当前页
onMounted(() => {
  if (!scrollContainer.value) return
  
  const container = scrollContainer.value
  container.addEventListener('scroll', () => {
    if (!container) return
    const pageWidth = container.offsetWidth
    const scrollPosition = container.scrollLeft
    currentPage.value = Math.round(scrollPosition / pageWidth)
  })
})
</script>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>