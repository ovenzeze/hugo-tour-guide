<template>
  <div class="container mx-auto py-8 px-4">
    <!-- 直接使用 ContentDoc 组件而不是 ContentRenderer -->
    <ContentDoc class="prose prose-lg max-w-none" />
  </div>
</template>

<script setup lang="ts">
// 无需复杂的查询逻辑，ContentDoc 会自动处理
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