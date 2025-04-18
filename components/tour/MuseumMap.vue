<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="bg-gray-100 p-3 flex justify-between items-center border-b">
      <h3 class="font-medium">Museum Map</h3>
      <div class="flex space-x-2">
        <button 
          class="p-1 bg-white border rounded hover:bg-gray-50"
          @click="zoomIn"
          :disabled="zoomLevel >= maxZoom"
        >
          <span>+</span>
        </button>
        <button 
          class="p-1 bg-white border rounded hover:bg-gray-50"
          @click="zoomOut"
          :disabled="zoomLevel <= minZoom"
        >
          <span>-</span>
        </button>
        <button 
          class="p-1 bg-white border rounded hover:bg-gray-50"
          @click="resetView"
        >
          <span>↺</span>
        </button>
      </div>
    </div>
    
    <div class="relative">
      <!-- Map Container -->
      <div 
        class="relative overflow-hidden bg-gray-200" 
        style="height: 400px;"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
      >
        <!-- Map Image with transform for pan and zoom -->
        <div 
          class="absolute transition-transform duration-100"
          :style="{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }"
        >
          <!-- Placeholder for actual map image -->
          <div class="relative">
            <div class="bg-white border w-[800px] h-[600px] flex items-center justify-center">
              <span class="text-gray-400">Museum Map Image</span>
            </div>
            
            <!-- Map Markers -->
            <div class="absolute top-[150px] left-[200px]">
              <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2">
                <span class="text-xs">1</span>
              </div>
            </div>
            
            <div class="absolute top-[250px] left-[350px]">
              <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2">
                <span class="text-xs">2</span>
              </div>
            </div>
            
            <div class="absolute top-[180px] left-[500px]">
              <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2">
                <span class="text-xs">3</span>
              </div>
            </div>
            
            <!-- Current Location -->
            <div class="absolute top-[300px] left-[250px]">
              <div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
                <span class="text-xs">You</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Floor Selector -->
      <div class="absolute top-4 right-4 bg-white border rounded shadow-md">
        <div class="p-2 text-center font-medium border-b">
          Floor
        </div>
        <div>
          <button 
            v-for="floor in [3, 2, 1]" 
            :key="floor"
            class="block w-10 h-10 flex items-center justify-center hover:bg-gray-100"
            :class="currentFloor === floor ? 'bg-blue-100 text-blue-600' : ''"
            @click="currentFloor = floor"
          >
            {{ floor }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="p-3 border-t bg-gray-50">
      <div class="flex justify-between text-sm">
        <div>
          <span class="font-medium">Current Floor:</span> {{ currentFloor }}
        </div>
        <div>
          <span class="font-medium">Zoom:</span> {{ Math.round(zoomLevel * 100) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Map state
const zoomLevel = ref(1)
const minZoom = 0.5
const maxZoom = 3
const position = ref({ x: 0, y: 0 })
const currentFloor = ref(1)

// Dragging state
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const positionStart = ref({ x: 0, y: 0 })

// Zoom functions
function zoomIn() {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.2, maxZoom)
  }
}

function zoomOut() {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value = Math.max(zoomLevel.value - 0.2, minZoom)
  }
}

function resetView() {
  zoomLevel.value = 1
  position.value = { x: 0, y: 0 }
}

// Drag functions
function startDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = true
  
  // Get client position based on event type
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  dragStart.value = { x: clientX, y: clientY }
  positionStart.value = { ...position.value }
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  
  // Prevent default to avoid scrolling on touch devices
  event.preventDefault()
  
  // Get client position based on event type
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  // Calculate new position
  const dx = clientX - dragStart.value.x
  const dy = clientY - dragStart.value.y
  
  position.value = {
    x: positionStart.value.x + dx,
    y: positionStart.value.y + dy
  }
}

function endDrag() {
  isDragging.value = false
}
</script>