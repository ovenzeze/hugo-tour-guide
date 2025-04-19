<template>
  <div class="container mx-auto py-8 px-4 prose">
    <ContentRenderer v-if="md" :value="md" />
    <div v-else class="text-center py-12 text-muted-foreground">
      No documentation found for "{{ slug.join('/') }}". Please check the path or create this document.
    </div>
  </div>
</template>

<script setup lang="ts">
// Get current route parameters
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]

// Construct potential file paths
const filePath = slug.join('/')

// Try to find the document in the content directory with case-insensitive matching
const { data: md } = await useAsyncData(`content-${filePath}`, async () => {
  // First try exact path match
  const doc = await queryContent().where({ _path: `/${filePath}` }).findOne().catch(() => null)
  if (doc) return doc
  
  // If not found, try case-insensitive match
  return await queryContent().find().then(results => {
    // Filter results to find case-insensitive match
    return results.find(item => 
      item._path && item._path.toLowerCase() === `/${filePath.toLowerCase()}`
    ) || null
  })
})

// Set SEO metadata if page exists
if (md.value) {
  useSeoMeta({
    title: ((md.value as any).title as string) || `Documentation: ${filePath}`,
    description: ((md.value as any).description as string) || `Documentation page for ${filePath}`
  })
}
</script>

