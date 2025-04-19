<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">环境变量配置示例</h1>
    
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 class="text-xl font-semibold mb-2">服务器端配置</h2>
      <p>服务器端配置已加载。查看服务器控制台以获取更多信息。</p>
      <p class="text-sm text-gray-600">
        服务器端配置可以通过 <code>useRuntimeConfig()</code> 访问，但只能在服务器端组件或API路由中使用。
      </p>
    </div>
    
    <div class="bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">客户端配置</h2>
      <p v-if="config.public.postgresUrl">
        PostgreSQL URL: <code>{{ config.public.postgresUrl }}</code>
      </p>
      <p v-else class="text-amber-600">
        PostgreSQL URL 未暴露给客户端。
        要暴露此配置，请在 nuxt.config.ts 中取消注释 public.postgresUrl 配置。
      </p>
      <p class="text-sm text-gray-600 mt-2">
        客户端配置只能访问 runtimeConfig.public 中的值。
      </p>
    </div>
  </div>
</template>

<script setup>
// 在客户端和服务器端都可以访问 useRuntimeConfig
const config = useRuntimeConfig()

// 注意：只有 config.public 中的值在客户端可用
// config.postgresUrl 只在服务器端可用
</script>