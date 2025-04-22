<template>
  <!-- Main container: Relative, full height/width -->
  <div class="relative h-full w-full" v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 0.5 } }">

    <!-- Welcome interaction dialog - Keep as is, highest z-index -->
    <div v-if="!userHasInteracted" 
         class="fixed inset-0 z-50 h-full w-full bg-black/10 backdrop-blur-sm flex items-center justify-center"
         style=" position: fixed; top: 0; left: 0;"
         v-motion
         :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { duration: 0.3 } }">
        <div 
          class="max-w-md w-full mx-4"
          v-motion
          :initial="{ scale: 0.9, y: 20, opacity: 0 }"
          :enter="{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } }">
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Top image area with museum icon -->
            <div class="h-36 bg-blue-500 flex items-center justify-center relative overflow-hidden">
              <div class="absolute inset-0 opacity-20" 
                   style="background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 20px 20px;"></div>
              <div 
                class="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center z-10 shadow-md"
                v-motion
                :initial="{ scale: 0.8, opacity: 0 }"
                :enter="{ scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.4 } }">
                <span class="material-icons text-blue-500 text-4xl">home</span>
              </div>
            </div>
            
            <!-- Content area -->
            <div class="p-6">
              <h1 
                class="text-2xl font-bold text-center mb-3 text-gray-900"
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }">
                Welcome to Museum Voice Tour
              </h1>
              <p 
                class="text-gray-600 text-center mb-6 text-sm"
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { delay: 0.5, duration: 0.3 } }">
                Click the button below to start exploring the Metropolitan Museum's magnificent art treasures with your virtual guide
              </p>
              
              <!-- Button styled more like screenshot -->
              <button 
                @click="startWithUserInteraction"
                class="w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all bg-blue-500 hover:bg-blue-600 text-white"
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.3 } }"
                v-motion:hover="{ scale: 1.02 }"
                v-motion:tap="{ scale: 0.98 }">
                <span class="material-icons mr-2">play_arrow</span>
                <span>Start Voice Tour</span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <!-- Map Container: Absolutely positioned to fill parent, background layer -->
    <div class="absolute inset-0 z-0">
      <MapSection 
        v-model:currentFloor="currentFloor" 
        ref="mapSectionRef" 
        @exhibit-selected="onExhibitSelected"
        :intrinsic-width="currentMapDimensions.width"  
        :intrinsic-height="currentMapDimensions.height" 
        :pixels-per-meter="currentMapScale" 
      />
    </div>

    <!-- Top Center Museum Name Overlay -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-sm font-medium rounded-full shadow-lg">
      The Metropolitan Museum of Art
    </div>

    <!-- Buttons/Icons positioned over the map -->
    <!-- 'Find Companions' button removed -->
    
    <!-- GPS Icon -->
    <div class="absolute bottom-28 right-4 z-10 w-12 h-12 bg-green-500/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
      <span class="material-icons text-white text-2xl">gps_fixed</span>
    </div>
    
    <!-- Dynamic Bottom Information Card Area -->
    <div class="absolute bottom-20 left-4 right-4 z-10 bg-black/60 backdrop-blur-md p-3 rounded-lg shadow-lg flex gap-3 items-start text-white/90">
      
      <!-- == Step Card State == -->
      <div v-if="currentCardState.type === 'step'" class="flex gap-3 items-start w-full">
        <!-- TODO: Make image source dynamic based on current step/context -->
        <img :src="currentCardState.data.image || 'https://via.placeholder.com/80x60'" alt="Step Context" class="w-20 h-[60px] object-cover rounded flex-shrink-0">
        <div class="flex-grow text-sm">
          <p class="font-semibold mb-1">Step {{ currentCardState.data.stepNumber }}:</p>
          <p class="text-white/80 leading-snug">{{ currentCardState.data.description }}</p>
        </div>
        <!-- Placeholder for expand/collapse -->
        <button class="text-white/70 hover:text-white flex-shrink-0 pt-1">
          <span class="material-icons text-lg">unfold_less</span> <!-- Or unfold_more -->
        </button>
      </div>

      <!-- == Welcome Card State (Placeholder) == -->
      <div v-else-if="currentCardState.type === 'welcome'" class="flex gap-3 items-start w-full">
        <img :src="currentCardState.data.image || 'https://via.placeholder.com/80x60'" alt="Museum Image" class="w-20 h-[60px] object-cover rounded flex-shrink-0">
        <div class="flex-grow text-sm">
          <p class="font-semibold mb-1">{{ currentCardState.data.title }}</p>
          <p class="text-white/80 leading-snug">{{ currentCardState.data.description }}</p>
        </div>
         <button class="text-white/70 hover:text-white flex-shrink-0 pt-1">
          <span class="material-icons text-lg">info_outline</span> 
        </button>
      </div>

      <!-- == Exhibit Card State (Placeholder Structure) == -->
      <div v-else-if="currentCardState.type === 'exhibit'" class="flex gap-3 items-start w-full">
        <img :src="currentCardState.data.image || 'https://via.placeholder.com/80x60'" :alt="currentCardState.data.name" class="w-20 h-[60px] object-cover rounded flex-shrink-0">
        <div class="flex-grow text-sm">
          <p class="font-semibold mb-1">{{ currentCardState.data.name }}</p>
          <p class="text-white/80 leading-snug">{{ currentCardState.data.shortDescription }}</p>
        </div>
         <button class="text-white/70 hover:text-white flex-shrink-0 pt-1">
          <span class="material-icons text-lg">visibility</span> <!-- View Details? -->
        </button>
      </div>
      
      <!-- Add v-else-if for other card types (gallery, etc.) -->

    </div>

    <!-- Bottom Action Bar / Guide Toolbar: Overlay -->
    <div class="absolute bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md p-2 flex items-center justify-between shadow-lg">
      <img src="https://via.placeholder.com/40" alt="User Avatar" class="w-10 h-10 rounded-full border-2 border-white flex-shrink-0">
      <button class="flex-grow mx-4 bg-gray-700/80 hover:bg-gray-600/90 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2">
        <span class="material-icons">support_agent</span>
        <span>Ask Guide</span>
      </button>
      <button class="bg-gray-700/80 hover:bg-gray-600/90 text-white p-2 rounded-full flex-shrink-0">
        <span class="material-icons">photo_camera</span>
      </button>
    </div>
    
    <!-- Guide Dialog - Keep for now, might be triggered by 'Ask Guide' -->
    <!-- <GuideDialog v-model:show="showGuideDialog" :messages="chatMessages" @send-message="handleSendMessage" /> -->

  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chatStore'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import MapSection from '~/components/tour/MapSection.vue'
