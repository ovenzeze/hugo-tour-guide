<template>
  <div class="relative h-full w-full bg-gray-50">
    <!-- 欢迎弹窗 -->
    <TourWelcome v-if="!userHasInteracted" @start="startWithUserInteraction" class="absolute inset-0 z-30"/>

    <!-- 地图组件 -->
    <TourMap 
      v-model:currentFloor="currentFloor" 
      :museum-id="currentMuseumId"
      ref="mapRef"
      @exhibit-selected="onExhibitSelected" 
      class="absolute inset-0 z-0"
    />

    <!-- 顶部导航栏 -->
    <div class="absolute top-[60px] left-0 right-0  z-10">
      <TourHeader 
        :museum-name="museumName"
        @back="goBack"
      />
    </div>

    <!-- 底部信息卡片 -->
    <InfoCard 
      v-if="infoCardData" 
      :data="infoCardData"
      :type="infoCardType"
      class="absolute bottom-28 left-4 right-4 z-10"
      @close="closeInfoCard"
      @details="viewExhibitDetails"
      @play-audio="playAudio"
    />

    <!-- 底部工具栏 -->
    <TourToolbar 
      v-model:currentFloor="currentFloor"
      :is-speaking="isSpeaking"
      :is-listening="isListening"
      class="absolute bottom-[20px] left-0 right-0 z-20"
      @ask-guide="openGuideDialog"
      @start-listening="startListening"
      @stop-listening="stopListening"
      @start-tour="startGuidedTour"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import TourWelcome from '~/components/TourWelcome.vue'
import TourHeader from '~/components/TourHeader.vue'
import TourMap from '~/components/TourMap.vue'
import InfoCard from '~/components/InfoCard.vue'
import TourToolbar from '~/components/TourToolbar.vue'

// 页面元数据
definePageMeta({
  layout: 'fullscreen'
})

// 设置页面标题和元数据
useHead({
  title: 'Museum Tour Guide',
  meta: [
    { name: 'description', content: 'Interactive voice-guided museum tour' }
  ]
})

// 获取路由器
const router = useRouter()

// 使用store
const tourStore = useTourStore()
const { currentMuseum } = tourStore

// 使用语音导航
const { 
  playWelcomeIntroduction, 
  speak, 
  explainExhibit, 
  isSpeaking, 
  isListening 
} = useVoiceNavigation()

// 定义接口
interface Exhibit {
  id: number;
  name: string;
  description: string;
  floor?: number;
  image?: string;
}

interface StepData {
  number: number;
  description: string;
  image?: string;
}

interface WelcomeData {
  title: string;
  description: string;
  image?: string;
}

// 状态管理
const userHasInteracted = ref(false)
const currentFloor = ref(1)
const infoCardType = ref<'welcome' | 'exhibit' | 'step'>('welcome')
const infoCardData = ref<Exhibit | StepData | WelcomeData | null>(null)
const mapRef = ref(null)
const currentMuseumId = ref('metropolitan')

// 计算属性
const museumName = computed(() => currentMuseum?.name || 'Metropolitan Museum of Art')

// 用户交互后开始导览
function startWithUserInteraction() {
  userHasInteracted.value = true
  showWelcomeCard()
  setTimeout(() => {
    playWelcomeIntroduction()
  }, 100)
}

// 处理展品选择
function onExhibitSelected(exhibit: Exhibit) {
  if (exhibit) {
    showExhibitCard(exhibit)
    if (userHasInteracted.value) {
      const exhibitInfo = {
        id: exhibit.id,
        name: exhibit.name,
        description: exhibit.description,
        location: '',
        highlight: false,
        floor: exhibit.floor || currentFloor.value
      }
      explainExhibit(exhibitInfo)
    }
  }
}

// 显示欢迎卡片
function showWelcomeCard() {
  infoCardType.value = 'welcome'
  infoCardData.value = {
    title: 'Welcome to the Tour',
    description: 'Explore the museum with your personal guide. Tap on map markers to learn about exhibits.',
    image: '/path/to/welcome-image.jpg'
  }
}

// 显示展品卡片
function showExhibitCard(exhibit: Exhibit) {
  infoCardType.value = 'exhibit'
  infoCardData.value = {
    id: exhibit.id,
    name: exhibit.name,
    description: exhibit.description || 'No description available.',
    image: exhibit.image || '/path/to/placeholder.jpg'
  }
}

// 显示路线步骤卡片
function showStepCard(step: StepData) {
  infoCardType.value = 'step'
  infoCardData.value = {
    number: step.number,
    description: step.description,
    image: step.image
  }
}

// 关闭信息卡片
function closeInfoCard() {
  infoCardData.value = null
}

// 查看展品详情
function viewExhibitDetails(exhibit: Exhibit) {
  // 可以导航到详情页面或显示更多信息
  console.log('View details for:', exhibit.name)
}

// 开始导览
function startGuidedTour() {
  const firstStep: StepData = {
    number: 1,
    description: 'Start your tour at the main entrance. Head to the first gallery on your right.',
    image: '/path/to/step1.jpg'
  }
  
  showStepCard(firstStep)
  speak('Starting your guided tour. I\'ll accompany you through the highlights of the collection.')
}

// 开始语音识别
function startListening() {
  // 语音识别开始逻辑
}

// 停止语音识别
function stopListening() {
  if (isListening.value) {
    openGuideDialog()
  }
}

// 打开导游对话框
function openGuideDialog() {
  // 打开导游对话框逻辑
}

// 返回上一页
function goBack() {
  router.back()
}

function playAudio(data: any) {
  // Placeholder for playing audio
  console.log('Play audio for:', data);
  // Implement actual audio playback logic here using useVoiceNavigation or similar
}

// 生命周期钩子
onMounted(() => {
  // 加载Material Icons字体
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})
</script>

<style scoped>
/* 底部工具栏容器，利用全局变量添加底部安全区域 */
.tour-toolbar-container {
  padding-bottom: var(--safe-area-bottom, 0px);
}
</style>
