import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'
// 现在 fetchElevenLabsAPI 应该通过 server/utils/ 自动导入

export default defineEventHandler(async (event) => {
  try {
    // 获取运行时配置
    const config = useRuntimeConfig()
    console.log('[tts.post] 接收到 TTS 请求')
    
    // 读取请求体，并设置默认值
    const { 
      text, 
      voiceId = config.public.elevenlabsDefaultVoiceId,
      modelId = config.public.elevenlabsDefaultModelId,
      voiceSettings // 可选的语音设置
    } = await readBody(event)
    
    console.log('[tts.post] 请求参数:', { 
      textLength: text?.length || 0,
      voiceId,
      modelId,
      hasVoiceSettings: !!voiceSettings
    })
    
    // 参数验证
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.error('[tts.post] 错误: 缺少必要的文本参数')
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: '缺少必要参数: text'
      }))
    }
    
    // 调用 ElevenLabs API
    let audioResponse
    try {
      audioResponse = await fetchElevenLabsAPI({
        endpoint: `/text-to-speech/${voiceId}`,
        method: 'POST',
        body: {
          text,
          model_id: modelId,
          // 仅当 voiceSettings 提供时才包含它
          ...(voiceSettings && { voice_settings: voiceSettings })
        },
        responseType: 'arraybuffer'
      })
    } catch (apiError: any) {
      console.error('[tts.post] ElevenLabs API 调用失败:', apiError)
      return sendError(event, apiError)
    }
    
    // 验证音频响应
    if (!audioResponse || (audioResponse instanceof ArrayBuffer && audioResponse.byteLength < 100)) {
      console.error('[tts.post] 警告: 收到的音频响应太小或为空', 
          audioResponse instanceof ArrayBuffer ? `(${audioResponse.byteLength} 字节)` : '(不是 ArrayBuffer)')
      
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: '语音生成失败: 收到的响应为空或无效'
      }))
    }
    
    // arrayBuffer 转 Buffer
    const buffer = Buffer.from(audioResponse)
    const bufferLength = buffer.length
    
    console.log('[tts.post] 成功生成音频，大小:', 
          `${bufferLength} 字节 (Buffer), 原始大小: ${audioResponse instanceof ArrayBuffer ? audioResponse.byteLength : 'unknown'} 字节`)
    
    // 设置响应头，确保正确传输二进制数据
    // 明确设置 Content-Length 避免 Transfer-Encoding: chunked
    event.node.res.setHeader('Content-Type', 'audio/mpeg')
    event.node.res.setHeader('Content-Length', bufferLength)
    // 明确禁用压缩，防止 Nitro 自动压缩二进制数据
    event.node.res.setHeader('Content-Encoding', 'identity')
    // 允许跨域
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    // 禁止客户端缓存，避免缓存问题
    event.node.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    // 使用 Buffer 和 .end() 来明确写入整个数据块
    event.node.res.end(buffer)
    // 由于我们直接使用 res.end()，我们需要返回 undefined 以防止 Nitro 尝试再次发送响应
    return undefined
  } catch (error: any) {
    console.error('[tts.post] 未捕获错误:', error)
    return sendError(event, createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '语音生成失败: 服务器处理错误'
    }))
  }
}) 