<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">AI Tour Guide - Home</h1>
    <p class="mb-4">Welcome to the AI Tour Guide, your personalized museum experience assistant.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink to="/guide" class="p-4 border rounded-lg hover:bg-gray-100">
        <h2 class="text-xl font-semibold">AI Guide Introduction</h2>
        <p>Meet your AI guide Lisa Ghimire</p>
      </NuxtLink>
      <NuxtLink to="/preference" class="p-4 border rounded-lg hover:bg-gray-100">
        <h2 class="text-xl font-semibold">Preferences</h2>
        <p>Set your visit preferences</p>
      </NuxtLink>
      <NuxtLink to="/tour" class="p-4 border rounded-lg hover:bg-gray-100">
        <h2 class="text-xl font-semibold">Exhibit Navigation</h2>
        <p>Explore museum exhibits</p>
      </NuxtLink>
      <NuxtLink to="/chat" class="p-4 border rounded-lg hover:bg-gray-100">
        <h2 class="text-xl font-semibold">Voice Interaction</h2>
        <p>Chat with your AI guide</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page logic will be implemented here
</script>