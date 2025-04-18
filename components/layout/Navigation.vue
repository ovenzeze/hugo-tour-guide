<template>
  <nav>
    <ul class="flex space-x-6">
      <li>
        <NuxtLink 
          to="/" 
          class="py-2 border-b-2 transition-colors" 
          :class="route.path === '/' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'"
        >
          Home
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/guide" 
          class="py-2 border-b-2 transition-colors" 
          :class="route.path.startsWith('/guide') ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'"
        >
          Guide
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/preference" 
          class="py-2 border-b-2 transition-colors" 
          :class="route.path.startsWith('/preference') ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'"
        >
          Preferences
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/tour" 
          class="py-2 border-b-2 transition-colors" 
          :class="route.path.startsWith('/tour') ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'"
        >
          Tour
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/chat" 
          class="py-2 border-b-2 transition-colors" 
          :class="route.path.startsWith('/chat') ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'"
        >
          Chat
        </NuxtLink>
      </li>
    </ul>
  </nav>
  
  <!-- Mobile Navigation Menu (hidden by default) -->
  <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
    <div class="bg-white w-64 h-full p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold">Menu</h2>
        <button @click="isMobileMenuOpen = false" class="p-2">
          <span>✕</span>
        </button>
      </div>
      
      <ul class="space-y-4">
        <li>
          <NuxtLink 
            to="/" 
            class="block py-2" 
            :class="route.path === '/' ? 'text-blue-600 font-medium' : ''"
            @click="isMobileMenuOpen = false"
          >
            Home
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            to="/guide" 
            class="block py-2" 
            :class="route.path.startsWith('/guide') ? 'text-blue-600 font-medium' : ''"
            @click="isMobileMenuOpen = false"
          >
            Guide
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            to="/preference" 
            class="block py-2" 
            :class="route.path.startsWith('/preference') ? 'text-blue-600 font-medium' : ''"
            @click="isMobileMenuOpen = false"
          >
            Preferences
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            to="/tour" 
            class="block py-2" 
            :class="route.path.startsWith('/tour') ? 'text-blue-600 font-medium' : ''"
            @click="isMobileMenuOpen = false"
          >
            Tour
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            to="/chat" 
            class="block py-2" 
            :class="route.path.startsWith('/chat') ? 'text-blue-600 font-medium' : ''"
            @click="isMobileMenuOpen = false"
          >
            Chat
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isMobileMenuOpen = ref(false)
</script>