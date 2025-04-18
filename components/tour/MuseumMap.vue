<template>
  <div class="museum-map-container relative w-full h-full overflow-hidden rounded-lg">
    <!-- PDF 地图嵌入 -->
    <iframe 
      src="/met-map.pdf#page=1&view=FitH" 
      class="w-full h-full border-0"
      title="Metropolitan Museum of Art Map"
    ></iframe>
    
    <!-- 地图标记 -->
    <div class="absolute z-10 map-markers">
      <!-- 这些标记将根据实际地图位置调整 -->
      <div class="absolute" style="top: 30%; left: 25%;">
        <div class="w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
        <div class="w-4 h-4 bg-red-500 rounded-full absolute top-0"></div>
        <div class="absolute top-5 left-0 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
          Egyptian Collection
        </div>
      </div>
      
      <div class="absolute" style="top: 45%; left: 60%;">
        <div class="w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        <div class="w-4 h-4 bg-blue-500 rounded-full absolute top-0"></div>
        <div class="absolute top-5 left-0 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
          Greek Sculptures
        </div>
      </div>
      
      <div class="absolute" style="top: 60%; left: 40%;">
        <div class="w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
        <div class="w-4 h-4 bg-green-500 rounded-full absolute top-0"></div>
        <div class="absolute top-5 left-0 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
          Modern Art Gallery
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件属性
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
})

// 可以添加方法来切换楼层、放大缩小等功能
</script>

<style scoped>
.museum-map-container {
  background-color: #f8f8f8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-markers {
  pointer-events: none; /* 让标记不影响地图的交互 */
}
</style>