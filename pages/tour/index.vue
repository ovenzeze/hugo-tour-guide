<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Museum Tour</h1>
    
    <!-- Museum Map Section -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2
          class="text-xl font-semibold"
          v-motion
          :initial="{ opacity: 0, y: -20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
        >
          Metropolitan Museum Map
        </h2>
        
        <!-- 楼层选择器 -->
        <div
          class="flex space-x-2"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 0.3, duration: 0.4 } }"
        >
          <button
            class="px-3 py-1 rounded transition-all duration-200"
            :class="currentFloor === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            @click="currentFloor = 1"
            v-motion:tap="{ scale: 0.95 }"
          >
            Floor 1
          </button>
          <button
            class="px-3 py-1 rounded transition-all duration-200"
            :class="currentFloor === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            @click="currentFloor = 2"
            v-motion:tap="{ scale: 0.95 }"
          >
            Floor 2
          </button>
        </div>
      </div>
      
      <div
        class="h-80 rounded-lg overflow-hidden mb-2 relative shadow-md"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.5 } }"
      >
        <!-- 使用我们创建的地图组件 -->
        <MuseumMap 
          ref="mapRef"
          :current-floor="currentFloor" 
          @select-exhibit="onExhibitSelected"
        />
      </div>
      
      <div class="flex justify-between">
        <div
          class="text-sm text-gray-600"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 0.4 } }"
        >
          <span class="font-medium">Current View:</span> {{ currentFloor === 1 ? 'First Floor' : 'Second Floor' }}
        </div>
        
        <div class="flex space-x-2">
          <button
            class="bg-gray-200 text-gray-700 px-3 py-1 rounded transition-all duration-200 hover:bg-gray-300 hover:shadow-sm"
            v-motion:hover="{ scale: 1.05 }"
            v-motion:tap="{ scale: 0.95 }"
            @click="zoomIn"
          >
            <span>Zoom In</span>
          </button>
          <button
            class="bg-gray-200 text-gray-700 px-3 py-1 rounded transition-all duration-200 hover:bg-gray-300 hover:shadow-sm"
            v-motion:hover="{ scale: 1.05 }"
            v-motion:tap="{ scale: 0.95 }"
            @click="zoomOut"
          >
            <span>Zoom Out</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Recommended Route Section -->
    <div class="mb-6">
      <h2
        class="text-xl font-semibold mb-3"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }"
      >
        Recommended Route
      </h2>
      <div
        class="border rounded-lg p-4 shadow-sm"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }"
      >
        <div class="flex justify-between mb-3">
          <div>
            <span class="font-medium">Estimated Time:</span> 1 hour 15 minutes
          </div>
          <div>
            <span class="font-medium">Distance:</span> 0.8 km
          </div>
        </div>
        <div class="space-y-3">
          <div
            v-for="(item, index) in routeItems"
            :key="item.name"
            class="flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-gray-50"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{
              opacity: 1,
              x: 0,
              transition: {
                delay: 0.5 + index * 0.1,
                duration: 0.4
              }
            }"
            @click="highlightExhibit(item)"
          >
            <div
              class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2"
              v-motion:hover="{ scale: 1.1, rotate: 5 }"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <span>{{ item.name }}</span>
              <div class="text-xs text-gray-500">{{ item.location }}</div>
            </div>
            <button
              class="text-blue-600 text-sm hover:underline"
              v-motion:tap="{ scale: 0.95 }"
              @click.stop="showExhibitOnMap(item)"
            >
              Show
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Featured Exhibits Section -->
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
        <!-- Exhibit Card 1 -->
        <div
          class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.7,
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
            <h3 class="font-medium">The Rosetta Stone</h3>
            <p class="text-sm text-gray-600 mb-2">Ancient Egyptian artifact, key to deciphering hieroglyphics</p>
            <div class="flex justify-between">
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                View Details
              </button>
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                Add to Route
              </button>
            </div>
          </div>
        </div>
        
        <!-- Exhibit Card 2 -->
        <div
          class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.8,
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
            <h3 class="font-medium">Venus de Milo</h3>
            <p class="text-sm text-gray-600 mb-2">Ancient Greek sculpture from the Hellenistic period</p>
            <div class="flex justify-between">
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                View Details
              </button>
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                Add to Route
              </button>
            </div>
          </div>
        </div>
        
        <!-- Exhibit Card 3 -->
        <div
          class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.9,
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
            <h3 class="font-medium">Mona Lisa</h3>
            <p class="text-sm text-gray-600 mb-2">Leonardo da Vinci's masterpiece portrait</p>
            <div class="flex justify-between">
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                View Details
              </button>
              <button
                class="text-blue-600 text-sm hover:underline"
                v-motion:tap="{ scale: 0.95 }"
              >
                Add to Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ask Guide 按钮 -->
    <AskGuideButton @click="openGuideDialog" />
    
    <!-- Guide 对话框 -->
    <GuideDialog
      v-model="showGuideDialog"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '~/stores/chatStore'
