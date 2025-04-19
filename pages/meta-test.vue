<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-4">Meta 测试页面</h1>
    
    <div class="space-y-6">
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-2">当前页面标题</h2>
        <p>当前页面标题应该显示为: "Meta 测试页面 | 自定义标题"</p>
      </div>
      
      <div class="p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-2">测试其他页面</h2>
        <div class="flex flex-col space-y-2">
          <NuxtLink to="/" class="text-blue-600 hover:underline">首页 (默认标题)</NuxtLink>
          <NuxtLink to="/docs/project-structure" class="text-blue-600 hover:underline">文档页面 (使用 useSeoMeta)</NuxtLink>
          <NuxtLink to="/meta-test-page-meta" class="text-blue-600 hover:underline">测试页面 (使用 definePageMeta)</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用 useHead 设置页面标题
useHead({
  title: 'Meta 测试页面 | 自定义标题',
  meta: [
    { name: 'description', content: '这是一个测试页面，用于测试动态header组件' }
  ]
})
</script>