// ExhibitCard is removed as the section is removed
// import ExhibitCard from '~/components/tour/ExhibitCard.vue'
// GuideToolbar is removed and replaced by the new bottom bar
// import GuideToolbar from '~/components/tour/GuideToolbar.vue' 
import { storeToRefs } from 'pinia'

// Tell the layout to hide the default footer for this page
definePageMeta({
  layout: 'fullscreen' // Use the new fullscreen layout
})


// 设置页面标题和元数据
useHead({
  title: 'Metropolitan Museum Tour Guide - Navigation', // Updated title
  meta: [
    { name: 'description', content: 'Interactive voice-guided tour of the Metropolitan Museum - Map Navigation' }
  ]
})

// 用户交互状态
const userHasInteracted = ref(false)

// 路由
const router = useRouter()

// Define Interface Types (Restored)
interface FeaturedExhibit {
  id: number;
  name: string;
  description: string;
  floor: number;
}

interface MapSectionComponent {
  highlightExhibit: (id: number) => void;
  resetView: () => void;
  centerView: () => void;
  // Add other methods exposed by MapSection if needed
}

// Placeholder map data based on floor
// IMPORTANT: Replace width, height, and scale (pixelsPerMeter) with actual measured values!
type FloorKey = 0 | 1 | 2;
const mapDataByFloor: Record<FloorKey, { width: number; height: number; scale: number }> = {
  0: { width: 1800, height: 1200, scale: 18 }, // ground floor - ESTIMATE
  1: { width: 2000, height: 1500, scale: 20 }, // floor 1 - ESTIMATE based on visual inspection
  2: { width: 2200, height: 1600, scale: 22 }  // floor 2-3 - ESTIMATE
}

// 地图相关状态
const currentFloor = ref<FloorKey>(1) // Use FloorKey type

// Computed properties for current map dimensions and scale
const currentMapDimensions = computed(() => {
  // Use currentFloor.value directly as it's now FloorKey
  const data = mapDataByFloor[currentFloor.value] || mapDataByFloor[1]; 
  return { width: data.width, height: data.height };
});

const currentMapScale = computed(() => {
  // Use currentFloor.value directly
  const data = mapDataByFloor[currentFloor.value] || mapDataByFloor[1];
  return data.scale;
});

