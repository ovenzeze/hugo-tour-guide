<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-8 text-center">Motion One 测试页面</h1>
    
    <!-- 引入我们的测试组件 -->
    <MotionTest />
    
    <!-- 额外的动画测试元素 -->
    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="(item, index) in items"
        :key="index"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
        class="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 class="text-xl font-semibold mb-2">{{ item.title }}</h3>
        <p class="text-gray-600">{{ item.description }}</p>
      </div>
    </div>
    
    <!-- 返回首页链接 -->
    <div class="mt-10 text-center">
      <NuxtLink to="/" class="text-blue-500 hover:underline">返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import MotionTest from '~/components/test/MotionTest.vue'

// 测试数据
const items = [
  {
    title: '顺序动画 1',
    description: '这些卡片会按顺序淡入，展示 Motion One 的延迟动画功能'
  },
  {
    title: '顺序动画 2',
    description: '每个元素的动画延迟时间不同，创造出流畅的序列效果'
  },
  {
    title: '顺序动画 3',
    description: '使用 v-motion 指令可以轻松实现各种复杂的动画效果'
  }
]
</script>