<!-- 
  自定义ProseScript组件，以安全方式处理MD文档中的脚本元素
  这个组件会把脚本内容作为代码块显示，而不是尝试执行它
-->
<template>
  <div class="prose-script-container">
    <div class="prose-script-header">
      <span>SQL</span>
    </div>
    <pre class="prose-script-content">
      <code>{{ value }}</code>
    </pre>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.prose-script-container {
  margin-bottom: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.prose-script-header {
  background-color: #f3f4f6;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #4b5563;
  font-family: monospace;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.prose-script-content {
  background-color: #f8f9fa;
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  white-space: pre-wrap;
}
</style> 