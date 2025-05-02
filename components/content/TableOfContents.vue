<template>
  <nav v-if="links && links.length > 0" class="toc-nav">
    <ul class="space-y-2">
      <li v-for="link in links" :key="link.id" class="toc-item">
        <a 
          :href="`#${link.id}`" 
          class="block text-sm py-1.5 px-2 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/40"
          :class="{
            'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-300': activeId === link.id,
            'text-gray-700 dark:text-gray-300': activeId !== link.id,
            'border-l-2 border-blue-500 dark:border-blue-400 pl-3': activeId === link.id,
            'border-l-2 border-transparent pl-3': activeId !== link.id,
          }"
          @click="handleLinkClick($event, link.id)"
        >
          {{ link.text }}
        </a>
        
        <!-- Child items -->
        <ul v-if="link.children && link.children.length > 0" class="mt-1 ml-3 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1">
          <li v-for="child in link.children" :key="child.id" class="toc-subitem">
            <a 
              :href="`#${child.id}`" 
              class="block text-sm py-1 px-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/40 rounded"
              :class="{
                'text-blue-600 font-medium dark:text-blue-300': activeId === child.id,
                'text-gray-600 dark:text-gray-400': activeId !== child.id,
              }"
              @click="handleLinkClick($event, child.id)"
            >
              {{ child.text }}
            </a>
            
            <!-- Third level headings -->
            <ul v-if="child.children && child.children.length > 0" class="mt-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1">
              <li v-for="grandchild in child.children" :key="grandchild.id" class="toc-subsubitem">
                <a 
                  :href="`#${grandchild.id}`" 
                  class="block text-xs py-1 px-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/40 rounded"
                  :class="{
                    'text-blue-600 font-medium dark:text-blue-300': activeId === grandchild.id,
                    'text-gray-500 dark:text-gray-500': activeId !== grandchild.id,
                  }"
                  @click="handleLinkClick($event, grandchild.id)"
                >
                  {{ grandchild.text }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Define props and emits
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
  if (!id) return; // Return if ID is empty
  
  event.preventDefault() // Prevent default anchor behavior

  // Find element by ID
  const element = document.getElementById(id)
  
  if (element) {
    // Calculate scroll position, accounting for fixed header height
    const yOffset = -80; // Offset for fixed navbar height
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    
    // 使用更加平滑的滚动效果
    window.scrollTo({
      top: y,
      behavior: 'smooth',
      // 减少过度滚动
      scrollOptions: {
        easing: 'ease-out',
        duration: 500
      }
    });
    
    // Update URL hash without triggering default scroll
    history.pushState(null, null, `#${id}`);
    
    // Emit event (e.g., to close mobile drawer menu)
    emit('link-click', event, id)
  } else {
    console.warn(`Could not find element with ID: ${id}`);
  }
}
</script>

<style scoped>
.toc-nav {
  position: relative;
  width: 100%;
}

.toc-item {
  position: relative;
  margin-bottom: 1rem;
}

.toc-item > a {
  position: relative;
  font-weight: 500;
}

.toc-subitem > a {
  position: relative;
  font-size: 0.875rem;
}

.toc-subsubitem > a {
  position: relative;
  font-size: 0.8125rem;
}

/* Highlight for active link */
a.active-link {
  background-color: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
  font-weight: 500;
  border-left: 2px solid rgb(59, 130, 246);
}

/* Animation for links */
a {
  transition: all 0.2s ease-out;
}

a:hover {
  transform: translateX(2px);
}

/* Scrollbar styling - 保留细滚动条 */
:deep(.toc-content::-webkit-scrollbar) {
  width: 3px;
}

:deep(.toc-content::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.toc-content::-webkit-scrollbar-thumb) {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 6px;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  :deep(.toc-content::-webkit-scrollbar-thumb) {
    background-color: rgba(156, 163, 175, 0.3);
  }
}
</style> 