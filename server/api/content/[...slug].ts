import { defineEventHandler, createError, getRouterParam } from 'h3'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { useStorage } from '#imports'

/**
 * API路由处理文档内容
 * 预处理Markdown内容并生成TOC
 */
export default defineEventHandler(async (event) => {
  // 获取slug参数
  const slug = event.context.params?.slug || []
  const path = Array.isArray(slug) ? slug.join('/') : slug

  try {
    // 从serverAssets中读取文件内容
    const content = await useStorage('docs').getItem(`${path}.md`)
    
    if (!content) {
      throw new Error(`File not found: ${path}.md`)
    }
    
    // 解析Markdown内容，启用TOC生成
    const parsedContent = await parseMarkdown(content as string, {
      toc: { 
        depth: 4,         // 包含h1到h4级别标题
        searchDepth: 4,    // 搜索深度
        title: '目录'      // 目录标题
      },
      highlight: {
        theme: 'github-dark',
        langs: ['sql', 'typescript', 'javascript', 'vue', 'html', 'css', 'bash', 'json']
      }
    })
    
    return parsedContent
  } catch (err) {
    console.error(`Error loading markdown file: ${path}`, err)
    throw createError({
      statusCode: 404,
      statusMessage: `Document not found: ${path}`
    })
  }
}) 