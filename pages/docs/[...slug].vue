<template>
  <div class="container mx-auto py-8 px-4 prose">
    <MDC v-if="data" :value="data" />
    <div v-else class="text-center py-12 text-muted-foreground">Document not found</div>
  </div>
</template>
  
<script setup>
// Get slug from route parameters
const route = useRoute()
const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug.join('/')
    : route.params.slug || 'tour-functionality'
})

// Fetch Markdown content using useAsyncData
const { data } = await useAsyncData(
  `markdown-${slug.value}`,
  () => $fetch(`/api/content/${slug.value}`),
  {
    default: () => null
  }
)

// Set page metadata
useHead({
  title: `${slug.value.charAt(0).toUpperCase() + slug.value.slice(1).replace(/-/g, ' ')}`,
  meta: [ { name: 'description', content:'' }]
})
</script>

<style scoped>
.prose {
  max-width: 65ch;
  margin: 0 auto;
}

.prose :deep(h1) {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.prose :deep(h2) {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose :deep(p) {
  margin-bottom: 1rem;
}

.prose :deep(ul), .prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.25rem;
}

.prose :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.prose :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
</style>
