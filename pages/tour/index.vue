<template>
  <div class="h-full w-full max-h-full relative" v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 0.5 } }">

    <!-- 地图组件 -->
    <div class="overflow-hidden">
      <MapSection v-model:currentFloor="currentFloor" ref="mapSectionRef" @exhibit-selected="onExhibitSelected" />
    </div>

    <!-- 推荐路线区域 -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recommended Route</h2>
        <button class="flex items-center gap-2 text-blue-500 font-medium" @click="startGuidedTour">
          <span>Start Tour</span>
          <span class="material-icons">play_arrow</span>
        </button>
      </div>

      <!-- 路线信息 -->
      <div class="bg-blue-50 p-4 rounded-t-lg border border-blue-100">
        <div class="flex justify-between items-center flex-wrap gap-y-2">
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">schedule</span>
            <div>
              <span class="text-sm text-gray-700">Estimated Time:</span>
              <span class="font-medium ml-1">1 hour 15 minutes</span>
            </div>
          </div>
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">straighten</span>
            <div>
              <span class="text-sm text-gray-700">Distance:</span>
              <span class="font-medium ml-1">0.8 km</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 路线项目列表 -->
      <div class="border border-t-0 rounded-b-lg divide-y overflow-hidden">
        <div v-for="(item, index) in filteredRouteItems" :key="item.id"
          class="p-4 flex bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          :class="{ 'bg-blue-50 hover:bg-blue-100': item.highlight }" @click="highlightExhibit(item)">
          <!-- 编号圆圈 -->
          <div class="mr-4">
            <div
              class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
              {{ index + 1 }}
            </div>
          </div>

          <!-- 项目信息 -->
          <div class="flex-1">
            <div class="font-medium text-gray-900 mb-1">{{ item.name }}</div>
            <div class="flex items-center text-gray-500 text-sm">
              <span class="material-icons text-sm mr-1">place</span>
              <span>{{ item.location }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <button class="text-blue-500 p-2 hover:bg-blue-50 rounded-full" title="Show on map"
              @click.stop="showExhibitOnMap(item)">
              <span class="material-icons">map</span>
            </button>
            <button class="text-green-500 p-2 hover:bg-green-50 rounded-full" title="Listen to guide"
              @click.stop="listenToGuideExplanation(item)">
              <span class="material-icons">volume_up</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色展品 -->
    <div class="mb-20">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-xl font-semibold text-gray-900">Featured Exhibits</h2>

      </div>

      <!-- 展品滚动区域 -->
      <div class="relative">
        <div ref="exhibitsContainer" class="flex gap-4 snap-x snap-mandatory overflow-x-auto hide-scrollbar pb-4">
          <ExhibitCard v-for="(exhibit, index) in featuredExhibits" :key="exhibit.id" :exhibit="exhibit"
            :delay="0.7 + index * 0.1" class="snap-start min-w-[280px] flex-shrink-0" @view-details="viewExhibitDetails"
            @add-to-route="addExhibitToRoute" />
        </div>

        <!-- 滚动指示器 -->
        <div class="flex justify-center space-x-1 mt-3">
          <button v-for="(_, index) in Math.min(3, featuredExhibits.length)" :key="index"
            class="w-2 h-2 rounded-full bg-gray-300"
            :class="{ 'w-6 bg-blue-500': currentExhibitPage === index }"></button>
        </div>
      </div>
    </div>
    <GuideToolbar @open-guide-dialog="openGuideDialog" />


  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chatStore'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import MapSection from '~/components/tour/MapSection.vue'
import ExhibitCard from '~/components/tour/ExhibitCard.vue'
import GuideToolbar from '~/components/tour/GuideToolbar.vue'

// 设置页面标题和元数据
useHead({
  title: 'Metropolitan Museum Tour Guide',
  meta: [
    { name: 'description', content: 'Interactive voice-guided tour of the Metropolitan Museum' }
  ]
})

// 路由
const router = useRouter()

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
const { playWelcomeIntroduction, speak, explainExhibit } = useVoiceNavigation()

// 对话框状态
const showGuideDialog = ref(false)
const userMessage = ref('')
const chatMessages = ref<{ role: 'user' | 'guide', content: string }[]>([
  { role: 'guide', content: 'Hello! I\'m your virtual guide. How can I help you today?' }
])

// 地图相关状态
const currentFloor = ref(1)
const mapSectionRef = ref<MapSectionComponent | null>(null)
const showMapDiagnostics = ref(false)

// 展品相关状态
const currentExhibitPage = ref(0)
const exhibitsContainer = ref<HTMLElement | null>(null)

// 计算属性：根据当前楼层过滤推荐路线
const filteredRouteItems = computed(() => {
  return routeItems.value.filter(item => item.floor === currentFloor.value)
})

// 页面加载时自动播放欢迎介绍
onMounted(() => {
  // 加载Material Icons字体
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  // 添加延迟，让页面先渲染完成
  setTimeout(() => {
    playWelcomeIntroduction()
  }, 1000)

  // 监听展品滚动
  if (exhibitsContainer.value) {
    exhibitsContainer.value.addEventListener('scroll', handleExhibitScroll)
  }
})

// 确保在组件销毁时清理资源
onBeforeUnmount(() => {
  // 清理可能的语音合成
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }

  // 移除滚动监听
  if (exhibitsContainer.value) {
    exhibitsContainer.value.removeEventListener('scroll', handleExhibitScroll)
  }
})

