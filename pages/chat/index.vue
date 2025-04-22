<template>
  <div class="flex flex-col h-[calc(100dvh-theme(spacing.16)-theme(spacing.1))] relative bg-background font-sans">
    <!-- Chat Header (Simplified) -->
    <!-- The main app header already provides context -->
    
    <!-- Chat Messages Area -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
      <TransitionGroup name="chat" tag="div" class="space-y-3">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="flex"
          :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- AI Avatar -->
          <div v-if="msg.sender === 'ai'" class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <span class="text-blue-600 text-xs font-bold">AI</span>
          </div>
          
          <!-- Message Bubble -->
          <div 
            class="max-w-[80%] rounded-lg px-3 py-2 shadow-sm break-words text-sm" 
            :class="msg.sender === 'user' 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-900 rounded-bl-none'" 
          >
            <p>{{ msg.content }}</p> 
            <div class="text-xs mt-1 opacity-60 text-right" :class="msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'">
              {{ formatTimestamp(msg.timestamp) }}
            </div>
          </div>
        </div>
      </TransitionGroup>
      <!-- AI Typing Indicator -->
      <div v-if="isAiTyping" class="flex justify-start items-center transition-opacity duration-300 pt-1">
         <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <span class="text-blue-600 text-xs font-bold">AI</span>
          </div>
        <div class="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 shadow-sm rounded-bl-none">
          <span class="typing-indicator">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      </div>
    </div>
  
    <!-- Input Area -->
    <div class="bg-background border-t border-border px-3 py-2 sticky bottom-0">
      <div class="flex items-center space-x-2">
        <!-- Text Input -->
        <input 
          type="text" 
          v-model="userInput"
          placeholder="Type your message..."
          class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-sm h-10"
          @keyup.enter="sendMessage"
        />
        <!-- Voice Input Button -->
        <button 
          @click="toggleListening"
          class="w-10 h-10 flex items-center justify-center rounded-full transition-colors text-gray-600 hover:bg-gray-100"
          :class="{ 'bg-red-100 !text-red-600 hover:bg-red-200': isListening }" 
          title="Voice Input"
        >
          <Icon :name="isListening ? 'ph:stop' : 'ph:microphone'" class="w-5 h-5" />
        </button>
        <!-- Send Button -->
        <button 
          @click="sendMessage" 
          :disabled="!userInput.trim()"
          class="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex-shrink-0"
          title="Send"
        >
          <Icon name="ph:paper-plane-right" class="w-5 h-5" />
        </button>
      </div>
       <!-- Display recognized speech (optional) -->
      <div v-if="transcript && isListening" class="text-xs text-gray-500 pt-1 pl-2 h-4">
        {{ transcript }}...
      </div>
       <div v-else class="h-4 pt-1"></div> <!-- Placeholder to prevent layout shift -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useSpeechSynthesis } from '~/composables/useSpeechSynthesis'
import { useSpeechRecognition } from '~/composables/useSpeechRecognition'

// Define page meta
definePageMeta({
  title: 'Chat with Guide'
})

// Define message type
interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// State
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isAiTyping = ref(false)
const messageContainer = ref<HTMLElement | null>(null)

// Composables
const { speak, isSpeaking: isSynthesizing } = useSpeechSynthesis({ lang: 'zh-CN', rate: 1.0 })
const { 
  startListening, 
  stopListening, 
  isListening, 
  transcript, 
  interimTranscript, // Use interim for live feedback
  error: recognitionError 
} = useSpeechRecognition({ 
  lang: 'zh-CN', 
  continuous: true, // Keep listening 
  interimResults: true // Get live results
})

// --- Lifecycle and Watchers ---
onMounted(() => {
  // Initial welcome message
  if (messages.value.length === 0) {
    isAiTyping.value = true;
    setTimeout(() => {
      const welcomeMessage = "你好！我是你的AI语音助手。你可以通过语音与我交流，或者直接发送文字消息。有什么我可以帮助你的吗？"
      addMessage('ai', welcomeMessage)
      isAiTyping.value = false;
    }, 1200) 
  }
  scrollToBottom();
})

// Scroll to bottom when messages change
watch(messages, async () => {
  await nextTick() 
  scrollToBottom()
}, { deep: true })

// Watch for final transcript when listening stops
watch(transcript, (finalTranscript) => {
    if (finalTranscript && !isListening.value) { // Process final transcript only when listening stops
        userInput.value = finalTranscript; 
        sendMessage(); 
    }
});

// --- Methods ---

// Add message to list
function addMessage(sender: 'user' | 'ai', content: string) {
  messages.value.push({
    id: Date.now(), 
    sender,
    content,
    timestamp: new Date()
  })
}

// Send user message
async function sendMessage() {
  const messageContent = userInput.value.trim()
  if (!messageContent || isSynthesizing.value) return // Prevent sending empty or while AI is speaking

  addMessage('user', messageContent)
  const currentInput = userInput.value // Store before clearing
  userInput.value = '' 
  
  // Stop listening if user sends text manually
  if (isListening.value) {
    stopListening()
  }

  isAiTyping.value = true
  setTimeout(async () => {
    const aiResponse = generateResponse(currentInput) // Use stored input
    addMessage('ai', aiResponse)
    isAiTyping.value = false
    
    // Optional: Speak AI response
    // await speak(aiResponse).catch(err => console.error("Error speaking response:", err));
  }, 1500 + Math.random() * 1000) 
}

// Toggle voice listening state
function toggleListening() {
  if (isListening.value) {
    stopListening() 
    // Transcript watcher will handle sending the message
  } else {
    userInput.value = '' // Clear text input when starting voice
    startListening()
  }
}

// Scroll message container to the bottom
function scrollToBottom() {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// Format timestamp for display
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false })
}

// Mock AI response generation
function generateResponse(query: string): string {
  query = query.toLowerCase(); 
  if (query.includes('你好') || query.includes('您好')) {
    return '你好！很高兴和你交流。我可以帮助你回答问题或者提供展品信息。'
  }
  if (query.includes('名字') || query.includes('谁')) {
    return '我是博物馆的AI语音助手，可以为您提供展品信息和参观指南。'
  }
  if (query.includes('展品') || query.includes('藏品')) {
    return '我们博物馆有众多精彩展品，包括古埃及文物、欧洲艺术品、亚洲艺术收藏等。您对哪个展区比较感兴趣呢？'
  }
  if (query.includes('时间') || query.includes('开放')) {
    return '博物馆每天上午9点至下午5点开放，周一闭馆。特别展览可能有不同的开放时间。'
  }
  return `关于"${query}"，我正在学习相关知识。您可以问我一些关于常见展品或开放时间的问题。`
}

// Optional: Clear chat function (removed from template for simplicity, can be added back)
// function clearChat() { ... }

</script>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

.chat-enter-active,
.chat-leave-active {
  transition: all 0.3s ease-out;
}
.chat-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.chat-leave-to {
  opacity: 0;
}

/* Typing Indicator Animation */
.typing-indicator span {
  display: inline-block;
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  margin: 0 1px;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>