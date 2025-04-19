<template>
  <div class="container mx-auto p-4 pb-20">
    <h1 class="text-2xl font-bold mb-4">Museum Tour</h1>
    
    <!-- 地图区域 -->
    <MapSection 
      v-model:currentFloor="currentFloor"
      ref="mapSectionRef"
      @exhibit-selected="onExhibitSelected"
    />
    
    <!-- 推荐路线区域 -->
    <RecommendedRoute
      :items="filteredRouteItems"
      @highlight-exhibit="highlightExhibit"
      @show-on-map="showExhibitOnMap"
    />
    
    <!-- 特色展品区域 -->
    <FeaturedExhibits 
      :exhibits="featuredExhibits"
      @view-details="viewExhibitDetails"
      @add-to-route="addExhibitToRoute"
    />
    
    <!-- 底部工具栏 -->
    <GuideToolbar />
    
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
import { ref, onMounted, computed } from 'vue'
import { useChatStore } from '~/stores/chatStore'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import MapSection from '~/components/tour/MapSection.vue'
import RecommendedRoute from '~/components/tour/RecommendedRoute.vue'
import FeaturedExhibits from '~/components/tour/FeaturedExhibits.vue'
import GuideToolbar from '~/components/tour/GuideToolbar.vue'
import AskGuideButton from '~/components/guide/AskGuideButton.vue'
import GuideDialog from '~/components/guide/GuideDialog.vue'

// 定义接口类型
interface FeaturedExhibit {
  id: number;
  name: string;
  description: string;
  floor: number;
}

interface MapSectionComponent {
  highlightExhibit: (id: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

// 使用store
const chatStore = useChatStore()
const tourStore = useTourStore()
const { routeItems, featuredExhibits } = storeToRefs(tourStore)

// 使用语音导航composable
const { playWelcomeIntroduction } = useVoiceNavigation()

// 对话框状态
const showGuideDialog = ref(false)

// 地图相关状态
const currentFloor = ref(1)
const mapSectionRef = ref<MapSectionComponent | null>(null)

// 计算属性：根据当前楼层过滤推荐路线
const filteredRouteItems = computed(() => {
  return routeItems.value.filter(item => item.floor === currentFloor.value)
})

// 页面加载时自动播放欢迎介绍
onMounted(() => {
  playWelcomeIntroduction()
})

// 处理Guide对话框交互
function openGuideDialog() {
  showGuideDialog.value = true
  chatStore.initialize()
}

function handleSendMessage(content: string) {
  if (!content.trim()) return
  chatStore.sendMessage(content)
}

// 高亮展品
function highlightExhibit(item: ExhibitItem) {
  // 使用store中的高亮方法
  tourStore.highlightExhibit(item)
  
  // 切换到展品所在的楼层
  currentFloor.value = item.floor
  
  // 调用地图组件的方法来高亮显示展品位置
  if (mapSectionRef.value) {
    mapSectionRef.value.highlightExhibit(item.id)
  }
}

// 在地图上显示展品
function showExhibitOnMap(item: ExhibitItem) {
  // 切换到展品所在的楼层
  currentFloor.value = item.floor
  
  // 调用地图组件的方法来高亮显示展品位置
  if (mapSectionRef.value) {
    mapSectionRef.value.highlightExhibit(item.id)
  }
}

// 处理地图选择展品事件
// Assuming exhibit from map selection only provides id, adjust if more info is available
function onExhibitSelected(exhibit: { id: number }) {
  // 找到对应的路线项目
  const routeItem = routeItems.value.find(item => item.id === exhibit.id)
  if (routeItem) {
    // 高亮显示路线项目
    highlightExhibit(routeItem)
  }
}

// 查看展品详情
function viewExhibitDetails(exhibit: FeaturedExhibit) {
  console.log('View details for:', exhibit.name)
  // 实现展品详情查看逻辑
}

// 添加展品到路线
function addExhibitToRoute(exhibit: FeaturedExhibit) {
  console.log('Add to route:', exhibit.name)
  // 实现添加到路线逻辑
}
</script>