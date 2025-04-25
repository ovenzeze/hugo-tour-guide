<template>
  <ClientOnly>
    <BottomDrawer v-model="showPopup">
      <div class="py-6 pb-10">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Enhance Your Experience</h2>
          <!-- <button @click="closePopup" class="text-gray-500 hover:text-gray-700">
            <Icon name="ph:x" class="w-6 h-6" />
          </button> -->
        </div>
        
        <p class="text-gray-600 mb-6">
          Add this app to your home screen for a better experience.
        </p>
        
        <div class="space-y-6 mb-6">
          <div 
            class="flex items-start"
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 200 } }"
          >
            <div class=" rounded-full p-2 mr-4">
              <Icon name="ph:share" class="w-6 h-6 text-amber-800" />
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-800">Step 1</p>
              <p class="text-gray-600">Tap the share button in your browser</p>
            </div>
          </div>
          
          <div 
            class="flex items-start"
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 300 } }"
          >
            <div class=" rounded-full p-2 mr-4">
              <Icon name="ph:plus-circle" class="w-6 h-6 text-amber-800" />
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-800">Step 2</p>
              <p class="text-gray-600">Select "Add to Home Screen"</p>
            </div>
          </div>
          
          <div 
            class="flex items-start"
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 400 } }"
          >
            <div class="rounded-full p-2 mr-4">
              <Icon name="ph:check-circle" class="w-6 h-6 text-amber-800" />
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-800">Step 3</p>
              <p class="text-gray-600">Tap "Add" to confirm</p>
            </div>
          </div>
        </div>
        
        <button
          @click="closePopup"
          class="w-full bg-amber-800 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
          v-motion-pop
          :initial="{ scale: 0.95, opacity: 0.8 }"
          :enter="{ scale: 1, opacity: 1 }"
        >
          Got it
        </button>
      </div>
    </BottomDrawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMotion } from '@vueuse/motion'
import type { MotionVariants } from '@vueuse/motion'
import BottomDrawer from '../ui/BottomDrawer.vue'

const showPopup = ref(false)

onMounted(() => {
  console.log('GuidePopup mounted.');
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const hasShown = localStorage.getItem('hasShownGuidePopup');
  console.log('isSafari:', isSafari);
  console.log('hasShownGuidePopup:', hasShown);

  if (isSafari && !hasShown) {
    console.log('Conditions met, setting showPopup to true.');
    showPopup.value = true;
  } else {
    console.log('Conditions not met, popup will not show.');
  }
})

const closePopup = () => {
  showPopup.value = false
  localStorage.setItem('hasShownGuidePopup', 'true')
}
</script>