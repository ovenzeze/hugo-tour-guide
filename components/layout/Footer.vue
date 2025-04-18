<template>
  <footer class="bg-gray-100 border-t">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <div class="flex items-center justify-center md:justify-start">
            <!-- Logo placeholder -->
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-2">
              <span class="font-bold text-sm">AI</span>
            </div>
            <span class="font-semibold">AI Tour Guide</span>
          </div>
          <p class="text-sm text-gray-600 mt-2">© 2025 AI Tour Guide. All rights reserved.</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-4">
          <div>
            <h3 class="font-medium mb-2">About</h3>
            <ul class="text-sm space-y-1">
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Our Story</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Team</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-medium mb-2">Support</h3>
            <ul class="text-sm space-y-1">
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Help Center</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Contact Us</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-medium mb-2">Legal</h3>
            <ul class="text-sm space-y-1">
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Terms of Service</a></li>
              <li><a href="#" class="text-gray-600 hover:text-blue-600">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-medium mb-2">Connect</h3>
            <div class="flex space-x-3">
              <a href="#" class="text-gray-600 hover:text-blue-600">
                <span>📱</span>
              </a>
              <a href="#" class="text-gray-600 hover:text-blue-600">
                <span>💻</span>
              </a>
              <a href="#" class="text-gray-600 hover:text-blue-600">
                <span>📧</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Version 1.0.0 | AI Tour Guide is a demo application</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component logic will be implemented here
</script>