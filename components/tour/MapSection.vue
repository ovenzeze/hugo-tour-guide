<template>
  <!-- Viewport: Captures events, clips content -->
  <div 
    ref="viewportRef"
    class="map-viewport h-full w-full relative overflow-hidden bg-gray-100"
    @wheel.prevent="onWheel"
    @mousedown.prevent="onMouseDown"
    @mousemove.prevent="onMouseMove"
    @mouseup.prevent="onMouseUp"
    @mouseleave.prevent="onMouseLeave"
    :style="{ cursor: isPanning ? 'grabbing' : 'grab' }"
  >
    <!-- Image Wrapper: Applies transform for pan/zoom -->
    <div 
      ref="imageWrapperRef"
      class="map-image-wrapper absolute top-0 left-0"
      :style="imageWrapperStyle"
    >
      <!-- Map Image: Use intrinsic dimensions -->
      <img
        v-if="intrinsicWidth && intrinsicHeight" 
        :src="currentFloorImageUrl"
        alt="Floor map"
        :width="intrinsicWidth"
        :height="intrinsicHeight"
        class="map-image block max-w-none"
        @click="onMapImageClick" 
      />
      
      <!-- Markers: Iterate over positionedMarkers -->
      <div 
        v-for="marker in positionedMarkers" 
        :key="marker.id" 
        class="map-marker absolute cursor-pointer"
        :style="marker.style" 
        @click.stop="selectExhibit(marker)" 
        @mousedown.stop 
        @wheel.stop 
      >
        <div class="marker-content w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
          :class="[
            highlightedMarkerId === marker.id 
              ? 'bg-yellow-500 text-white shadow-lg ring-4 ring-yellow-200' 
              : 'bg-blue-500 text-white'
          ]">
          {{ marker.label || marker.id }}
        </div>
      </div>
    </div>
    
    <!-- Zoom Controls -->
    <div class="zoom-controls absolute top-4 right-4 z-10 flex flex-col gap-1">
      <button @click="zoomIn" class="zoom-button bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
        <span class="material-icons text-lg">add</span>
      </button>
      <button @click="zoomOut" class="zoom-button bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
         <span class="material-icons text-lg">remove</span>
      </button>
    </div>

    <!-- Scale Bar: Positioned relative to viewport -->
    <div v-if="pixelsPerMeter" class="scale-bar absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded shadow">
      {{ calculateScaleBarText() }} 
    </div>

    <!-- Loading Indicator -->
    <div v-if="!imageLoaded" 
         class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
      <div class="text-center text-gray-700 font-medium">
        Loading map data...
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="loadError" 
         class="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 z-10">
      <div class="text-center text-red-700 p-4">
        <p class="font-semibold">Could not load map data</p>
        <p class="text-sm mt-1">{{ loadError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';

// Define Props
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  },
  // New props for intrinsic dimensions and scale
  intrinsicWidth: {
    type: Number,
    required: true
  },
  intrinsicHeight: {
    type: Number,
    required: true
  },
  pixelsPerMeter: {
    type: Number,
    default: null // Optional, for scale bar
  }
});

// Define Emits
const emit = defineEmits(['select-exhibit', 'update:currentFloor', 'map-error', 'exhibit-selected']);

// Refs for DOM elements
const viewportRef = ref<HTMLElement | null>(null);
const imageWrapperRef = ref<HTMLElement | null>(null);

// Refs for map state
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isPanning = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const minScale = ref(0.3); // Example min zoom
const maxScale = ref(4);  // Example max zoom

// Refs for component state
const highlightedMarkerId = ref<number | null>(null);
const loadError = ref<string | null>(null);
const imageLoaded = ref(false);

// --- Computed Properties ---

const currentFloorImageUrl = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return `/data/mapdata/floor-images/${floorId}/${floorId}.png`;
});

// Transform style for the image wrapper
const imageWrapperStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'top left', // Important for scaling from the corner initially
  cursor: isPanning.value ? 'grabbing' : 'grab'
}));

// Marker Data (Keep existing structure)
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

const currentFloorMarkers = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return exhibitMarkers[floorId] || [];
});

// Computed markers with calculated pixel positions
const positionedMarkers = computed(() => {
  if (!props.intrinsicWidth || !props.intrinsicHeight) return [];
  
  return currentFloorMarkers.value.map(marker => {
    // Calculate base pixel position on the untransformed image (at scale 1)
    const baseLeft = (marker.x / 100) * props.intrinsicWidth;
    const baseTop = (marker.y / 100) * props.intrinsicHeight;
    
    // Markers positioned relative to the imageWrapperRef, so they transform with it
    return {
      ...marker,
      // Style for the absolute positioning of the marker element
      style: {
        left: `${baseLeft}px`,
        top: `${baseTop}px`,
        // Markers should maintain their visual size regardless of zoom
        // We achieve this by applying the inverse scale transform to the marker itself
        transform: `scale(${1 / scale.value})`,
        transformOrigin: 'center center' // Scale marker from its center
      }
    };
  });
});

