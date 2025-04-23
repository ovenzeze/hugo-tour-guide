<template>
  <div class="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent pt-3 pb-8 px-4 flex justify-between items-start">
    <!-- 返回按钮 -->
    <button 
      class="w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors border border-white/10 flex-shrink-0"
      @click="$emit('back')"
      aria-label="返回"
    >
      <icon name="ph:arrow-left" size="20" />
    </button>

    <!-- 博物馆名称 -->
    <Transition appear name="fade-down">
      <div 
        class="h-10 px-4 py-2 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full shadow-md border border-white/10 flex items-center gap-1.5 max-w-sm mx-auto"
      >
        <icon name="ph:map-pin" size="16" class="flex-shrink-0" />
        <span class="whitespace-nowrap overflow-hidden text-ellipsis font-medium">{{ museumName }}</span>
      </div>
    </Transition>

    <!-- 占位符，保持标题居中 -->
    <div class="w-10 h-10 flex-shrink-0"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  museumName: string;
}>();

defineEmits(['back']);
</script>

<style scoped>
/* 入场动画 */
.fade-down-enter-active {
  transition: all 0.5s ease-out;
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
</style> 