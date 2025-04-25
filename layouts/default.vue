<template>
  <div class="h-dvh max-h-dvh flex flex-col relative bg-background" :class="{ 'ios-pwa-safe-area': isPwa, 'ios-header-safe-area': isPwa }">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GuidePopup from '../components/layout/GuidePopup.vue'
import DynamicAppHeader from '../components/layout/DynamicAppHeader.vue'
import { usePwa } from '~/composables/usePwa'

const { isPwa } = usePwa()

const navLinks = [
  { path: '/', label: 'Home', icon: 'ph:house' },
  { path: '/guide', label: 'Guide', icon: 'ph:book-open' },
  { path: '/tour', label: 'Tour', icon: 'ph:map-trifold' },
  { path: '/chat', label: 'Chat', icon: 'ph:chat-circle' },
  { path: '/debug', label: 'Debug', icon: 'ph:gear' }
]

const bottomNavLinks = computed(() => {
  return navLinks.filter(link => 
    link.path !== '/' // 首页已在logo中体现
  )
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
