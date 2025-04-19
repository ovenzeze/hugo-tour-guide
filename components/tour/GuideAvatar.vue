<template>
  <div class="relative">
    <div 
      class="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md"
      v-motion
      :initial="{ scale: 1 }"
      :animate="speaking ? { scale: [1, 1.05, 1] } : {}"
      :transition="{ repeat: Infinity, duration: 1500 }"
    >
      <img 
        src="/images/guide/lisa-profile.jpg" 
        alt="AI Guide" 
        class="w-full h-full object-cover"
        onerror="this.onerror=null; this.innerHTML='<div class=\'w-full h-full bg-blue-100 flex items-center justify-center\'><span class=\'text-blue-600 font-bold\'>AI</span></div>'"
      />
    </div>
    <div 
      v-if="speaking"
      class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
      v-motion
      :animate="{ opacity: [0.5, 1, 0.5] }"
      :transition="{ repeat: Infinity, duration: 1200 }"
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