// 使用语音导航composable
const { playWelcomeIntroduction, speak, explainExhibit } = useVoiceNavigation()

// 对话框状态 - Keep for potential use with 'Ask Guide'
const showGuideDialog = ref(false)
const userMessage = ref('')
const chatMessages = ref<{ role: 'user' | 'guide', content: string }[]>([
  { role: 'guide', content: 'Hello! I\'m your virtual guide. How can I help you today?' }
])

// 地图相关状态
const mapSectionRef = ref<MapSectionComponent | null>(null)
const showMapDiagnostics = ref(false) // Keep, might be useful

// 展品相关状态 - Remove scroll-related refs
// const exhibitsContainer = ref<HTMLElement | null>(null) 
// const currentExhibitPage = ref(0)

// 计算属性：根据当前楼层过滤推荐路线 - Keep, might be used for map markers
const filteredRouteItems = computed(() => {
  // Ensure filtering works with FloorKey type if necessary
  return routeItems.value.filter(item => item.floor === currentFloor.value)
})

// Define Card State Types
interface StepCardData {
  stepNumber: number;
  description: string;
  image?: string;
}
interface WelcomeCardData {
  title: string;
  description: string;
  image?: string;
}
interface ExhibitCardData { // Placeholder structure
  id: number;
  name: string;
  shortDescription: string;
  image?: string;
}

type CardState = 
  | { type: 'step'; data: StepCardData }
  | { type: 'welcome'; data: WelcomeCardData }
  | { type: 'exhibit'; data: ExhibitCardData }
  // Add other types like | { type: 'gallery'; data: GalleryCardData }

// Reactive state for the dynamic bottom card
const currentCardState = ref<CardState>({
  type: 'step', // Default state
  data: { 
    stepNumber: 1, 
    description: "From the ticket gate, go straight to the top floor (2nd floor), enter the main corridor, turn left, enter the first gallery on the left, arrive at room 600 (Map marker 1), and enjoy Giotto's 'Madonna Enthroned'.",
    // image: 'path/to/step1/image.jpg' // Optional image URL
  }
});

// 用户交互后开始导览
function startWithUserInteraction() {
  userHasInteracted.value = true
  // TODO: Potentially set currentCardState to a 'welcome' or initial state
  // currentCardState.value = { type: 'welcome', data: { title: 'Welcome!', ... } };
  setTimeout(() => {
    playWelcomeIntroduction()
  }, 100)
}

// 页面加载时设置字体但不自动播放欢迎介绍
onMounted(() => {
  // 加载Material Icons字体
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  // Remove exhibit scroll listener
  // if (exhibitsContainer.value) {
  //   exhibitsContainer.value.addEventListener('scroll', handleExhibitScroll)
  // }
})

// 确保在组件销毁时清理资源
onBeforeUnmount(() => {
  // 清理可能的语音合成
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }

  // Remove scroll listener cleanup
  // if (exhibitsContainer.value) {
  //   exhibitsContainer.value.removeEventListener('scroll', handleExhibitScroll)
  // }
})

// Remove handleExhibitScroll function
// function handleExhibitScroll() { ... }

// 导航方法 - Keep
function goBack() {
  router.back()
}

// 开始导览 - Keep, might be triggered differently now
function startGuidedTour() {
  // Reset highlighting
  tourStore.routeItems.forEach(item => item.highlight = false)

  if (filteredRouteItems.value.length > 0) {
    const firstItem = filteredRouteItems.value[0]
    highlightExhibit(firstItem) // Still useful to highlight on map

    // TODO: Update MapSection to show route markers (1, 2, 3...)
    // if (mapSectionRef.value) {
    //   mapSectionRef.value.displayRouteMarkers(filteredRouteItems.value); 
    // }
    
    // Update intro speech if needed
    speak('Starting the guided tour. Follow the map directions.') 
  }

  // TODO: Set currentCardState to the first step
  // currentCardState.value = { type: 'step', data: { stepNumber: 1, ... } };
}

// 切换地图诊断显示 - Keep
function toggleMapDiagnostics() {
  showMapDiagnostics.value = !showMapDiagnostics.value
  console.log('Toggle map diagnostics:', showMapDiagnostics.value)
}

// 收听导游解释 - Keep, can be triggered from map marker or elsewhere
function listenToGuideExplanation(item: ExhibitItem) {
  highlightExhibit(item) // Highlight on map
  explainExhibit(item) // Use voice navigation
}

