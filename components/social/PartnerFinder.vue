<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
      <h2 class="text-xl font-semibold">Find a Museum Partner</h2>
      <p class="text-sm opacity-90">Connect with others who share your interests</p>
    </div>
    
    <div class="p-4">
      <!-- Search Controls -->
      <div class="mb-4">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-grow">
            <label class="block text-sm font-medium mb-1">Interests</label>
            <select class="w-full p-2 border rounded">
              <option value="">All Interests</option>
              <option value="western-art">Western Art</option>
              <option value="east-asian-art">East Asian Art</option>
              <option value="modern-art">Modern Art</option>
              <option value="ancient-artifacts">Ancient Artifacts</option>
            </select>
          </div>
          
          <div class="w-full md:w-32">
            <label class="block text-sm font-medium mb-1">Distance</label>
            <select class="w-full p-2 border rounded">
              <option value="50">Nearby</option>
              <option value="100">In Museum</option>
              <option value="500">All</option>
            </select>
          </div>
          
          <div class="w-full md:w-auto self-end">
            <button class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results List -->
      <div class="space-y-4">
        <!-- Partner Card 1 -->
        <div class="border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
              <img 
                src="https://via.placeholder.com/100?text=U1" 
                alt="User" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-grow">
              <h3 class="font-medium">Alex T.</h3>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mr-2">📍 Nearby (2 min away)</span>
                <span>⏱️ 1 hour visit</span>
              </div>
            </div>
            <div>
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                80% Match
              </span>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-sm text-gray-700">Interested in modern art and ancient Egyptian artifacts.</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Modern Art</span>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Ancient Egypt</span>
            </div>
          </div>
          <div class="mt-3 flex justify-end">
            <button class="text-blue-600 text-sm hover:underline">
              Send Request
            </button>
          </div>
        </div>
        
        <!-- Partner Card 2 -->
        <div class="border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
              <img 
                src="https://via.placeholder.com/100?text=U2" 
                alt="User" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-grow">
              <h3 class="font-medium">Jamie L.</h3>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mr-2">📍 Floor 2 (5 min away)</span>
                <span>⏱️ 2 hour visit</span>
              </div>
            </div>
            <div>
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                65% Match
              </span>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-sm text-gray-700">Art history student focusing on Renaissance paintings.</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Renaissance</span>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Western Art</span>
            </div>
          </div>
          <div class="mt-3 flex justify-end">
            <button class="text-blue-600 text-sm hover:underline">
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-50 p-3 border-t text-center">
      <p class="text-sm text-gray-600">
        2 potential partners found based on your preferences
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Partner finder component logic will be implemented here
</script>