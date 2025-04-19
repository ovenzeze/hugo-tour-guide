<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-4">Page Meta Test Page</h1>
    
    <div class="space-y-6">
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-2">Current Page Title</h2>
        <p>Current page title should display as: "Title Set Using definePageMeta"</p>
      </div>
      
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-2">Test Other Pages</h2>
        <div class="flex flex-col space-y-2">
          <NuxtLink to="/" class="text-blue-600 hover:underline">Home (Default Title)</NuxtLink>
          <NuxtLink to="/docs/project-structure" class="text-blue-600 hover:underline">Documentation Page (Using useSeoMeta)</NuxtLink>
          <NuxtLink to="/meta-test" class="text-blue-600 hover:underline">Test Page (Using useHead)</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page title using definePageMeta
definePageMeta({
  title: 'Title Set Using definePageMeta'
})
</script>