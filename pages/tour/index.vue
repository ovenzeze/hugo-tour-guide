<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Museum Tour</h1>
    
    <!-- Museum Map Section -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Museum Map</h2>
      <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-2">
        <span class="text-gray-500">Interactive Museum Map</span>
      </div>
      <div class="flex justify-end">
        <button class="bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
          <span>Zoom In</span>
        </button>
        <button class="bg-gray-200 text-gray-700 px-3 py-1 rounded">
          <span>Zoom Out</span>
        </button>
      </div>
    </div>
    
    <!-- Recommended Route Section -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Recommended Route</h2>
      <div class="border rounded-lg p-4">
        <div class="flex justify-between mb-3">
          <div>
            <span class="font-medium">Estimated Time:</span> 1 hour 15 minutes
          </div>
          <div>
            <span class="font-medium">Distance:</span> 0.8 km
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center">
            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">1</div>
            <span>Egyptian Collection (Floor 1, Room 4)</span>
          </div>
          <div class="flex items-center">
            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">2</div>
            <span>Greek Sculptures (Floor 1, Room 7)</span>
          </div>
          <div class="flex items-center">
            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">3</div>
            <span>Renaissance Paintings (Floor 2, Room 3)</span>
          </div>
          <div class="flex items-center">
            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">4</div>
            <span>Modern Art Gallery (Floor 2, Room 8)</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Featured Exhibits Section -->
    <div>
      <h2 class="text-xl font-semibold mb-3">Featured Exhibits</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Exhibit Card 1 -->
        <div class="border rounded-lg overflow-hidden">
          <div class="bg-gray-200 h-40 flex items-center justify-center">
            <span class="text-gray-500">Exhibit Image</span>
          </div>
          <div class="p-3">
            <h3 class="font-medium">The Rosetta Stone</h3>
            <p class="text-sm text-gray-600 mb-2">Ancient Egyptian artifact, key to deciphering hieroglyphics</p>
            <div class="flex justify-between">
              <button class="text-blue-600 text-sm">View Details</button>
              <button class="text-blue-600 text-sm">Add to Route</button>
            </div>
          </div>
        </div>
        
        <!-- Exhibit Card 2 -->
        <div class="border rounded-lg overflow-hidden">
          <div class="bg-gray-200 h-40 flex items-center justify-center">
            <span class="text-gray-500">Exhibit Image</span>
          </div>
          <div class="p-3">
            <h3 class="font-medium">Venus de Milo</h3>
            <p class="text-sm text-gray-600 mb-2">Ancient Greek sculpture from the Hellenistic period</p>
            <div class="flex justify-between">
              <button class="text-blue-600 text-sm">View Details</button>
              <button class="text-blue-600 text-sm">Add to Route</button>
            </div>
          </div>
        </div>
        
        <!-- Exhibit Card 3 -->
        <div class="border rounded-lg overflow-hidden">
          <div class="bg-gray-200 h-40 flex items-center justify-center">
            <span class="text-gray-500">Exhibit Image</span>
          </div>
          <div class="p-3">
            <h3 class="font-medium">Mona Lisa</h3>
            <p class="text-sm text-gray-600 mb-2">Leonardo da Vinci's masterpiece portrait</p>
            <div class="flex justify-between">
              <button class="text-blue-600 text-sm">View Details</button>
              <button class="text-blue-600 text-sm">Add to Route</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ask Guide 按钮 -->
    <AskGuideButton @click="openGuideDialog" />
    
    <!-- Guide 对话框 -->
    <GuideDialog
      v-model="showGuideDialog"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '~/stores/chatStore'
import AskGuideButton from "~/components/guide/AskGuideButton.vue"
import GuideDialog from "~/components/guide/GuideDialog.vue"

// 初始化 chatStore
const chatStore = useChatStore()

// 对话框状态
const showGuideDialog = ref(false)

// 处理 Ask Guide 按钮点击
function openGuideDialog() {
  showGuideDialog.value = true
  chatStore.initialize()
}

// 处理消息发送
function handleSendMessage(content: string) {
  if (!content.trim()) return
  chatStore.sendMessage(content)
}
</script>