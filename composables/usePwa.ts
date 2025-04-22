import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 检测应用是否以PWA模式运行（从主屏幕启动）
 * 
 * @returns {Object} 包含isPwa的响应式引用和更新函数
 */
export function usePwa() {
  const isPwa = ref(false)

  // 初始检测函数
  const checkPwaStatus = () => {
    // iOS Safari 专用属性
    if (typeof window !== 'undefined' && window.navigator) {
      if ('standalone' in window.navigator) {
        isPwa.value = window.navigator.standalone === true
      } else if (window.matchMedia) {
        // 其他浏览器使用 matchMedia API
        isPwa.value = window.matchMedia('(display-mode: standalone)').matches ||
                      window.matchMedia('(display-mode: fullscreen)').matches
      }
    }
  }

  // 监听显示模式变化的函数
  const displayModeHandler = (evt: MediaQueryListEvent) => {
    isPwa.value = evt.matches
  }

  onMounted(() => {
    checkPwaStatus()

    // 添加 display-mode 变化的监听器
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      mediaQuery.addEventListener('change', displayModeHandler)
    }
  })

  onUnmounted(() => {
    // 移除监听器，避免内存泄漏
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      mediaQuery.removeEventListener('change', displayModeHandler)
    }
  })

  return {
    isPwa,
    checkPwaStatus
  }
} 