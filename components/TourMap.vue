<template>
  <div
    ref="viewportRef"
    class="map-viewport h-full w-full relative overflow-hidden bg-gray-100"
    @wheel.prevent="onWheel"
    @mousedown.prevent="onMouseDown"
    @mousemove.prevent="onMouseMove"
    @mouseup.prevent="onMouseUp"
    @mouseleave.prevent="onMouseLeave"
    @touchstart.prevent="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend.prevent="onTouchEnd"
    @touchcancel.prevent="onTouchEnd"
    :style="{ cursor: isPanning ? 'grabbing' : 'grab', 'touch-action': 'none' }"
  >
    <!-- 地图图像包装器 -->
    <div
      ref="imageWrapperRef"
      class="map-image-wrapper absolute top-0 left-0"
      :style="imageWrapperStyle"
    >
      <!-- 地图图像 -->
      <img
        v-if="mapDimensions.width && mapDimensions.height"
        :src="floorMapUrl"
        alt="Floor map"
        :width="mapDimensions.width"
        :height="mapDimensions.height"
        class="map-image block max-w-none"
        @click="onMapClick"
      />

      <!-- 展品标记 -->
      <div
        v-for="marker in positionedMarkers"
        :key="marker.id"
        class="map-marker absolute cursor-pointer"
        :style="marker.style"
        @click.stop="selectExhibit(marker)"
        @mousedown.stop
        @wheel.stop
      >
        <div
          class="marker-content w-9 h-9 rounded-full flex items-center justify-center text-base font-medium transition-all duration-200"
          :class="[
            highlightedMarkerId === marker.id
              ? 'bg-yellow-500 text-white shadow-lg ring-4 ring-yellow-200/50 scale-110'
              : 'bg-blue-600 text-white shadow-md'
          ]"
        >
          {{ marker.label || marker.id }}
        </div>
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="zoom-controls absolute top-20 right-5 z-10 flex flex-col gap-1.5">
      <button
        @click="zoomIn"
        class="zoom-button bg-black/70 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/10"
        aria-label="Zoom In"
      >
        <icon name="ph:plus" size="20" />
      </button>
      <button
        @click="zoomOut"
        class="zoom-button bg-black/70 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/10"
        aria-label="Zoom Out"
      >
        <icon name="ph:minus" size="20" />
      </button>
    </div>

    <!-- 加载指示器 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10"
    >
      <div class="text-center text-gray-700 font-medium">Loading map data...</div>
    </div>

    <!-- 错误消息 -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 z-10"
    >
      <div class="text-center text-red-700 p-4">
        <p class="font-semibold">Could not load map data</p>
        <p class="text-sm mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// 属性定义
const props = defineProps<{
  currentFloor: number
  museumId: string
}>()

// 事件定义
const emit = defineEmits(['update:currentFloor', 'exhibit-selected'])

// 地图相关状态
const viewportRef = ref<HTMLElement | null>(null)
const imageWrapperRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const highlightedMarkerId = ref<number | null>(null)

// 缩放和平移状态
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const minScale = ref(0.3)
const maxScale = ref(4)

// Touch interaction state
const touchStartX = ref(0)
const touchStartY = ref(0)
const lastTouchX = ref(0) // For single touch panning delta
const lastTouchY = ref(0)
const touchStartDistance = ref(0) // For pinch zoom
const isPinching = ref(false)

// 当前楼层地图的URL
const floorMapUrl = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                props.currentFloor === 2 ? 'floor2-3' : 'ground'
  return `/data/mapdata/floor-images/${floorId}/${floorId}.png`
})

// 地图尺寸数据（基于楼层）
const mapDimensions = computed(() => {
  const dimensions = {
    0: { width: 1800, height: 1200 }, // ground floor
    1: { width: 2000, height: 1500 }, // floor 1
    2: { width: 2200, height: 1600 }  // floor 2-3
  }
  
  return dimensions[props.currentFloor as 0 | 1 | 2] || dimensions[1]
})

// 图像包装样式
const imageWrapperStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'top left',
  cursor: isPanning.value ? 'grabbing' : 'grab'
}))

// 展品标记数据（模拟数据，实际应从API或store获取）
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
}

// 当前楼层标记
const currentFloorMarkers = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                props.currentFloor === 2 ? 'floor2-3' : 'ground'
  return exhibitMarkers[floorId as 'ground' | 'floor1' | 'floor2-3'] || []
})

