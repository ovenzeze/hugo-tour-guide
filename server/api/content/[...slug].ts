import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 获取slug参数
    const slug = event.context.params?.slug || ['tour-functionality']
    const path = Array.isArray(slug) ? slug.join('/') : slug
    
    // 构建文件路径
    const filePath = resolve(process.cwd(), 'content', `${path}.md`)
    
    // 读取Markdown文件
    const content = await readFile(filePath, 'utf-8')
    
    // 设置Content-Type头
    event.node.res.setHeader('Content-Type', 'text/markdown')
    
    // 返回文件内容
    return content
  } catch (error) {
    console.error('加载Markdown文件时出错:', error)
    throw createError({
      statusCode: 404,
      statusMessage: '文档未找到'
    })
  }
})