<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Meet Your AI Guide</h1>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-1/3">
        <!-- Placeholder for guide profile image -->
        <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">Guide Profile Image</span>
        </div>
      </div>
      <div class="md:w-2/3">
        <h2 class="text-xl font-semibold mb-2">Lisa Ghimire</h2>
        <p class="mb-4">Your personal AI museum guide with expertise in art history and cultural heritage.</p>
        <h3 class="font-medium mb-2">Specialties:</h3>
        <ul class="list-disc pl-5 mb-4">
          <li>Western Art History</li>
          <li>East Asian Artifacts</li>
          <li>Cultural Context Interpretation</li>
          <li>Interactive Museum Experience</li>
        </ul>
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Start Tour
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Guide page logic will be implemented here
</script>