// 处理Guide对话框交互 - Keep for 'Ask Guide' button
function openGuideDialog() {
  showGuideDialog.value = true
}

function handleSendMessage() {
  if (!userMessage.value.trim()) return
  chatMessages.value.push({ role: 'user', content: userMessage.value })
  // Mock response
  setTimeout(() => {
    const response = `Looking into "${userMessage.value}"...`
    chatMessages.value.push({ role: 'guide', content: response })
    speak(response)
  }, 800)
  userMessage.value = ''
}

// 高亮展品 - Keep, mainly interacts with MapSection now
function highlightExhibit(item: ExhibitItem) {
  tourStore.highlightExhibit(item) // Update store state (might visually affect map marker)
  
  // Safely assign floor number to currentFloor if it's a valid FloorKey
  if (item.floor === 0 || item.floor === 1 || item.floor === 2) {
      currentFloor.value = item.floor // Assign only if valid
  } else {
      console.warn(`Invalid floor number (${item.floor}) received for exhibit ${item.id}. Defaulting to floor 1.`);
      currentFloor.value = 1; // Default to a safe value if invalid
  }
  
  if (mapSectionRef.value) {
    mapSectionRef.value.highlightExhibit(item.id) // Tell map to highlight/center
  }
}

// 在地图上显示展品 - Keep, essentially same as highlightExhibit now
function showExhibitOnMap(item: ExhibitItem) {
  highlightExhibit(item)
}

// 处理地图选择展品事件 - Keep, core interaction
function onExhibitSelected(exhibit: { id: number, name?: string }) {
  const routeItem = routeItems.value.find(item => item.id === exhibit.id)
  if (routeItem) {
    highlightExhibit(routeItem) // Highlight the selected item
    // TODO: Set card state to show exhibit info
    // currentCardState.value = { 
    //   type: 'exhibit', 
    //   data: { 
    //     id: routeItem.id, 
    //     name: routeItem.name, 
    //     shortDescription: routeItem.description || 'Exhibit details unavailable.',
    //     // image: routeItem.imageUrl // If available
    //   }
    // };
  } else {
     // Optional: Handle click on map that isn't a known exhibit
     // currentCardState.value = { type: 'map_info', data: { coordinates: ... } };
  }
}

// 查看展品详情 - Modify to potentially trigger 'Ask Guide' or update card state
function viewExhibitDetails(exhibit: ExhibitCardData) {
  console.log('View details for:', exhibit.name);
  // Option 1: Update card state to show more details (if card handles it)
  // currentCardState.value = { type: 'exhibit_detail', data: exhibit }; 
  
  // Option 2: Open Guide Dialog with prefilled query
  userMessage.value = `Tell me more about "${exhibit.name}".`;
  openGuideDialog(); 
}

// 添加展品到路线 - Keep logic, trigger source might change
function addExhibitToRoute(exhibit: FeaturedExhibit) {
  console.log('Add to route:', exhibit.name)
  // TODO: Implement actual logic in tourStore
  speak(`Added ${exhibit.name} to your tour route.`)
}

// 使用store
const chatStore = useChatStore()
const tourStore = useTourStore()
// Keep routeItems and featuredExhibits as they might be used for map markers or 'Ask Guide'
const { routeItems, featuredExhibits } = storeToRefs(tourStore)
</script>

<style scoped>
/* Remove styles related to flex-grow/shrink if they were specific */
/* .flex-grow { ... } */
/* .flex-shrink-0 { ... } */

/* Ensure map takes up available space */
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.inset-0 {
  top: 0; right: 0; bottom: 0; left: 0;
}
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-50 { z-index: 50; }

/* Basic styling for elements */
.border-t {
  border-top-width: 1px;
}
.gap-4 {
  gap: 1rem;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.shadow-lg {
   box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06); /* Adjusted shadow for bottom elements */
}

/* Positioning */
.top-4 { top: 1rem; }
.right-4 { right: 1rem; }
.bottom-0 { bottom: 0; }
.bottom-16 { bottom: 4rem; } /* Adjust if action bar height differs */
.bottom-20 { bottom: 5rem; } /* Instruction card position */
.bottom-28 { bottom: 7rem; } /* GPS icon position */
.left-0 { left: 0; }
.right-0 { right: 0; }
.right-36 { right: 9rem; }

/* Add flex-shrink-0 utility if not globally available */
.flex-shrink-0 { flex-shrink: 0; }

/* Hide scrollbar (if needed for any internal scroll) */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Add backdrop blur utility if not globally available */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

</style>
