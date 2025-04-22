<template>
  <div class="h-full w-full relative">
    <div class="h-full w-full">
      <!-- 使用图片作为主要地图 -->
      <div class="relative w-full h-full">
        <!-- 图片地图 -->
        <div class="absolute inset-0 overflow-hidden">
          <img
            :src="currentFloorImageUrl"
            alt="Floor map"
            class="w-full h-full object-contain"
            @click="onMapImageClick"
          />
        </div>
        
        <!-- 展品标记点 -->
        <div v-for="marker in currentFloorMarkers" :key="marker.id" 
          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          :style="{ left: `${marker.x}%`, top: `${marker.y}%` }"
          @click="selectExhibit(marker)">
          <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            :class="[
              highlightedMarkerId === marker.id 
                ? 'bg-yellow-500 text-white shadow-lg scale-125 ring-4 ring-yellow-200' 
                : 'bg-blue-500 text-white hover:scale-110'
            ]">
            {{ marker.label || marker.id }}
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="!imageLoaded" 
           class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <div class="text-center">
          <p class="text-gray-600">正在加载地图数据...</p>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <div class="text-center text-red-600">
          <p>无法加载地图数据</p>
          <p class="text-sm">{{ loadError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

// 定义Props
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
});

// 定义Emits
const emit = defineEmits(['select-exhibit', 'update:currentFloor', 'map-error', 'exhibit-selected']);

// Refs
const highlightedMarkerId = ref<number | null>(null);
const loadError = ref<string | null>(null);
const imageLoaded = ref(false);

// 楼层图片URL
const currentFloorImageUrl = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return `/data/mapdata/floor-images/${floorId}/${floorId}.png`;
});

// 模拟的展品标记点数据
const exhibitMarkers = {
  'ground': [
    { id: 1, x: 50, y: 35, label: '1', name: 'Great Hall' },
    { id: 2, x: 25, y: 55, label: '2', name: 'Egyptian Art' },
    { id: 3, x: 75, y: 65, label: '3', name: 'Greek and Roman Art' }
  ],
  'floor1': [
    { id: 4, x: 50, y: 30, label: '1', name: 'European Sculpture' },
    { id: 5, x: 35, y: 50, label: '2', name: 'Medieval Art' },
    { id: 6, x: 65, y: 60, label: '3', name: 'The American Wing' }
  ],
  'floor2-3': [
    { id: 7, x: 25, y: 30, label: '1', name: 'Modern Art' },
    { id: 8, x: 60, y: 35, label: '2', name: 'European Paintings' },
    { id: 9, x: 75, y: 60, label: '3', name: 'Asian Art' }
  ]
};

// 当前楼层的标记点
const currentFloorMarkers = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return exhibitMarkers[floorId] || [];
});

// 图片地图点击事件
function onMapImageClick(event: MouseEvent) {
  if (!event.target) return;
  
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  console.log(`点击位置: ${x.toFixed(2)}%, ${y.toFixed(2)}%`);
  
  // 寻找最近的展品点
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  const markers = exhibitMarkers[floorId] || [];
  
  let closestMarker = null;
  let minDistance = Infinity;
  
  markers.forEach(marker => {
    const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
    if (distance < minDistance && distance < 10) { // 10%的点击容差
      minDistance = distance;
      closestMarker = marker;
    }
  });
  
  if (closestMarker) {
    selectExhibit(closestMarker);
  }
}

// 选择展品
function selectExhibit(exhibit) {
  // 复制展品对象，添加用户交互标记
  const exhibitWithInteraction = {
    ...exhibit,
    userInteraction: true // 添加标记表示这是由用户点击触发的
  }
  
  // 触发事件，传递带标记的展品对象
  emit('exhibit-selected', exhibitWithInteraction)
}

// 加载图片
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageLoaded.value = true;
      resolve();
    };
    img.onerror = () => {
      imageLoaded.value = false;
      loadError.value = `无法加载图片: ${url}`;
      reject(new Error(`无法加载图片: ${url}`));
    };
    img.src = url;
  });
}

// 监听currentFloor属性变化
watch(() => props.currentFloor, (newFloor) => {
  console.log(`Floor prop changed to ${newFloor}. Loading new data...`);
  
  const floorId = newFloor === 1 ? 'floor1' : 
                 newFloor === 2 ? 'floor2-3' : 'ground';
  
  preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
    .catch(error => {
      console.error('Error loading floor image:', error);
      loadError.value = error.message;
    });
  
  // 重置高亮状态
  highlightedMarkerId.value = null;
}, { immediate: true });

// 高亮展品
function highlightExhibit(id: number) {
  console.log(`MapSection: Highlighting exhibit ${id}`);
  highlightedMarkerId.value = id;
}

// 初始化
onMounted(() => {
  // 在初始化时预加载第一张图片
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  
  preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
    .catch(error => {
      console.error('Error loading initial floor image:', error);
      loadError.value = error.message;
    });
});

// 暴露方法给父组件
defineExpose({
  highlightExhibit
});
</script>

<style>
.floor-map-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>