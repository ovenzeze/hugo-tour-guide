<template>
  <div class="document-helper">
    <!-- Action buttons area -->
    <div class="flex flex-wrap items-center gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
      <!-- Edit document button (if GitHub repo link is provided) -->
      <a
        v-if="githubEditLink"
        :href="githubEditLink"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Edit class="w-4 h-4 mr-1" />
        Edit this document
      </a>

      <!-- Back to index button -->
      <NuxtLink
        :to="indexPath"
        class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back to index
      </NuxtLink>

      <!-- Report issue button -->
      <a
        v-if="githubIssueLink"
        :href="githubIssueLink"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Bug class="w-4 h-4 mr-1" />
        Report issue
      </a>
    </div>

    <!-- Last updated info -->
    <div v-if="showUpdatedInfo && (document.meta?.updatedAt || document.updatedAt)" class="text-xs text-gray-500 mt-4">
      Last updated: {{ formatDate(document.meta?.updatedAt || document.updatedAt) }}
    </div>

    <!-- Copyright and license info -->
    <div v-if="showCopyright" class="text-xs text-gray-500 mt-2">
      © {{ new Date().getFullYear() }} Hugo Tour Guide. All rights reserved.
    </div>
  </div>
</template>

<script setup>
import { Edit, ArrowLeft, Bug } from 'lucide-vue-next'

const props = defineProps({
  document: {
    type: Object,
    default: () => ({})
  },
  // GitHub repository info
  githubRepo: {
    type: String,
    default: ''
  },
  githubBranch: {
    type: String,
    default: 'main'
  },
  // Document path
  indexPath: {
    type: String,
    default: '/docs'
  },
  // Display controls
  showUpdatedInfo: {
    type: Boolean,
    default: true
  },
  showCopyright: {
    type: Boolean,
    default: true
  }
})

// Calculate GitHub edit link
const githubEditLink = computed(() => {
  if (!props.githubRepo || !props.document._path) return null
  
  const docPath = props.document._path.replace(/^\/docs\//, '')
  return `https://github.com/${props.githubRepo}/edit/${props.githubBranch}/content/docs/${docPath}.md`
})

// Calculate GitHub issue link
const githubIssueLink = computed(() => {
  if (!props.githubRepo) return null
  
  const title = encodeURIComponent(`Document feedback: ${props.document.title || props.document._path}`)
  const body = encodeURIComponent(`Document path: ${props.document._path}\n\n## Issue description\n\n`)
  
  return `https://github.com/${props.githubRepo}/issues/new?title=${title}&body=${body}`
})

// Format date
const formatDate = (date) => {
  if (!date) return ''
  
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(date).toLocaleDateString('en', options)
  } catch (e) {
    return ''
  }
}
</script>

<style scoped>
.document-helper {
  margin-top: 3rem;
}
</style> 