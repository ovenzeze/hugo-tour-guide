<template>
  <div class="h-dvh max-h-dvh flex flex-col relative">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b shadow-sm h-16 shrink-0">
      <div class="container mx-auto px-4 h-full flex justify-between items-center">
        <h1 class="text-xl font-bold text-blue-600">AI Tour Guide</h1>
        <button class="md:hidden p-2" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Icon name="ph:menu" class="w-6 h-6" />
        </button>
        <nav class="hidden md:block">
          <ul class="flex space-x-6">
            <li v-for="link in navLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="hover:text-blue-600"
                :class="{ 'text-blue-600': $route.path === link.path }"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      
      <!-- 移动端菜单 -->
      <Transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t">
          <ul class="flex flex-col px-4 py-2 space-y-2">
            <li v-for="link in navLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="block py-2 hover:text-blue-600"
                :class="{ 'text-blue-600': $route.path === link.path }"
                @click="isMobileMenuOpen = false"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </Transition>
    </header>
    
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
const isMobileMenuOpen = ref(false)

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

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>