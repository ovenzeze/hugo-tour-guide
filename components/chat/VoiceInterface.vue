<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="bg-gray-100 p-3 border-b">
      <h3 class="font-medium text-center">Voice Interface</h3>
    </div>
    
    <div class="p-6 flex flex-col items-center">
      <!-- Voice Visualization -->
      <div class="mb-6 w-full h-16 bg-gray-50 rounded-lg overflow-hidden">
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
          Voice visualization will appear here
        </div>
      </div>
      
      <!-- Voice Button -->
      <button 
        class="w-20 h-20 rounded-full flex items-center justify-center focus:outline-none transition-all duration-200"
        :class="isListening ? 'bg-red-500 text-white scale-110' : 'bg-blue-600 text-white hover:bg-blue-700'"
        @click="toggleListening"
      >
        <span v-if="isListening" class="text-2xl">■</span>
        <span v-else class="text-2xl">🎤</span>
      </button>
      
      <!-- Status Text -->
      <div class="mt-4 text-center">
        <p v-if="isListening" class="text-red-500 font-medium">
          Listening... Tap to stop
        </p>
        <p v-else class="text-gray-600">
          Tap microphone to start speaking
        </p>
      </div>
      
      <!-- Transcript Preview -->
      <div v-if="transcript" class="mt-6 p-3 bg-gray-50 rounded-lg w-full">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Transcript:</span> {{ transcript }}
        </p>
      </div>
    </div>
    
    <div class="bg-gray-50 p-3 border-t">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <span v-if="isListening" class="flex items-center">
            <span class="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Recording
          </span>
          <span v-else>Ready</span>
        </div>
        
        <div class="flex space-x-2">
          <button 
            v-if="transcript" 
            class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            @click="sendTranscript"
          >
            Send
          </button>
          <button 
            v-if="transcript" 
            class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            @click="clearTranscript"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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