// --- Event Handlers ---

function onWheel(event: WheelEvent) {
  event.preventDefault();
  if (!viewportRef.value) return;

  const rect = viewportRef.value.getBoundingClientRect();
  // Calculate mouse position relative to the viewport
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Calculate mouse position relative to the image content (before zoom)
  const mouseOnImageX = (mouseX - translateX.value) / scale.value;
  const mouseOnImageY = (mouseY - translateY.value) / scale.value;

  // Determine zoom factor
  const zoomFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1; // Zoom in or out
  const newScale = Math.max(minScale.value, Math.min(maxScale.value, scale.value * zoomFactor));

  // Calculate new translation to keep the point under the mouse stationary
  const newTranslateX = mouseX - mouseOnImageX * newScale;
  const newTranslateY = mouseY - mouseOnImageY * newScale;

  scale.value = newScale;
  translateX.value = newTranslateX;
  translateY.value = newTranslateY;
}

function onMouseDown(event: MouseEvent) {
  event.preventDefault(); // Prevent image dragging etc.
  isPanning.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
}

function onMouseMove(event: MouseEvent) {
  if (!isPanning.value) return;
  event.preventDefault();

  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;

  translateX.value += dx;
  translateY.value += dy;

  // Update start position for next delta calculation
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
}

function onMouseUp(event: MouseEvent) {
  if (isPanning.value) {
    isPanning.value = false;
  }
}

function onMouseLeave(event: MouseEvent) {
  if (isPanning.value) {
    isPanning.value = false;
  }
}

// --- Methods ---

// Zoom towards the center of the viewport
function applyZoom(zoomFactor: number) {
  if (!viewportRef.value) return;

  const rect = viewportRef.value.getBoundingClientRect();
  // Viewport center
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Calculate center point relative to the image content (before zoom)
  const centerOnImageX = (centerX - translateX.value) / scale.value;
  const centerOnImageY = (centerY - translateY.value) / scale.value;

  // Calculate new scale
  const newScale = Math.max(minScale.value, Math.min(maxScale.value, scale.value * zoomFactor));

  // Calculate new translation to keep the center point stationary
  const newTranslateX = centerX - centerOnImageX * newScale;
  const newTranslateY = centerY - centerOnImageY * newScale;

  scale.value = newScale;
  translateX.value = newTranslateX;
  translateY.value = newTranslateY;
}

function zoomIn() {
  applyZoom(1.3); // Zoom in factor
}

function zoomOut() {
  applyZoom(1 / 1.3); // Zoom out factor
}

// Keep existing click logic for now, might need adjustment
function onMapImageClick(event: MouseEvent) {
  if (!event.target || !props.intrinsicWidth || !props.intrinsicHeight) return;
  
  // Calculate click position relative to the image element's top-left corner
  const imgRect = (event.target as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - imgRect.left;
  const clickY = event.clientY - imgRect.top;

  // Convert click coordinates to percentage relative to the image's *displayed* size
  const xPercent = (clickX / imgRect.width) * 100;
  const yPercent = (clickY / imgRect.height) * 100;
  
  console.log(`Adjusted click position: ${xPercent.toFixed(2)}%, ${yPercent.toFixed(2)}%`);

  // Find closest marker based on percentage distance (as before)
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  const markers = exhibitMarkers[floorId] || [];
  
  let closestMarker = null;
  let minDistance = Infinity;
  
  markers.forEach(marker => {
    const distance = Math.sqrt(Math.pow(marker.x - xPercent, 2) + Math.pow(marker.y - yPercent, 2));
    if (distance < minDistance && distance < 5) { // Reduce click tolerance for accuracy
      minDistance = distance;
      closestMarker = marker;
    }
  });
  
  if (closestMarker) {
    selectExhibit(closestMarker);
  }
}

// Selecting exhibit emits to parent
function selectExhibit(exhibit) {
  const exhibitWithInteraction = {
    ...exhibit,
    userInteraction: true
  }
  emit('exhibit-selected', exhibitWithInteraction)
}

// Keep image preloading logic
function preloadImage(url: string): Promise<void> {
  imageLoaded.value = false; // Reset loading state
  loadError.value = null;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageLoaded.value = true;
      // Reset view on new image load? Or keep current transform?
      // For now, let's reset. Add logic later if persistence is needed.
      resetView(); 
      resolve();
    };
    img.onerror = () => {
      imageLoaded.value = false;
      loadError.value = `无法加载图片: ${url}`;
      emit('map-error', loadError.value); // Emit error
      reject(new Error(`无法加载图片: ${url}`));
    };
    img.src = url;
  });
}

// Helper to reset zoom/pan
function resetView() {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
}

