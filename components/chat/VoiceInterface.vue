<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="p-4 flex flex-col items-center">
      <!-- Voice Visualization -->
      <div class="mb-4 w-full h-12 bg-gray-50 rounded-lg overflow-hidden">
        <div v-if="isListening" class="h-full flex items-center justify-center">
          <!-- Voice wave animation -->
          <div class="flex items-center space-x-1">
            <div v-for="i in 5" :key="i" class="w-1 bg-blue-600 rounded-full animate-pulse" :style="{
              height: `${20 + Math.random() * 30}px`,
              animationDelay: `${i * 0.1}s`
            }"></div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
          Speak to the AI guide
        </div>
      </div>
      
      <div class="flex items-center justify-between w-full mb-2">
        <!-- Status Text -->
        <div class="text-sm text-gray-600">
          <span v-if="isListening" class="flex items-center text-red-500">
            <span class="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            Recording
          </span>
          <span v-else>Ready to listen</span>
        </div>
        
        <!-- Voice Button -->
        <button 
          class="w-16 h-16 rounded-full flex items-center justify-center focus:outline-none transition-all duration-200 shadow-md"
          :class="isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'"
          @click="toggleListening"
        >
          <span v-if="isListening" class="material-icons">stop</span>
          <span v-else class="material-icons">mic</span>
        </button>
        
        <!-- Send Button -->
        <button 
          v-if="transcript" 
          class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          @click="sendTranscript"
        >
          <span class="material-icons text-sm mr-1">send</span>
          Send
        </button>
        <div v-else class="w-16"></div>
      </div>
      
      <!-- Transcript Preview -->
      <div v-if="transcript" class="p-2 bg-gray-50 rounded-lg w-full mb-2">
        <p class="text-sm text-gray-700">
          {{ transcript }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isListening = ref(false)
const transcript = ref('')

// Toggle listening state
function toggleListening() {
  isListening.value = !isListening.value
  
  if (isListening.value) {
    startListening()
  } else {
    stopListening()
  }
}

// Start voice recognition
function startListening() {
  // In a real implementation, this would initialize the Web Speech API
  // or another speech recognition service
  console.log('Starting voice recognition...')
  
  // Simulate receiving transcript updates
  transcript.value = ''
  simulateTranscript()
}

// Stop voice recognition
function stopListening() {
  // In a real implementation, this would stop the speech recognition service
  console.log('Stopping voice recognition...')
  
  // In a real app, the final transcript would be available here
}

// Send the current transcript as a message
function sendTranscript() {
  if (!transcript.value) return
  
  // Emit the transcript to parent components
  emit('send', transcript.value)
  
  // Clear the transcript after sending
  transcript.value = ''
}

// Clear the current transcript
function clearTranscript() {
  transcript.value = ''
}

// For demo purposes only: simulate receiving transcript updates
function simulateTranscript() {
  if (!isListening.value) return
  
  const phrases = [
    'Tell me about ',
    'Tell me about the Egyptian ',
    'Tell me about the Egyptian collection',
  ]
  
  let currentIndex = 0
  
  const interval = setInterval(() => {
    if (!isListening.value || currentIndex >= phrases.length) {
      clearInterval(interval)
      return
    }
    
    transcript.value = phrases[currentIndex]
    currentIndex++
  }, 1000)
}

// Define emits
const emit = defineEmits(['send'])
</script>