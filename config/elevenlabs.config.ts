/**
 * ElevenLabs配置
 * 纯配置文件，可随时修改和调整
 */

import type { Voice } from '../types/voice'

/**
 * 语音模型配置
 */
export const models: Voice.ModelOptions = {
  /**
   * 高质量多语言模型
   * 特点: 高质量，丰富表现力
   * 适用: 预先生成的内容，如虚拟导游讲解
   */
  multilingual: 'eleven_multilingual_v2',
  
  /**
   * 中速高效模型
   * 特点: 处理速度较快，中等质量
   * 适用: 长文本处理，平衡速度和质量
   */
  turbo: 'eleven_turbo_v2',
  
  /**
   * 低延迟模型
   * 特点: 低延迟（约75ms）
   * 适用: 实时交互场景，如虚拟助手对话
   */
  flash: 'eleven_flash_v2_5',
}

/**
 * 默认语音设置
 */
export const defaultSettings: Voice.Settings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0,
  use_speaker_boost: true,
};

/**
 * 预设声音配置列表
 */
export const voices: Voice.Config[] = [
  {
    id: 'voice1',
    name: '默认女声',
    gender: 'female',
    model_id: models.multilingual,
    preview_url: '/audio/samples/voice1.mp3',
    language: 'zh',
    tags: ['clear', 'professional'],
    description: '标准女声，清晰专业',
    settings: { ...defaultSettings },
    is_default: true,
  },
  {
    id: 'voice2',
    name: '默认男声',
    gender: 'male',
    model_id: models.multilingual,
    preview_url: '/audio/samples/voice2.mp3',
    language: 'zh',
    tags: ['deep', 'authoritative'],
    description: '低沉有力的男声',
    settings: { ...defaultSettings },
  },
  {
    id: 'voice3',
    name: '英语教学',
    gender: 'female',
    model_id: models.multilingual,
    preview_url: '/audio/samples/voice3.mp3',
    language: 'en',
    tags: ['educational', 'clear'],
    description: '适合英语教学的标准美式发音',
    settings: {
      ...defaultSettings,
      stability: 0.8,
    },
  },
];

/**
 * 默认配置导出
 */
export default {
  models,
  defaultSettings,
  voices,
} 