import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { defineEventHandler, createError } from 'h3'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

/**
 * API路由处理文档内容
 * 预处理Markdown内容并生成TOC
 */
export default defineEventHandler(async (event) => {
  // 获取slug参数
  const slug = event.context.params?.slug || []
  const path = Array.isArray(slug) ? slug.join('/') : slug

  try {
    // 尝试从docs目录读取文件
    const filePath = resolve(process.cwd(), 'docs', `${path}.md`)
    const content = await readFile(filePath, 'utf-8')
    
    // 解析Markdown内容，启用TOC生成
    const parsedContent = await parseMarkdown(content, {
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