// 监听展品滚动
function handleExhibitScroll() {
  if (!exhibitsContainer.value) return

  const containerWidth = exhibitsContainer.value.offsetWidth
  const scrollPosition = exhibitsContainer.value.scrollLeft
  const pageIndex = Math.round(scrollPosition / containerWidth)

  currentExhibitPage.value = Math.min(pageIndex, 2) // 最多显示3个指示器
}

// 导航方法
function goBack() {
  router.back()
}

// 开始导览
function startGuidedTour() {
  // 重置可能的高亮状态
  tourStore.routeItems.forEach(item => item.highlight = false)

  // 高亮第一个项目
  if (filteredRouteItems.value.length > 0) {
    highlightExhibit(filteredRouteItems.value[0])

    // 播放介绍
    speak('Let\'s start our tour of the Metropolitan Museum. I\'ll guide you through the highlights of the collection.')
  }
}

// 切换地图诊断显示
function toggleMapDiagnostics() {
  showMapDiagnostics.value = !showMapDiagnostics.value
  // 实际项目中需要实现地图诊断功能
  console.log('Toggle map diagnostics:', showMapDiagnostics.value)
}

// 收听导游解释
function listenToGuideExplanation(item: ExhibitItem) {
  highlightExhibit(item)

  // 使用语音导航解释展品
  explainExhibit(item)
}

// 处理Guide对话框交互
function openGuideDialog() {
  showGuideDialog.value = true
}

function handleSendMessage() {
  if (!userMessage.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userMessage.value
  })

  // 处理响应
  // 实际项目中，这里会调用API获取响应
  setTimeout(() => {
    const response = `Thank you for your question "${userMessage.value}". I can provide exhibit information, explain historical context, or recommend tour routes.`
    chatMessages.value.push({
      role: 'guide',
      content: response
    })

    // 使用语音朗读响应
    speak(response)
  }, 800)

  // 清空输入
  userMessage.value = ''
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
  showGuideDialog.value = true

  // 自动填充问题
  userMessage.value = `Please tell me about "${exhibit.name}" exhibit`
}

// 添加展品到路线
function addExhibitToRoute(exhibit: FeaturedExhibit) {
  console.log('Add to route:', exhibit.name)
  // 实现添加到路线逻辑

  // 显示成功提示
  speak(`Added ${exhibit.name} to your tour route.`)
}
</script>

<style scoped>
/* 避免底部工具栏遮挡内容 */
.pb-20 {
  padding-bottom: 5rem;
}

/* 隐藏滚动条 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 滚动指示器动画 */
.rounded-full {
  transition: all 0.3s ease;
}
</style>