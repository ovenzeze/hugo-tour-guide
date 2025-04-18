<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Set Your Preferences</h1>
    <p class="mb-6">Customize your museum experience by setting your preferences below.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Time Preference Section -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-3">Visit Duration</h2>
        <p class="mb-3">How much time do you plan to spend at the museum?</p>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="duration" value="0.5" class="mr-2">
            <span>30 minutes (5-7 exhibits)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="duration" value="1" class="mr-2" checked>
            <span>1 hour (10-12 exhibits)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="duration" value="1.5" class="mr-2">
            <span>1.5 hours (15-18 exhibits)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="duration" value="2" class="mr-2">
            <span>2+ hours (20+ exhibits)</span>
          </label>
        </div>
      </div>
      
      <!-- Region Preference Section -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-3">Region of Origin</h2>
        <p class="mb-3">Select your region to personalize cultural context:</p>
        <select class="w-full p-2 border rounded">
          <option value="north-america">North America</option>
          <option value="europe">Europe</option>
          <option value="asia">Asia</option>
          <option value="africa">Africa</option>
          <option value="oceania">Oceania</option>
          <option value="south-america">South America</option>
        </select>
      </div>
    </div>
    
    <!-- Interest Preference Section -->
    <div class="border rounded-lg p-4 mb-6">
      <h2 class="text-xl font-semibold mb-3">Areas of Interest</h2>
      <p class="mb-3">Select the types of exhibits you're most interested in:</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <label class="flex items-center">
          <input type="checkbox" class="mr-2" checked>
          <span>Western Art</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2">
          <span>East Asian Art</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2">
          <span>Modern Art</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2">
          <span>Ancient Artifacts</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2">
          <span>Natural History</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2">
          <span>Scientific Exhibits</span>
        </label>
      </div>
    </div>
    
    <div class="flex justify-end">
      <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Save Preferences
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Preference page logic will be implemented here
</script>