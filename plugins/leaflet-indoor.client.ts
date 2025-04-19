// 仅在客户端运行的插件，用于加载leaflet-indoor
import 'leaflet/dist/leaflet.css'
import 'leaflet-indoor'
import { defineNuxtPlugin } from '#app'

// 使用defineNuxtPlugin包装插件，这是Nuxt 3推荐的方式
export default defineNuxtPlugin((nuxtApp) => {
  console.log('leaflet-indoor plugin loaded')
  
  // 确保Leaflet控件在客户端可用
  if (process.client && window.L) {
    console.log('Leaflet is available, Indoor plugin should be attached')
    
    // 确保 L.indoor 或相关方法可用
    if (typeof window.L.Indoor === 'undefined') {
      console.error('Leaflet-Indoor plugin not properly initialized! Make sure it is correctly imported.')
    } else {
      console.log('Leaflet-Indoor plugin successfully attached to Leaflet')
    }
  }
  
  return {
    provide: {
      // 可以在这里提供任何插件API
    }
  }
})
