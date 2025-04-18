<template>
  <div>
    <h1>动画测试</h1>
    <div 
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0 }"
      class="bg-blue-500 text-white p-4 rounded"
    >
      这个元素应该有动画效果
    </div>
  </div>
</template>