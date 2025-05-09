import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig> {
  // You can pass an array of routes or a function returning routes
  routes: (_routes) => {
    // _routes is an array of all routes (from pages/ and modules)
    // We need to find the routes added by @scalar/nuxt and modify their meta

    const processedRoutes = _routes.map(route => {
      // 检查是否是 Scalar API 文档路由（/api-docs 开头）
      if (route.path && route.path.startsWith('/api-docs')) {
        return {
          ...route,
          meta: {
            ...route.meta,
            hideLayoutShell: true
          }
        }
      }
      // 确保不要修改原有 /docs 路由的元数据，它应该使用 fullscreen 布局
      return route
    })
    return processedRoutes
  },

  // You can also customize other router options here, e.g.:
  // scrollBehavior(to, from, savedPosition) {
  //   // ...
  // },
} 