<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b shadow-sm">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-blue-600">AI Tour Guide</h1>
        </div>
        <nav class="hidden md:block">
          <ul class="flex space-x-6">
            <li><NuxtLink to="/" class="hover:text-blue-600">Home</NuxtLink></li>
            <li><NuxtLink to="/guide" class="hover:text-blue-600">Guide</NuxtLink></li>
            <li><NuxtLink to="/preference" class="hover:text-blue-600">Preferences</NuxtLink></li>
            <li><NuxtLink to="/tour" class="hover:text-blue-600">Tour</NuxtLink></li>
            <li><NuxtLink to="/chat" class="hover:text-blue-600">Chat</NuxtLink></li>
          </ul>
        </nav>
        <div class="md:hidden">
          <button class="p-2">
            <span>☰</span>
          </button>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-100 border-t">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <p class="text-sm text-gray-600">© 2025 AI Tour Guide. All rights reserved.</p>
          </div>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600 hover:text-blue-600">
              <span>About</span>
            </a>
            <a href="#" class="text-gray-600 hover:text-blue-600">
              <span>Privacy</span>
            </a>
            <a href="#" class="text-gray-600 hover:text-blue-600">
              <span>Terms</span>
            </a>
            <a href="#" class="text-gray-600 hover:text-blue-600">
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Default layout logic will be implemented here
</script>