<template>
  <div class="border rounded-lg overflow-hidden shadow-sm bg-card">
    <div class="p-4 flex flex-col items-center">
      <!-- Voice visualization -->
      <div class="mb-4 w-full h-16 bg-accent/10 rounded-lg overflow-hidden flex items-center justify-center">
        <div v-if="isListening" class="h-full flex items-center justify-center">
          <!-- Voice wave animation -->
          <div class="flex items-center space-x-1">
            <div v-for="i in 9" :key="i" 
              class="w-1 rounded-full animate-pulse" 
              :style="{
                height: `${15 + Math.sin((i / 5) * Math.PI + audioLevel * 5) * 20 + (audioLevel * 15)}px`,
                backgroundColor: 'hsl(var(--primary))',
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.8 + (i % 3) * 0.2}s`
              }">
            </div>
          </div>
        </div>
        <div v-else-if="isSpeaking" class="h-full flex items-center justify-center">
          <!-- AI speaking animation -->
          <div class="flex items-center space-x-1">
            <div v-for="i in 5" :key="i" 
              class="w-1.5 rounded-full animate-pulse" 
              :style="{
                height: `${10 + Math.sin((i / 2.5) * Math.PI) * 15}px`,
                backgroundColor: 'hsl(var(--secondary))',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }">
            </div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
          Click the microphone button to start voice conversation
        </div>
      </div>
      
      <div class="flex items-center justify-between w-full mb-2">
        <!-- Status text -->
        <div class="text-sm text-muted-foreground">
          <span v-if="isListening" class="flex items-center text-destructive">
            <span class="w-2 h-2 bg-destructive rounded-full mr-1 animate-pulse"></span>
            Recording
          </span>
          <span v-else-if="isSpeaking" class="flex items-center text-secondary">
            <span class="w-2 h-2 bg-secondary rounded-full mr-1 animate-pulse"></span>
            AI Speaking
          </span>
          <span v-else class="flex items-center">
            <span class="w-2 h-2 bg-muted-foreground rounded-full mr-1"></span>
            Ready
          </span>
              </div>
        
        <!-- Voice button -->
        <Button 
          class="size-16 rounded-full shadow-md"
          :variant="buttonVariant"
          @click="toggleListening"
          :disabled="isSpeaking && !isListening"
          v-motion:hover="{ scale: 1.05 }"
          v-motion:active="{ scale: 0.95 }"
        >
          <Icon v-if="isListening" name="ph:stop-circle-fill" class="size-6" />
          <Icon v-else-if="isSpeaking" name="ph:speaker-high-fill" class="size-6" />
          <Icon v-else name="ph:microphone-fill" class="size-6" />
        </Button>
        
        <!-- Send button -->
        <Button 
          v-if="finalTranscript && !isListening" 
          variant="default"
          class="gap-1"
          @click="sendTranscript"
          v-motion:hover="{ scale: 1.05 }"
          v-motion:active="{ scale: 0.95 }"
        >
          <Icon name="ph:paper-plane-right-fill" class="size-4" />
          Send
        </Button>
        <div v-else class="w-16"></div>
              </div>
      
      <!-- Recognition result preview -->
      <div v-if="displayText" 
        class="p-3 bg-muted/30 rounded-lg w-full mb-2 transition-all duration-200 text-sm">
        <p class="text-foreground">
          {{ displayText }}
        </p>
          </div>

      <!-- Voice settings -->
      <Collapsible v-model:open="showSettings" class="w-full mt-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" class="w-full flex justify-center items-center gap-1">
            <Icon name="ph:sliders-horizontal" class="size-4" />
            <span class="text-xs">Voice Settings</span>
            <Icon 
              :name="showSettings ? 'ph:caret-up' : 'ph:caret-down'" 
              class="size-3 ml-1" 
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg mt-2">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <label class="text-xs text-muted-foreground">Speech Rate</label>
                <span class="text-xs">{{ speechRate.toFixed(1) }}</span>
    </div>
              <Slider
                v-model="speechRate" 
                :min="0.5" 
                :max="2" 
                :step="0.1" 
                @update:modelValue="updateSpeechRate" 
              />
              <div class="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slow</span>
                <span>Fast</span>
  </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSpeechRecognition } from '~/composables/useSpeechRecognition'
import { useSpeechSynthesis } from '~/composables/useSpeechSynthesis'
import { useMotion } from '@vueuse/motion'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '~/components/ui/collapsible'
import { Button } from '~/components/ui/button'
import { Slider } from '~/components/ui/slider'

// Initialize speech recognition
const { 
  isSupported: recognitionSupported,
  isListening, 
  transcript: finalTranscript, 
  interimTranscript,
  startListening, 
  stopListening 
} = useSpeechRecognition({
  continuous: true,
  interimResults: true,
  lang: 'en-US' // Use English language
})

// Initialize speech synthesis
const {
  isSupported: synthesisSupported,
  isSpeaking,
  speak,
  setRate
} = useSpeechSynthesis({
  lang: 'en-US', // Use English voice
  rate: 1.0
})

// State variables
const audioLevel = ref(0.5) // Simulated audio level
const showSettings = ref(false)
const speechRate = ref(1.0)

// Computed properties
const displayText = computed(() => {
  if (isListening.value) {
    return finalTranscript.value + interimTranscript.value
  }
  return finalTranscript.value
})

const buttonVariant = computed(() => {
  if (isListening.value) {
    return "destructive"
  } else if (isSpeaking.value) {
    return "secondary"
  } else {
    return "default"
  }
})

// Watch for listening state changes
watch(isListening, (newValue) => {
  if (newValue) {
    simulateAudioLevels()
  }
})

// Toggle listening state
function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

// Send transcript
function sendTranscript() {
  if (!finalTranscript.value) return
  
  // Send transcript to parent component
  emit('send', finalTranscript.value)
  
  // Clear current transcript
  finalTranscript.value = ''
}

// Update speech rate
function updateSpeechRate() {
  setRate(speechRate.value)
}

// Simulate audio levels for visualization
function simulateAudioLevels() {
  if (!isListening.value) return
  
  audioLevel.value = 0.2 + Math.random() * 0.8
  setTimeout(simulateAudioLevels, 150)
}

// Auto-send detection when user stops talking
let autoSendTimer: number | null = null

watch(isListening, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    // When recording stops, if there's content then schedule auto-send
    if (finalTranscript.value.trim()) {
      autoSendTimer = window.setTimeout(() => {
        sendTranscript()
      }, 1000) // Auto-send after 1 second
    }
  }
})

// Define component events
const emit = defineEmits(['send'])
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(0.8);
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}
</style>