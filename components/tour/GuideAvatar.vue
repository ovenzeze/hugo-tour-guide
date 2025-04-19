<template>
  <div class="relative">
    <div 
      class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white"
      :class="{ 'animate-pulse': speaking }"
    >
      <span class="text-blue-600 font-bold">AI</span>
    </div>
    <div 
      v-if="speaking"
      class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  speaking: {
    type: Boolean,
    default: false
  }
})
</script>