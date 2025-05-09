import { defineEventHandler, createError, getRouterParam } from 'h3'
import { useStorage } from '#imports'

// 添加 OpenAPI 元数据
defineRouteMeta({
  openAPI: {
    summary: '获取文档内容',
    description: '根据路径获取并解析Markdown文档内容，生成目录和代码高亮',
    tags: ['doctest'],
    parameters: [
      {
        name: 'slug',
        in: 'path',
        required: true,
        description: '文档路径，可以包含多级目录',
        schema: {
          type: 'string'
        }
      }
    ],
    responses: {
      '200': {
        description: '成功获取并解析文档内容',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                body: {
                  type: 'object',
                  description: '解析后的文档内容'
                },
                toc: {
                  type: 'array',
                  description: '文档目录结构',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      text: { type: 'string' },
                      depth: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '404': {
        description: '文档未找到',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 404 },
                statusMessage: { type: 'string', example: 'Document not found: docs/guide' }
              }
            }
          }
        }
      }
    }
  }
})

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