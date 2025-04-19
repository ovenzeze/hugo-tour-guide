<template>
    <div class="container mx-auto py-8 px-4 prose">
      <ContentRenderer v-if="md" :value="md" />
      <div v-else class="text-center py-12 text-muted-foreground">page not found</div>
    </div>
  </template>
  
  <script setup lang="ts">
  const { data: page } = await useAsyncData(() => queryCollection('content').first())
  // console.log('page', page);
  const md = page.value
  useSeoMeta({
    title: page.value?.title,
    description: page.value?.description
  })
  </script>