// 定位后的标记
const positionedMarkers = computed(() => {
  if (!mapDimensions.value.width || !mapDimensions.value.height) return []
  
  return currentFloorMarkers.value.map(marker => {
    // 计算基于百分比的像素位置
    const baseLeft = (marker.x / 100) * mapDimensions.value.width
    const baseTop = (marker.y / 100) * mapDimensions.value.height
    
    return {
      ...marker,
      style: {
        left: `${baseLeft}px`,
        top: `${baseTop}px`,
        transform: `scale(${1 / scale.value})`,
        transformOrigin: 'center center'
      }
    }
  })
})

// ------------------------------------------------------------------------
// 方法
// ------------------------------------------------------------------------

// 缩放控制
function zoomIn() {
  const newScale = Math.min(scale.value * 1.2, maxScale.value)
  updateScale(newScale)
}

function zoomOut() {
  const newScale = Math.max(scale.value / 1.2, minScale.value)
  updateScale(newScale)
}

function updateScale(newScale: number) {
  if (viewportRef.value) {
    const viewport = viewportRef.value.getBoundingClientRect()
    const viewportCenterX = viewport.width / 2
    const viewportCenterY = viewport.height / 2
    
    // 计算当前视口中心的相对图像坐标
    const imagePointX = (viewportCenterX - translateX.value) / scale.value
    const imagePointY = (viewportCenterY - translateY.value) / scale.value
    
    // 计算新的变换
    scale.value = newScale
    translateX.value = viewportCenterX - imagePointX * newScale
    translateY.value = viewportCenterY - imagePointY * newScale
  }
}

// 鼠标滚轮缩放
function onWheel(event: WheelEvent) {
  if (!viewportRef.value) return
  
  const delta = event.deltaY
  const direction = delta > 0 ? -1 : 1
  const factor = 0.1
  
  const newScale = Math.max(
    minScale.value,
    Math.min(scale.value * (1 + factor * direction), maxScale.value)
  )
  
  // 更新缩放，以鼠标位置为中心
  const rect = viewportRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // 计算鼠标下的图像点坐标
  const imagePointX = (mouseX - translateX.value) / scale.value
  const imagePointY = (mouseY - translateY.value) / scale.value
  
  // 应用新的变换
  scale.value = newScale
  translateX.value = mouseX - imagePointX * newScale
  translateY.value = mouseY - imagePointY * newScale
}

// 平移控制
function onMouseDown(event: MouseEvent) {
  if (event.button !== 0) return // 只响应左键
  
  isPanning.value = true
  dragStartX.value = event.clientX - translateX.value
  dragStartY.value = event.clientY - translateY.value
}

function onMouseMove(event: MouseEvent) {
  if (!isPanning.value) return
  
  translateX.value = event.clientX - dragStartX.value
  translateY.value = event.clientY - dragStartY.value
}

function onMouseUp() {
  isPanning.value = false
}

function onMouseLeave() {
  isPanning.value = false
}

// 地图点击处理
function onMapClick(event: MouseEvent) {
  // 可以处理地图上的点击，例如创建新的标记
  console.log('Map clicked')
}

// 选择展品
function selectExhibit(marker: any) {
  highlightedMarkerId.value = marker.id
  emit('exhibit-selected', {
    id: marker.id,
    name: marker.name,
    description: `This is the ${marker.name} exhibit.`,
    floor: props.currentFloor
  })
}

// 高亮展品（供父组件调用）
function highlightExhibit(exhibitId: number) {
  highlightedMarkerId.value = exhibitId
  
  // 如果需要，可以还执行其他操作，例如居中展示展品
  centerOnExhibit(exhibitId)
}

// 居中显示展品
function centerOnExhibit(exhibitId: number) {
  const marker = positionedMarkers.value.find(m => m.id === exhibitId)
  if (!marker || !viewportRef.value) return
  
  const viewport = viewportRef.value.getBoundingClientRect()
  const markerX = marker.x / 100 * mapDimensions.value.width
  const markerY = marker.y / 100 * mapDimensions.value.height
  
  translateX.value = viewport.width / 2 - markerX * scale.value
  translateY.value = viewport.height / 2 - markerY * scale.value
}

