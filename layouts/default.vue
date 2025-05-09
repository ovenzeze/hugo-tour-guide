<template>
  <!-- 使用单一根节点包装整个布局，解决 Transition 动画警告 -->
  <div>
    <!-- 使用 v-if/v-else 直接在 div 元素上，而不是使用 template 标签 -->
    <div v-if="shouldHideLayoutShell">
      <slot />
    </div>
    <div v-else class="h-dvh max-h-dvh flex flex-col relative bg-background" :class="{ 'ios-pwa-safe-area': isPwa, 'ios-header-safe-area': isPwa }">
      <ClientOnly>
        <div class="header-wrapper">
          <DynamicAppHeader />
        </div>
        <GuidePopup />
      </ClientOnly>
      
      <main class="flex-1 overflow-hidden overscroll-none md:pb-4 pb-20" :class="{ 'pb-32': isPwa }">
        <div class="container mx-auto px-4 h-full overflow-scroll">
          <slot />
        </div>
      </main>
      
      <nav
        class="fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 border-t z-50 bg-background border-t-border box-border"
        :style="{
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem'
        }"
      >
        <ul class="flex justify-around h-full items-center">
          <li v-for="link in bottomNavLinks" :key="link.path" class="flex-1 h-full ">
            <NuxtLink 
              :to="link.path" 
              class="flex flex-col items-center justify-center h-full px-2 py-1 text-xs"
              :class="{ 'text-amber-800 ': $route.path === link.path }"
            >
              <Icon :name="link.icon" class="w-6 h-6" />
              <span class="mt-1">{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router' // 导入 useRoute
import GuidePopup from '../components/layout/GuidePopup.vue'
import DynamicAppHeader from '../components/layout/DynamicAppHeader.vue'
import { usePwa } from '~/composables/usePwa'

const { isPwa } = usePwa()
const route = useRoute() // 获取当前路由对象

// 计算是否应该隐藏布局外壳
const shouldHideLayoutShell = computed(() => {
  return !!route.meta.hideLayoutShell; // 如果 route.meta.hideLayoutShell 为 true，则隐藏
});

const navLinks = [
  { path: '/', label: 'Home', icon: 'ph:house' },
  { path: '/guide', label: 'Guide', icon: 'ph:book-open' },
  { path: '/tour', label: 'Tour', icon: 'ph:map-trifold' },
  { path: '/chat', label: 'Chat', icon: 'ph:chat-circle' },
  { path: '/docs', label: 'Docs', icon: 'ph:file-text' }, 
  { path: '/debug', label: 'Debug', icon: 'ph:gear' }
]

const bottomNavLinks = computed(() => {
  // 显示 Guide、Tour、Chat、Docs、Debug 五个底部Tab（不含 Home）
  let links = navLinks.filter(link => link.path !== '/');

  if (!import.meta.dev) { // If not in development environment (i.e., in production)
    links = links.filter(link => link.path !== '/docs' && link.path !== '/debug'); // Filter out Docs and Debug
  }
  
  return links;
})
</script>

<style scoped>
.ios-pwa-safe-area .bottom-nav {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom) * 0.5);
}


.ios-header-safe-area {
  padding-top: env(safe-area-inset-top);
}

.header-wrapper {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
}

</style>
