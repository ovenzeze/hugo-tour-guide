import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  // 获取运行时配置
  const config = useRuntimeConfig()
  
  // 访问PostgreSQL URL (仅在服务器端可用)
  const postgresUrl = config.postgresUrl
  
  // 这里只是演示如何访问配置，实际使用时可能需要初始化数据库连接等
  console.log('PostgreSQL URL from runtime config:', postgresUrl)
})