// 重置视图
function resetView() {
  if (viewportRef.value) {
    const viewport = viewportRef.value.getBoundingClientRect()
    scale.value = 1
    translateX.value = (viewport.width - mapDimensions.value.width) / 2
    translateY.value = (viewport.height - mapDimensions.value.height) / 2
  }
}

// 监听楼层变化
watch(() => props.currentFloor, () => {
  // 当楼层改变时，可能需要调整视图
  highlightedMarkerId.value = null
  resetView()
})

// 组件初始化
onMounted(() => {
  // 初始化地图视图
  resetView()
})

// ------------------------------------------------------------------------
// Touch Event Handlers
// ------------------------------------------------------------------------
function getDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

function onTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    // Single finger touch - Start panning
    isPanning.value = true;
    isPinching.value = false; // Ensure not pinching
    const touch = event.touches[0];
    touchStartX.value = touch.clientX - translateX.value; // Store relative start
    touchStartY.value = touch.clientY - translateY.value;
    lastTouchX.value = touch.clientX; // Store absolute start for delta calculation in move
    lastTouchY.value = touch.clientY;
  } else if (event.touches.length === 2) {
    // Two finger touch - Start pinch zoom
    isPanning.value = false; // Ensure not panning
    isPinching.value = true;
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    touchStartDistance.value = getDistance(touch1, touch2);

    // Store initial translation and scale for relative calculations
    dragStartX.value = translateX.value; // Re-use dragStart for initial translation
    dragStartY.value = translateY.value;
    // scaleStartValue = scale.value; // Need a state for initial scale if doing relative scale calc

  }
}

function onTouchMove(event: TouchEvent) {
  if (isPanning.value && event.touches.length === 1) {
    // Single finger move - Pan
    const touch = event.touches[0];
    // Calculate absolute delta from last move event for smoother panning
    // const deltaX = touch.clientX - lastTouchX.value;
    // const deltaY = touch.clientY - lastTouchY.value;
    // translateX.value += deltaX;
    // translateY.value += deltaY;
    // lastTouchX.value = touch.clientX;
    // lastTouchY.value = touch.clientY;

     // Calculate relative translation
     translateX.value = touch.clientX - touchStartX.value;
     translateY.value = touch.clientY - touchStartY.value;

  } else if (isPinching.value && event.touches.length === 2) {
    // Two finger move - Pinch zoom
    if (!viewportRef.value) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = getDistance(touch1, touch2);
    const scaleFactor = currentDistance / touchStartDistance.value;

    let newScale = Math.max(
        minScale.value,
        Math.min(scale.value * scaleFactor, maxScale.value) // Apply relative scale factor
    );

    // --- Zoom towards the midpoint of the fingers ---
    const midpoint = getMidpoint(touch1, touch2);
    const rect = viewportRef.value.getBoundingClientRect();
    const pinchCenterX = midpoint.x - rect.left;
    const pinchCenterY = midpoint.y - rect.top;

    // Calculate the image point under the pinch center BEFORE scaling
    const imagePointX = (pinchCenterX - translateX.value) / scale.value;
    const imagePointY = (pinchCenterY - translateY.value) / scale.value;

    // Apply the new scale temporarily to calculate new translation
    const oldScale = scale.value; // Store old scale for potential revert or smoother calc
    scale.value = newScale;

    // Calculate the new translation needed to keep the same image point under the pinch center AFTER scaling
    translateX.value = pinchCenterX - imagePointX * newScale;
    translateY.value = pinchCenterY - imagePointY * newScale;

    // Update start distance for continuous scaling feel
    touchStartDistance.value = currentDistance;
  }
}

function onTouchEnd(event: TouchEvent) {
  // If touches drop to 1, might transition from pinch to pan
  if (isPinching.value && event.touches.length === 1) {
      isPinching.value = false;
      isPanning.value = true; // Start panning with the remaining finger
      const touch = event.touches[0];
      touchStartX.value = touch.clientX - translateX.value;
      touchStartY.value = touch.clientY - translateY.value;
      // lastTouchX.value = touch.clientX; // Reset last touch for delta panning
      // lastTouchY.value = touch.clientY;
  } else if (event.touches.length === 0) {
      // All fingers lifted
      isPanning.value = false;
      isPinching.value = false;
  }
}

// 暴露方法给父组件
defineExpose({
  highlightExhibit,
  resetView,
  centerOnExhibit
})
</script> 