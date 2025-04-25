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
    id: 'cgSgspJ2msm6clMCkdW9', // Jessica - 有表现力的美国女声
    name: 'Jessica (博物馆导游)',
    gender: 'female',
    model_id: models.multilingual,
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3',
    language: 'zh',
    tags: ['clear', 'professional', 'guide'],
    description: '专业博物馆导游，语气亲切清晰',
    settings: { ...defaultSettings },
    is_default: true,
  },
  {
    id: 'cjVigY5qzO86Huf0OWal', // Eric - 友好的美国男声
    name: 'Eric (历史专家)',
    gender: 'male',
    model_id: models.multilingual,
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3',
    language: 'zh',
    tags: ['friendly', 'authoritative', 'expert'],
    description: '历史专家，提供深入的展品历史背景介绍',
    settings: { ...defaultSettings },
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL', // Sarah - 柔和的美国女声
    name: 'Sarah (艺术讲解员)',
    gender: 'female',
    model_id: models.multilingual,
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3',
    language: 'en',
    tags: ['soft', 'clear', 'artistic'],
    description: '艺术展品专业讲解员，擅长艺术作品描述和欣赏指导',
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