import AskGuideButton from "~/components/guide/AskGuideButton.vue"
import GuideDialog from "~/components/guide/GuideDialog.vue"
import MuseumMap from "~/components/tour/MuseumMap.vue"

// 定义地图组件类型
interface MapComponent {
  zoomIn: () => void;
  zoomOut: () => void;
  highlightExhibit: (id: number) => void;
}

// 定义展品项目类型
interface ExhibitItem {
  id: number;
  name: string;
  location: string;
  floor: number;
  highlight: boolean;
}

// 初始化 chatStore
const chatStore = useChatStore()

// 对话框状态
const showGuideDialog = ref(false)

// 地图相关状态
const currentFloor = ref(1)
const mapRef = ref<MapComponent | null>(null)

// 推荐路线数据
const routeItems = ref<ExhibitItem[]>([
  { id: 1, name: 'Egyptian Collection', location: 'Floor 1, Room 4', floor: 1, highlight: false },
  { id: 2, name: 'Greek Sculptures', location: 'Floor 1, Room 7', floor: 1, highlight: false },
  { id: 3, name: 'Renaissance Paintings', location: 'Floor 2, Room 3', floor: 2, highlight: false },
  { id: 4, name: 'Modern Art Gallery', location: 'Floor 2, Room 8', floor: 2, highlight: false }
])

// 当前高亮的展品
const highlightedExhibit = ref<ExhibitItem | null>(null)

// 处理 Ask Guide 按钮点击
function openGuideDialog() {
  showGuideDialog.value = true
  chatStore.initialize()
}

// 处理消息发送
function handleSendMessage(content: string) {
  if (!content.trim()) return
  chatStore.sendMessage(content)
}

// 地图缩放功能
function zoomIn() {
  if (mapRef.value) {
    mapRef.value.zoomIn()
    console.log('Zoom in')
  }
}

function zoomOut() {
  if (mapRef.value) {
    mapRef.value.zoomOut()
    console.log('Zoom out')
  }
}

// 高亮展品
function highlightExhibit(item: ExhibitItem) {
  // 重置所有展品的高亮状态
  routeItems.value.forEach(exhibit => exhibit.highlight = false)
  
  // 设置当前展品为高亮
  item.highlight = true
  highlightedExhibit.value = item
  
  // 切换到展品所在的楼层
  currentFloor.value = item.floor
  
  // 调用地图组件的方法来高亮显示展品位置
  if (mapRef.value) {
    mapRef.value.highlightExhibit(item.id)
    console.log('Highlighting exhibit:', item.name, 'on floor', item.floor)
  }
}

// 在地图上显示展品
function showExhibitOnMap(item: ExhibitItem) {
  // 切换到展品所在的楼层
  currentFloor.value = item.floor
  
  // 调用地图组件的方法来高亮显示展品位置
  if (mapRef.value) {
    mapRef.value.highlightExhibit(item.id)
  }
}

// 处理地图组件选择展品事件
function onExhibitSelected(exhibit: any) {
  // 找到对应的路线项目
  const routeItem = routeItems.value.find(item => item.id === exhibit.id)
  if (routeItem) {
    // 高亮显示路线项目
    highlightExhibit(routeItem)
  }
}
</script>