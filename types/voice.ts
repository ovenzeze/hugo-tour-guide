/**
 * 语音系统类型定义
 * 为整个语音系统提供统一的类型规范，使用命名空间进行组织管理
 */

export namespace Voice {
  /**
   * 声音设置接口
   */
  export interface Settings {
    stability?: number;         // 稳定性 0-1
    similarity_boost?: number;  // 相似度增强 0-1
    style?: number;             // 风格强度 0-1
    use_speaker_boost?: boolean; // 是否增强说话者特征
  }

  /**
   * 声音配置接口
   */
  export interface Config {
    id: string;                // 声音ID，来自ElevenLabs
    name: string;              // 声音名称（便于选择）
    description?: string;      // 声音描述
    language?: string;         // 适用语言，如 "中文", "English", "双语"
    model_id?: string;         // 使用的TTS模型(兼容旧版)
    modelId?: string;          // 使用的TTS模型
    gender?: 'male' | 'female' | 'neutral'; // 声音性别
    age?: 'child' | 'young' | 'adult' | 'senior'; // 声音年龄段
    tags?: string[];           // 标签，用于筛选
    settings?: Settings;       // 声音设置
    preview_url?: string;      // 预览URL
    is_default?: boolean;      // 是否为默认声音
    promptExamples?: {         // 提示词示例
      [key: string]: string;   // 场景名: 提示词
    };
  }

  /**
   * 语音生成请求选项
   */
  export interface TTSOptions {
    voiceId?: string;          // 声音ID
    voice_id?: string;         // 声音ID(兼容旧版)
    modelId?: string;          // 模型ID
    model_id?: string;         // 模型ID(兼容旧版)
    voiceSettings?: Settings;  // 声音设置
    voice_settings?: Settings; // 声音设置(兼容旧版)
  }

  /**
   * 语音生成响应状态
   */
  export interface TTSState {
    audioUrl?: string | null;   // 音频URL
    audio?: string | null;      // 音频数据
    isLoading: boolean;         // 加载状态
    error: string | null;       // 错误信息
    currentVoiceConfig?: Config | null; // 当前使用的声音配置
  }

  /**
   * 模型选项
   */
  export interface ModelOptions {
    multilingual: string;
    turbo: string;
    flash: string;
    [key: string]: string;
  }

  /**
   * 使用场景类型
   */
  export type ScenarioType = 'quality' | 'balanced' | 'realtime';

  /**
   * 展品数据接口
   */
  export interface ExhibitData {
    id: number | string; // 根据实际情况可能需要 ID
    name: string;
    description?: string;
  }
}

// 导出整个命名空间（作为类型），供其他模块使用
export type { Voice }; 