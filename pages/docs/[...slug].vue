<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col lg:flex-row lg:gap-8">

      <!-- Table of Contents - Desktop Sidebar (Hidden on small screens) -->
      <aside class="hidden lg:block lg:w-64 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pr-4 text-md">
        <TableOfContents v-if="tocLinks.length > 0" :links="tocLinks" :active-id="activeHeadingId" />
        <p v-else class="text-sm text-muted-foreground">No contents available</p>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 overflow-auto"> 
        <!-- Mobile TOC Trigger Button (Visible only on small screens) -->
        <div class="lg:hidden mb-4">
          <Sheet v-model:open="isSheetOpen">
            <SheetTrigger as-child>
              <Button variant="outline" size="sm">
                <Menu class="w-4 h-4 mr-2" />
                Contents
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72 sm:w-80">
              <SheetHeader class="mb-4">
                <SheetTitle>Contents</SheetTitle>
              </SheetHeader>
              <TableOfContents v-if="tocLinks.length > 0" :links="tocLinks" :active-id="activeHeadingId" @link-click="closeSheet" />
              <p v-else class="text-sm text-muted-foreground">No contents available</p>
            </SheetContent>
          </Sheet>
        </div>

        <!-- Render Markdown Content -->
        <div class="prose prose-preserve-whitespace max-w-none dark:prose-invert"> 
          <!-- Loading State -->
          <div v-if="pending" class="text-center py-12 text-muted-foreground">Loading document...</div>
          <!-- Error State -->
          <div v-else-if="error || !data || !data.body" class="text-center py-12 text-red-500">
            Failed to load document or document not found
          </div>
          <!-- Content Renderer -->
          <MDCRenderer v-else :body="data.body" :data="data.data" /> 
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import TableOfContents from '~/components/content/TableOfContents.vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-vue-next'

definePageMeta({
  layout: 'fullscreen'
})
// Get slug from route parameters
const route = useRoute()
const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug.join('/')
    : route.params.slug || 'tour-functionality'
})

// Use useAsyncData to fetch Markdown content
const { data, pending, error } = await useAsyncData(
  `markdown-${slug.value}`,
  () => $fetch(`/api/content/${slug.value}`),
  {
    default: () => ({ body: null, toc: { links: [] }, data: {} }),
    watch: [slug]
  }
)

// Extract TOC links (ensure reactivity and handle potential null/undefined)
const tocLinks = computed(() => {
  if (!data.value || !data.value.toc || !data.value.toc.links) {
    return []
  }
  return data.value.toc.links
})

// Set page metadata
useHead({
  title: computed(() => {
    const titleFromData = data.value?.data?.title
    const baseTitle = titleFromData ? titleFromData : (slug.value.charAt(0).toUpperCase() + slug.value.slice(1).replace(/-/g, ' '))
    return `${baseTitle} - Documentation`
  }),
  meta: [
    { name: 'description', content: computed(() => data.value?.data?.description || 'Documentation page') }
  ]
})

// Handle fetch errors
if (error.value) {
  console.error("Error fetching document:", error.value)
}

// --- Active Heading Highlight (Required for TOC) ---
const activeHeadingId = ref(null)
let observer = null

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    const callback = (entries) => {
      const intersectingHeadings = entries
        .filter(e => e.isIntersecting && e.target.id)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)
      
      if (intersectingHeadings.length > 0) {
        activeHeadingId.value = intersectingHeadings[0].target.id
      }
    }

    observer = new IntersectionObserver(callback, {
      rootMargin: '0px 0px -80% 0px',
      threshold: 0.1
    })

    watch(() => data.value, (newData) => {
      if (newData && newData.body) {
        if (observer) observer.disconnect() 
        
        nextTick(() => {
          const contentElement = document.querySelector('.prose')
          if (contentElement) {
            const headings = contentElement.querySelectorAll('h2[id], h3[id], h4[id]')
            headings.forEach(heading => observer.observe(heading))
          }
        })
      }
    }, { immediate: true })
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
// --- End of Active Heading Highlight ---

// Control mobile contents drawer state
const isSheetOpen = ref(false) 

// Close drawer when clicking a link
const closeSheet = () => {
  isSheetOpen.value = false
}
</script>

<style scoped>
aside {
  scrollbar-width: thin;
}
aside::-webkit-scrollbar {
  width: 6px;
}
aside::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 3px;
}
</style>

<style>
/* Preserve line breaks in Markdown */
.prose-preserve-whitespace p {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Ensure proper table content display */
.prose-preserve-whitespace table p {
  white-space: normal;
}
</style>