// Center the view (example - centers the image in the viewport)
// Might need adjustments based on desired behavior
function centerView() {
  if (!viewportRef.value || !props.intrinsicWidth || !props.intrinsicHeight) return;
  
  const viewportW = viewportRef.value.clientWidth;
  const viewportH = viewportRef.value.clientHeight;
  
  // Calculate initial scale to fit the image within the viewport
  const scaleX = viewportW / props.intrinsicWidth;
  const scaleY = viewportH / props.intrinsicHeight;
  const initialScale = Math.min(scaleX, scaleY); // Fit while maintaining aspect ratio
  
  scale.value = initialScale;
  minScale.value = initialScale * 0.5; // Adjust minScale based on fit

  // Calculate translation to center the scaled image
  translateX.value = (viewportW - props.intrinsicWidth * initialScale) / 2;
  translateY.value = (viewportH - props.intrinsicHeight * initialScale) / 2;
  
  console.log("View centered", scale.value, translateX.value, translateY.value);
}

// Watch for floor changes
watch(() => props.currentFloor, (newFloor) => {
  console.log(`Floor prop changed to ${newFloor}. Loading new data...`);
  const floorId = newFloor === 1 ? 'floor1' : 
                 newFloor === 2 ? 'floor2-3' : 'ground';
  preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
    .catch(error => {
      console.error('Error loading floor image:', error);
      // loadError already set in preloadImage
    });
  highlightedMarkerId.value = null;
}, { immediate: true });

// Highlight exhibit method (exposed)
function highlightExhibit(id: number) {
  console.log(`MapSection: Highlighting exhibit ${id}`);
  highlightedMarkerId.value = id;
  // TODO: Optionally pan/zoom to the highlighted marker
}

// Initial setup
onMounted(() => {
  // Preload logic is now handled by the immediate watch
  // Wait for initial image to load and then center the view
  watch(imageLoaded, (loaded) => {
      if (loaded) {
          nextTick(centerView); // Center after image is loaded and dimensions are known
      }
  }, { immediate: true });
});

// Expose methods
defineExpose({
  highlightExhibit,
  resetView,
  centerView
});

// --- Additions for Scale Bar ---
function calculateScaleBarText() {
  if (!props.pixelsPerMeter || !viewportRef.value) return '';
  
  // Calculate the visual width of 1 meter on the screen at current scale
  const meterWidthOnScreen = props.pixelsPerMeter * scale.value;
  
  // Determine a reasonable length for the scale bar (e.g., around 80px)
  const targetBarWidthPx = 80;
  
  // Calculate the real-world distance that corresponds to the target bar width
  const realDistanceMeters = targetBarWidthPx / meterWidthOnScreen;
  
  // Find a nice round number for the label (e.g., 1, 2, 5, 10, 20, 50, 100 meters)
  const niceNumbers = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  let niceDistance = niceNumbers[0]; // Start with smallest
  for (const num of niceNumbers) {
    if (realDistanceMeters >= num) {
      niceDistance = num;
    } else {
      break; // Stop when we exceed the target
    }
  }
   // Handle cases where map is extremely zoomed out
  if (realDistanceMeters < niceNumbers[0]) {
     niceDistance = niceNumbers[0] / 2; // or show fractional meters? Or hide? Let's show 0.5m minimum for now.
     if(realDistanceMeters < niceDistance) niceDistance = Math.round(realDistanceMeters * 10) / 10;
  }

  // Calculate the actual pixel width of the scale bar for the nice distance
  const actualBarWidthPx = niceDistance * meterWidthOnScreen;

  // Store the calculated width for potential visual bar rendering
  // scaleBarVisualWidth.value = actualBarWidthPx; // If needed later
  
  // Simple text representation
  return `${niceDistance} m`; 
}
</script>

<style scoped>
.map-viewport {
  /* cursor: grab; Handled by dynamic style binding */
  user-select: none; /* Prevent text selection during drag */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.map-image-wrapper {
  /* position: absolute; top: 0; left: 0; Is set inline */
  transform-origin: top left; /* Crucial for scaling logic */
  will-change: transform; /* Performance hint */
}

.map-image {
  display: block; /* Remove extra space below image */
  max-width: none; /* Override potential global img styles */
  pointer-events: auto; /* Ensure clicks work */
}

.map-marker {
  /* position: absolute; cursor: pointer; Is set inline */
  will-change: transform, left, top; /* Performance hint */
  z-index: 5; /* Ensure markers are above the image */
}

.map-marker .marker-content {
  /* Adjust size and appearance as needed */
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  /* Prevent marker content from interfering with map drag */
  pointer-events: auto; 
}

/* Simple scale bar styling */
.scale-bar {
  z-index: 10;
  pointer-events: none; /* Prevent interaction */
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.zoom-controls {
  /* Styling for the container if needed */
}

.zoom-button {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.zoom-button:active {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>