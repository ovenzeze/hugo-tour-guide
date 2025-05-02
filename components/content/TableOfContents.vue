<template>
  <nav v-if="links && links.length > 0">
    <ul class="space-y-1">
      <li v-for="link in links" :key="link.id">
        <a 
          :href="`#${link.id}`" 
          class="block text-sm py-1 transition-colors duration-150 hover:text-primary"
          :class="{
            'text-primary font-medium': activeId === link.id,
            'text-muted-foreground': activeId !== link.id,
            'pl-0': link.depth === 2,
            'pl-3': link.depth === 3,
            'pl-6': link.depth === 4,
          }"
          @click="handleLinkClick($event, link.id)"
        >
          {{ link.text }}
        </a>
        <!-- Recursive rendering for children -->
        <TableOfContents 
          v-if="link.children && link.children.length > 0" 
          :links="link.children" 
          :active-id="activeId" 
          @link-click="(event, childId) => emit('link-click', event, childId)" />
      </li>
    </ul>
  </nav>
</template>

<script setup>
// No need for async component import for recursion in <script setup>
// Define props and emits directly inside <script setup>
const props = defineProps({
  links: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['link-click'])

const handleLinkClick = (event, id) => {
  if (!id) return; // 如果ID为空，直接返回
  
  event.preventDefault() // 阻止默认锚点行为

  // 使用ID查找元素
  const element = document.getElementById(id)
  
  if (element) {
    // 计算滚动位置，考虑头部固定导航栏的高度
    const yOffset = -80; // 固定导航栏高度的偏移量
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    
    // 平滑滚动到目标位置
    window.scrollTo({ 
      top: y, 
      behavior: 'smooth' 
    });
    
    // 更新URL哈希值但不触发默认滚动
    history.pushState(null, null, `#${id}`);
    
    // 触发事件（例如关闭移动端的抽屉菜单）
    emit('link-click', event, id)
  } else {
    console.warn(`Could not find element with ID: ${id}`);
  }
}

// Removed internal activeId management and scroll listeners.
// Active state is now fully controlled by the parent component via the activeId prop.

</script>

<style scoped>
/* Styles remain the same */
</style> 