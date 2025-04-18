// Chat store for managing chat history and interaction state
// Note: This is a placeholder implementation

import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { ChatMessage } from '~/types'
import { sendChatMessage } from '~/utils/api'
import { generateId } from '~/utils/helpers'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const isProcessing = ref(false)
  const isListening = ref(false)
  const transcript = ref('')
  
  // Initial welcome message
  if (import.meta.client) {
    // Only add welcome message on client-side to avoid hydration issues
    onMounted(() => {
      if (messages.value.length === 0) {
        messages.value.push({
          id: generateId(),
          sender: 'ai',
          content: 'Hello! I\'m Lisa, your AI museum guide. How can I help you today?',
          timestamp: new Date()
        })
      }
    })
  }
  
  // Getters
  const messageCount = computed(() => messages.value.length)
  
  const lastMessage = computed(() => {
    if (messages.value.length === 0) return null
    return messages.value[messages.value.length - 1]
  })
  
  // Actions
  function initialize() {
    // Only add welcome message if chat is empty
    if (messages.value.length === 0) {
      messages.value.push({
        id: generateId(),
        sender: 'ai',
        content: 'Hello! I\'m Lisa, your AI museum guide. How can I help you today?',
        timestamp: new Date()
      })
    }
  }
  
  async function sendMessage(content: string) {
    if (!content.trim()) return
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      content: content.trim(),
      timestamp: new Date()
    }
    
    messages.value.push(userMessage)
    
    // Process AI response
    isProcessing.value = true
    
    try {
      const response = await sendChatMessage(content)
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: generateId(),
        sender: 'ai',
        content: response,
        timestamp: new Date()
      }
      
      messages.value.push(aiMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      messages.value.push({
        id: generateId(),
        sender: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      })
    } finally {
      isProcessing.value = false
    }
  }
  
  function startListening() {
    isListening.value = true
    transcript.value = ''
    // In a real implementation, this would initialize speech recognition
  }
  
  function stopListening() {
    isListening.value = false
    // In a real implementation, this would stop speech recognition
    // and process the final transcript
    if (transcript.value) {
      sendMessage(transcript.value)
      transcript.value = ''
    }
  }
  
  function clearChat() {
    messages.value = []
    
    // Add welcome message back
    messages.value.push({
      id: generateId(),
      sender: 'ai',
      content: 'Hello! I\'m Lisa, your AI museum guide. How can I help you today?',
      timestamp: new Date()
    })
  }
  
  return {
    // State
    messages,
    isProcessing,
    isListening,
    transcript,
    
    // Getters
    messageCount,
    lastMessage,
    
    // Actions
    sendMessage,
    startListening,
    stopListening,
    clearChat,
    initialize
  }
})