<template>
  <div class="h-dvh max-h-dvh flex flex-col relative">
    <!-- 动态导航栏 -->
    <DynamicHeader />
    
    <!-- 主要内容区 -->
    <main class="flex-1 overflow-y-auto pt-4 pb-[calc(64px+1rem)] md:pb-4">
      <div class="container mx-auto px-4 h-full">
        <slot />
      </div>
    </main>
    
    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 h-16">
      <ul class="flex justify-around h-full items-center">
        <li v-for="link in bottomNavLinks" :key="link.path" class="flex-1 h-full">
          <NuxtLink 
            :to="link.path" 
            class="flex flex-col items-center justify-center h-full px-2 py-1 text-xs"
            :class="{ 'text-blue-600': $route.path === link.path }"
          >
            <Icon :name="link.icon" class="w-6 h-6" />
            <span class="mt-1">{{ link.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DynamicHeader from '~/components/layout/DynamicHeader.vue'

const navLinks = [
  { path: '/', label: 'Home', icon: 'ph:house' },
  { path: '/guide', label: 'Guide', icon: 'ph:book-open' },
  { path: '/preference', label: 'Preferences', icon: 'ph:gear' },
  { path: '/tour', label: 'Tour', icon: 'ph:map-trifold' },
  { path: '/chat', label: 'Chat', icon: 'ph:chat-circle' }
]

const bottomNavLinks = computed(() => {
  return navLinks.filter(link => 
    link.path !== '/' // 首页已在logo中体现
  )
})
</script>