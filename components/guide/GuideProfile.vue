<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="bg-blue-50 p-4">
      <div class="flex flex-col sm:flex-row items-center sm:items-start">
        <!-- Guide Avatar -->
        <div class="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden mb-4 sm:mb-0 sm:mr-4">
          <img 
            src="/images/guide/lisa-profile.jpg" 
            alt="Lisa Ghimire" 
            class="w-full h-full object-cover"
            onerror="this.src='https://via.placeholder.com/150?text=Lisa'; this.onerror=null;"
          />
        </div>
        
        <!-- Guide Info -->
        <div class="text-center sm:text-left">
          <h2 class="text-xl font-semibold">Lisa Ghimire</h2>
          <p class="text-gray-600">AI Museum Guide</p>
          <div class="flex items-center justify-center sm:justify-start mt-1">
            <div class="flex">
              <span class="text-yellow-400">★</span>
              <span class="text-yellow-400">★</span>
              <span class="text-yellow-400">★</span>
              <span class="text-yellow-400">★</span>
              <span class="text-yellow-400">★</span>
            </div>
            <span class="text-sm text-gray-600 ml-1">5.0 (124 reviews)</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="font-medium mb-2">About Me</h3>
      <p class="text-gray-700 mb-4">
        Hello! I'm Lisa, your personal AI museum guide. I specialize in art history and cultural heritage, 
        with expertise in both Western and Eastern art traditions. I'm here to enhance your museum 
        experience by providing personalized tours and answering any questions you might have.
      </p>
      
      <h3 class="font-medium mb-2">Specialties</h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Western Art History</span>
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">East Asian Artifacts</span>
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Cultural Context</span>
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Interactive Tours</span>
      </div>
      
      <h3 class="font-medium mb-2">Languages</h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">English</span>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Mandarin</span>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Spanish</span>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">French</span>
      </div>
      
      <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        Start Tour with Lisa
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Guide profile component logic will be implemented here
</script>