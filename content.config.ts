import { defineCollection } from '@nuxt/content'

// 定义文档集合
export default {
    collections: {
        docs: defineCollection({
            // 可以添加特定的模式验证，这里我们保持简单
        })
    }
}