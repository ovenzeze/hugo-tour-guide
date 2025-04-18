<template>
  <div class="museum-map-container relative w-full h-full overflow-hidden rounded-lg">
    <client-only>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        
        <!-- 展品标记 -->
        <l-marker
          v-for="(marker, index) in filteredMarkers"
          :key="index"
          :lat-lng="marker.position"
          @click="selectMarker(marker)"
        >
          <l-tooltip>{{ marker.name }}</l-tooltip>
        </l-marker>
      </l-map>
    </client-only>
    
    <!-- 楼层指示器 -->
    <div class="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow-md z-20">
      <span class="font-medium">Floor:</span> {{ currentFloor }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 组件属性
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
})

// 地图引用
const map = ref(null)

// 地图状态
const zoom = ref(18)
const center = ref([40.7794, -73.9632]) // 大都会博物馆的坐标

// 展品数据
const markers = ref([
  {
    id: 1,
    name: 'Egyptian Collection',
    description: 'Ancient artifacts from Egypt, including mummies and hieroglyphics',
    position: [40.7800, -73.9642],
    floor: 1,
    location: 'Floor 1, Room 4',
    highlighted: false
  },
  {
    id: 2,
    name: 'Greek Sculptures',
    description: 'Classical Greek sculptures and pottery',
    position: [40.7798, -73.9625],
    floor: 1,
    location: 'Floor 1, Room 7',
    highlighted: false
  },
  {
    id: 3,
    name: 'Renaissance Paintings',
    description: 'European paintings from the Renaissance period',
    position: [40.7790, -73.9635],
    floor: 2,
    location: 'Floor 2, Room 3',
    highlighted: false
  },
  {
    id: 4,
    name: 'Modern Art Gallery',
    description: 'Contemporary and modern art pieces',
    position: [40.7785, -73.9628],
    floor: 2,
    location: 'Floor 2, Room 8',
    highlighted: false
  }
])

// 根据当前楼层过滤标记
const filteredMarkers = computed(() => {
  return markers.value.filter(marker => marker.floor === props.currentFloor)
})

// 选择标记
function selectMarker(marker) {
  // 重置所有标记的高亮状态
  markers.value.forEach(m => m.highlighted = false)
  
  // 设置当前标记为高亮
  marker.highlighted = true
  
  // 触发事件通知父组件
  emit('select-exhibit', marker)
}

// 定义事件
const emit = defineEmits(['select-exhibit'])

// 暴露方法给父组件
defineExpose({
  // 缩放方法
  zoomIn() {
    if (map.value) {
      zoom.value += 1
    }
  },
  zoomOut() {
    if (map.value) {
      zoom.value -= 1
    }
  },
  // 高亮特定展品
  highlightExhibit(exhibitId) {
    const exhibit = markers.value.find(m => m.id === exhibitId)
    if (exhibit) {
      // 重置所有标记的高亮状态
      markers.value.forEach(m => m.highlighted = false)
      
      // 设置当前标记为高亮
      exhibit.highlighted = true
      
      // 更新地图中心
      center.value = exhibit.position
    }
  }
})

// 监听楼层变化
watch(() => props.currentFloor, (newFloor) => {
  console.log(`Switched to floor ${newFloor}`)
})

// 组件挂载后
onMounted(() => {
  console.log('MuseumMap component mounted')
})
</script>

<style>
.museum-map-container {
  background-color: #f8f8f8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>