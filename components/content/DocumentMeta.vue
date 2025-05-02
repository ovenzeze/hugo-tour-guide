<template>
  <div v-if="document" class="flex flex-wrap items-center text-sm gap-5">
    <!-- Author (if available) -->
    <div v-if="document.meta?.author || document.author" class="flex items-center text-gray-700 dark:text-gray-300">
      <User class="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
      <span class="font-medium">{{ document.meta?.author || document.author }}</span>
    </div>
    
    <!-- Last updated -->
    <div class="flex items-center text-gray-700 dark:text-gray-300">
      <Clock class="w-5 h-5 mr-2 text-green-400 dark:text-green-400" />
      <span>
        <span class="text-gray-500 dark:text-gray-400 mr-1">Updated:</span>
        <span class="font-medium">{{ formatDate(document.meta?.updatedAt || document.updatedAt || document.meta?.date || document.date || new Date()) }}</span>
      </span>
    </div>
    
    <!-- Reading time -->
    <div class="flex items-center text-gray-700 dark:text-gray-300">
      <BookOpen class="w-5 h-5 mr-2 text-purple-400 dark:text-purple-400" />
      <span>
        <span class="font-medium">{{ calculateReadingTime(document) }}</span>
        <span class="text-gray-500 dark:text-gray-400 ml-1">min read</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { User, Clock, BookOpen } from 'lucide-vue-next'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

/**
 * Format date to localized format
 */
const formatDate = (date) => {
  if (!date) return 'Unknown date'
  
  try {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' }
    return new Date(date).toLocaleDateString('en', options)
  } catch (e) {
    console.error('Date formatting error:', e)
    return 'Unknown date'
  }
}

/**
 * Calculate estimated reading time (approx. 200 words per minute)
 */
const calculateReadingTime = (doc) => {
  if (!doc || !doc.body) return 1
  
  try {
    // Extract text content
    const text = extractTextFromBody(doc.body)
    const wordCount = String(text).trim().split(/\s+/).length
    
    // Average reading speed is about 200 words per minute
    return Math.max(1, Math.ceil(wordCount / 200))
  } catch (e) {
    console.error('Reading time calculation error:', e)
    return 1 // Default minimum of 1 minute
  }
}

/**
 * Recursively extract text content from document body
 */
const extractTextFromBody = (node) => {
  if (!node) return ''
  
  // Text node
  if (typeof node === 'string') return node
  
  // Node with value property
  if (node.value) return node.value
  
  // Array handling
  if (Array.isArray(node)) {
    return node.map(extractTextFromBody).join(' ')
  }
  
  // Node with children
  if (node.children) {
    return extractTextFromBody(node.children)
  }
  
  return ''
}
</script>

<style scoped>
/* Add hover effects for metadata items */
.flex > div {
  transition: transform 0.2s ease;
}

.flex > div:hover {
  transform: translateY(-2px);
}
</style> 