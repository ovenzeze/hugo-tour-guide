<template>
  <div class="h-full w-full max-h-full relative bg-gray-50" v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 0.5 } }">

    <!-- 地图组件 - 设置合理的内边距，避免被其他组件完全覆盖 -->
    <div class="absolute inset-0 z-0">
      <MapSection v-model:currentFloor="currentFloor" ref="mapSectionRef" @exhibit-selected="onExhibitSelected" />
    </div>

    <!-- 顶部信息栏 -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-3 shadow-md">
      <div class="flex justify-between items-center max-w-screen-xl mx-auto">
        <div class="flex items-center">
          <Button variant="ghost" size="icon" class="text-blue-500 mr-2" @click="goBack">
            <span class="material-icons">arrow_back</span>
          </Button>
          <h1 class="text-lg font-bold text-gray-900 truncate" v-if="currentMuseum">{{ currentMuseum.name }}</h1>
        </div>
        <div class="flex space-x-2">
          <!-- 楼层切换按钮 - 移到顶部栏 -->
          <div class="flex space-x-1 items-center">
            <Button
              v-for="floor in ['G', '1', '2-3']"
              :key="floor"
              variant="outline"
              size="sm"
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-200"
              :class="currentFloorStr === floor ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              @click="updateFloor(floor === 'G' ? 0 : floor === '1' ? 1 : 2)"
            >
              {{ floor }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 - 使用 Collapsible -->
    <Collapsible
      v-model:open="showRoutePanel"
      class="absolute top-16 right-0 bottom-16 z-10 w-80 bg-white border-l border-gray-200 flex flex-col"
    >
      <!-- Content is handled by CollapsibleContent -->
      <CollapsibleContent class="overflow-auto flex-1">
        <div class="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
           <h2 class="text-base font-semibold text-gray-900">Recommended Route</h2>
           <CollapsibleTrigger as-child>
             <Button variant="ghost" size="sm" class="text-gray-500">
               <span class="material-icons text-sm">close</span>
             </Button>
           </CollapsibleTrigger>
        </div>
        <div class="divide-y">
          <div v-for="(item, index) in filteredRouteItems" :key="item.id"
            class="p-3 flex bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'bg-blue-50 hover:bg-blue-100': item.highlight }" @click="highlightExhibit(item)">
            <!-- 编号圆圈 -->
            <div class="mr-3 flex-shrink-0">
              <div
                class="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {{ index + 1 }}
              </div>
            </div>

            <!-- 项目信息 -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 mb-1 text-sm truncate">{{ item.name }}</div>
              <div class="flex items-center text-gray-500 text-xs">
                <span class="material-icons text-xs mr-1">place</span>
                <span class="truncate">{{ item.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
      <!-- CollapsibleTrigger moved to the Floating Action Button -->
    </Collapsible>

    <!-- 展品详情面板 - 使用 BottomDrawer -->
    <BottomDrawer v-model="showExhibitPanel">
      <div v-if="selectedExhibit" class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex justify-between items-center border-b pb-2">
           <h2 class="text-lg font-semibold text-gray-900 truncate">{{ selectedExhibit.name }}</h2>
           <Button variant="ghost" size="icon" @click="showExhibitPanel = false" class="-mr-2">
             <span class="material-icons text-lg">close</span>
           </Button>
        </div>
        
        <!-- Description -->
        <p class="text-gray-600 text-sm">{{ selectedExhibit.description || 'No description available.' }}</p>
        
        <!-- Image Gallery Placeholder -->
        <div class="flex gap-3 snap-x snap-mandatory overflow-x-auto hide-scrollbar pb-2">
          <div v-for="(_, i) in 3" :key="i" class="snap-start min-w-[200px] flex-shrink-0 bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
            <span class="text-gray-500 text-sm">Exhibit Image {{ i + 1 }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">Select an exhibit to see details.</div>
    </BottomDrawer>

    <!-- 悬浮控制按钮组 - 更紧凑的设计 -->
    <div class="fixed bottom-20 right-4 z-30 flex flex-col gap-2">
       <CollapsibleTrigger as-child>
         <Button
           variant="secondary"
           size="icon"
           class="rounded-full bg-white shadow-lg text-blue-500 hover:bg-blue-50"
         >
           <span class="material-icons">{{ showRoutePanel ? 'format_list_bulleted_off' : 'format_list_bulleted' }}</span>
         </Button>
       </CollapsibleTrigger>

      <Button
        variant="default"
        size="icon"
        class="rounded-full bg-green-500 shadow-lg text-white hover:bg-green-600"
        @click="startGuidedTour"
      >
        <span class="material-icons">play_arrow</span>
      </Button>
    </div>

    <!-- 导览工具栏 - 简化版本 -->
    <div class="fixed bottom-[30px] left-0 right-0 h-14 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg z-40">
      <div class="flex items-center justify-between px-4 h-full max-w-screen-xl mx-auto">
        <!-- 导游头像 -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden relative">
            <div class="flex items-center justify-center text-white">
              <span class="material-icons text-sm">person</span>
            </div>
            <!-- 语音波浪动画 -->
            <div v-if="isSpeaking" class="absolute inset-0 flex items-center justify-center">
              <div class="voice-wave"></div>
            </div>
          </div>
          <div class="text-xs text-gray-700 font-medium">Guide</div>
        </div>

        <!-- 状态指示 -->
        <div v-if="statusText" class="text-center text-xs text-gray-600 flex-1 px-2 truncate">
          {{ statusText }}
        </div>
        <div v-else class="flex-1"></div>

        <!-- 语音询问按钮 -->
        <button 
          class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
          @touchstart="startListening"
          @touchend="stopListening"
          @mousedown="startListening"
          @mouseup="stopListening"
          @mouseleave="stopListening"
        >
          <span class="material-icons">{{ isListening ? 'mic' : 'mic_none' }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chatStore'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import type { Ref } from 'vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import BottomDrawer from '@/components/ui/BottomDrawer.vue'
import { Button } from '@/components/ui/button'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const museumId = computed(() => route.params.id as string)

// 使用store
const chatStore = useChatStore()
const tourStore = useTourStore()
const { routeItems, featuredExhibits, currentMuseum } = storeToRefs(tourStore)

// 面板状态
const showRoutePanel = ref(false)
const showExhibitPanel = ref(false)
const selectedExhibit = ref<ExhibitItem | null>(null)
const statusText = ref('')
const isSpeaking = ref(false)
const isListening = ref(false)

// 设置当前博物馆
onMounted(() => {
  // 加载Material Icons字体
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
  
  // 尝试设置当前博物馆
  const success = tourStore.setCurrentMuseum(museumId.value)
  
  // 如果失败（博物馆ID不存在），重定向到默认博物馆
  if (!success) {
    console.warn(`Museum with ID ${museumId.value} not found, redirecting to default`)
    router.replace('/tour/metropolitan')
  }
})

// 动态设置页面标题和元数据
useHead(() => ({
  title: currentMuseum.value ? `${currentMuseum.value.name} - Tour Guide` : 'Museum Tour Guide',
  meta: [
    { 
      name: 'description', 
      content: currentMuseum.value 
        ? `Interactive voice-guided tour of the ${currentMuseum.value.name}` 
        : 'Interactive voice-guided museum tour'
    }
  ]
}))

// 使用语音导航composable
const { playWelcomeIntroduction, speak, explainExhibit, isSpeaking: voiceIsSpeaking, isListening: voiceIsListening } = useVoiceNavigation()

// 监听语音状态变化
watch(voiceIsSpeaking, (newValue) => {
  isSpeaking.value = newValue
  if (newValue) {
    statusText.value = 'Guide is speaking...'
  } else if (statusText.value === 'Guide is speaking...') {
    statusText.value = ''
  }
})

watch(voiceIsListening, (newValue) => {
  isListening.value = newValue
})

// 对话框状态
const showGuideDialog = ref(false)
const userMessage = ref('')
const chatMessages = ref<{ role: 'user' | 'guide', content: string }[]>([
  { role: 'guide', content: 'Hello! I\'m your virtual guide. How can I help you today?' }
])

// 地图相关状态
const currentFloor = ref(1)
const mapSectionRef = ref<MapSectionComponent | null>(null)

// 楼层字符串，用于toolbar
const currentFloorStr = computed(() => {
  return currentFloor.value === 0 ? 'G' :
         currentFloor.value === 1 ? '1' :
         currentFloor.value === 2 ? '2-3' : '1'
})

// 更新楼层
function updateFloor(floor: number) {
  currentFloor.value = floor
}

// 定义接口类型
interface MapSectionComponent {
  highlightExhibit: (id: number) => void;
}

// 计算属性：根据当前楼层过滤推荐路线
const filteredRouteItems = computed(() => {
  return routeItems.value.filter(item => item.floor === currentFloor.value)
})

// 处理展品选择
function onExhibitSelected(exhibit: ExhibitItem) {
  selectedExhibit.value = exhibit
  showExhibitPanel.value = true
  
  // 当展品被选中时，触发语音解释
  explainExhibit(exhibit)
}

// 添加一个函数用于在用户首次交互后播放欢迎介绍
function playWelcomeOnInteraction() {
  if (currentMuseum.value) {
    speak(`Welcome to ${currentMuseum.value.name}. I'll be your guide today.`)
  } else {
    playWelcomeIntroduction()
  }
}

// 确保在组件销毁时清理资源
onBeforeUnmount(() => {
  // 清理可能的语音合成
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
})

// 导航方法
function goBack() {
  router.back()
}

// 开始导览
function startGuidedTour() {
  statusText.value = 'Starting guided tour...'
  
  // 在用户交互时尝试播放欢迎介绍
  playWelcomeOnInteraction()
  
  // 打开路线面板
  showRoutePanel.value = true
  
  // 重置可能的高亮状态
  routeItems.value.forEach(item => item.highlight = false)

  // 高亮第一个项目
  if (filteredRouteItems.value.length > 0) {
    highlightExhibit(filteredRouteItems.value[0])

    // 播放介绍
    if (currentMuseum.value) {
      speak(`Let's start our tour of the ${currentMuseum.value.name}. I'll guide you through the highlights of the collection.`)
    } else {
      speak('Let\'s start our tour. I\'ll guide you through the highlights of the collection.')
    }
  }
  
  // 5秒后清除状态文本
  setTimeout(() => {
    if (statusText.value === 'Starting guided tour...') {
      statusText.value = ''
    }
  }, 5000)
}

// 语音识别相关方法
function startListening() {
  isListening.value = true
  statusText.value = 'Listening...'
}

function stopListening() {
  if (!isListening.value) return
  
  isListening.value = false
  openGuideDialog()
  statusText.value = ''
}

// 处理Guide对话框交互
function openGuideDialog() {
  showGuideDialog.value = true
  // 在用户交互时尝试播放欢迎介绍
  playWelcomeOnInteraction()
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
  
  // 显示展品详情
  selectedExhibit.value = item
  showExhibitPanel.value = true
}
</script>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 语音波浪动画 */
.voice-wave {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: voice-wave 1.5s infinite ease-in-out;
}

@keyframes voice-wave {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>