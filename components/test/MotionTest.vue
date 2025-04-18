<template>
  <div class="motion-test-container">
    <h2>Motion One 测试</h2>
    
    <div 
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0 }"
      :variants="{ hover: { scale: 1.1 } }"
      :hovered="{ scale: 1.2 }"
      class="motion-box"
    >
      悬停在我上面试试
    </div>

    <div 
      v-motion
      :initial="{ opacity: 0, x: -100 }"
      :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
      class="motion-box motion-box-2"
    >
      我有延迟动画
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需额外导入，@vueuse/motion/nuxt 已经全局注册了 v-motion 指令
</script>

<style scoped>
.motion-test-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.motion-box {
  width: 200px;
  height: 200px;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}

.motion-box-2 {
  background-color: #10b981;
}
</style>