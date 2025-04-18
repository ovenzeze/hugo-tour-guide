<template>
  <div class="container mx-auto py-8 px-4">
    <ContentRenderer v-if="data" :value="data" class="prose prose-lg max-w-none" />
    <div v-else class="py-10 text-center">
      <p class="text-lg text-gray-600">加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { path } = useRoute()
const { data } = await useAsyncData(`content-${path}`, () => {
  return queryContent().where({ _path: path }).findOne()
})
</script>

<style scoped>
.prose {
  max-width: 65ch;
  margin: 0 auto;
}
.prose h1 {
  color: #2563eb;
  margin-bottom: 1.5rem;
}
.prose h2 {
  color: #1e40af;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.prose h3 {
  margin-top: 1.5rem;
  color: #374151;
}
.prose strong {
  color: #111827;
}
.prose ul {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>