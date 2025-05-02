# ElevenLabs 声音配置管理指南

本文档提供了如何在项目中管理和使用 ElevenLabs 声音配置的详细说明。通过使用预设的声音配置，您可以轻松地在不同场景中使用一致的声音风格。

## 目录

1. [配置结构](#配置结构)
2. [添加和修改声音配置](#添加和修改声音配置)
3. [使用声音配置](#使用声音配置)
4. [最佳实践](#最佳实践)
5. [常见问题](#常见问题)

## 配置结构

所有声音配置存储在 `config/voices.ts` 文件中，使用 TypeScript 类型定义以确保类型安全。每个声音配置包含以下信息：

```typescript
interface VoiceConfig {
  id: string;                // 声音ID，来自ElevenLabs
  name: string;              // 声音名称
  description?: string;      // 声音描述
  language?: string;         // 适用语言
  modelId?: string;          // 使用的TTS模型
  gender?: 'male' | 'female' | 'neutral'; // 声音性别
  age?: 'child' | 'young' | 'adult' | 'senior'; // 声音年龄段
  tags?: string[];           // 标签，用于筛选
  settings?: {               // 声音设置
    stability?: number;      // 稳定性 0-1
    similarity_boost?: number; // 相似度增强 0-1
    style?: number;          // 风格强度 0-1
    use_speaker_boost?: boolean; // 是否增强说话者特征
  };
  promptExamples?: {         // 提示词示例
    [key: string]: string;   // 场景名: 提示词
  };
}
```

此外，还提供了几个实用函数来查找和筛选声音：

- `findVoiceById(id: string)`: 根据ID查找声音配置
- `findVoicesByTags(tags: string[])`: 根据标签筛选声音配置
- `findVoicesByLanguage(language: string)`: 根据语言筛选声音配置
- `getDefaultVoice()`: 获取默认声音配置

## 添加和修改声音配置

### 添加新的声音配置

要添加新的声音配置，请按照以下步骤操作：

1. 在 ElevenLabs 官网获取您希望使用的声音ID
2. 在 `config/voices.ts` 文件中的 `voiceConfigs` 数组中添加新的配置：

```typescript
// 示例：添加新的声音配置
{
  id: '您的声音ID',
  name: '声音名称',
  description: '声音描述',
  language: '中文', // 或 'English', '双语/Bilingual' 等
  modelId: modelOptions.flash, // 可选择 multilingual, turbo, flash
  gender: 'female', // 'male', 'female', 'neutral'
  age: 'adult', // 'child', 'young', 'adult', 'senior'
  tags: ['标签1', '标签2'],
  settings: {
    stability: 0.6, // 0-1
    similarity_boost: 0.7, // 0-1
    style: 0.4 // 0-1
  },
  promptExamples: {
    '场景1': '示例文本1',
    '场景2': '示例文本2'
  }
}
```

### 修改现有配置

要修改现有声音配置的参数（如稳定性、相似度等），只需在 `config/voices.ts` 文件中找到相应的配置并更改其值。

```typescript
// 示例：修改声音设置
{
  id: 'kqVT88a5QfII1HNAEPTJ',
  // ...其他属性保持不变
  settings: {
    stability: 0.75, // 增加稳定性
    similarity_boost: 0.8,
    style: 0.3 // 降低风格强度
  }
}
```

### 添加提示词示例

提示词示例是预先设定的文本片段，可以快速用于测试或特定场景。在配置中的 `promptExamples` 对象中添加键值对：

```typescript
promptExamples: {
  '欢迎语': '欢迎光临，我是您的虚拟导游。今天我将带您参观这座历史悠久的博物馆。',
  '展品介绍': '这件青铜器来自西周时期，距今已有约3000年历史...',
  '引导': '请跟随我向右转，我们将前往下一个展厅。'
}
```

## 使用声音配置

项目中的 `composables/useElevenLabsTTS.ts` 提供了多种使用声音配置的方法：

### 基础用法

```typescript
// 导入composable
import { useElevenLabsTTS } from '~/composables/useElevenLabsTTS'

// 在组件中使用
const { 
  generateWithVoiceConfig, 
  generateWithVoiceId,
  generateWithDefaultVoice,
  audioUrl, 
  isLoading,
  error 
} = useElevenLabsTTS()

// 使用默认声音生成语音
await generateWithDefaultVoice('要转换的文本')

// 使用指定ID的声音配置生成语音
await generateWithVoiceId('要转换的文本', 'kqVT88a5QfII1HNAEPTJ')

// 使用完整的声音配置对象生成语音
import { findVoiceById } from '~/config/elevenlabs'
const voiceConfig = findVoiceById('kqVT88a5QfII1HNAEPTJ')
if (voiceConfig) {
  await generateWithVoiceConfig('要转换的文本', voiceConfig)
}
```

### 高级用法：筛选声音

```typescript
import { findVoicesByTags, findVoicesByLanguage } from '~/config/elevenlabs'

// 查找特定语言的声音
const chineseVoices = findVoicesByLanguage('中文')
if (chineseVoices.length > 0) {
  await generateWithVoiceConfig('这是中文测试', chineseVoices[0])
}

// 查找特定标签的声音
const childVoices = findVoicesByTags(['儿童', '活泼'])
if (childVoices.length > 0) {
  await generateWithVoiceConfig('小朋友们好！', childVoices[0])
}
```

## 最佳实践

### 语音模型选择指南

根据不同场景需求选择合适的模型：

- **eleven_multilingual_v2**: 高质量多语言模型，适合预先生成的内容和对质量要求高的场景。
- **eleven_turbo_v2**: 处理速度较快，中等质量，适合长文本处理，平衡速度和质量。
- **eleven_flash_v2_5**: 低延迟（约75ms），适合实时交互场景。

### 声音参数优化建议

- **稳定性 (stability)**: 控制声音的一致性。
  - 较高值 (0.7-1.0): 更稳定、平稳，适合长文本和正式场合。
  - 较低值 (0.3-0.6): 更有表现力，适合情感丰富的内容。

- **相似度 (similarity_boost)**: 控制与原始声音的相似程度。
  - 较高值 (0.7-1.0): 更接近原始声音，保持独特性。
  - 较低值 (0.3-0.6): 更自然流畅，但可能偏离原声特征。

- **风格强度 (style)**: 控制声音的风格表现。
  - 较高值 (0.6-1.0): 更强的风格特点，适合角色扮演。
  - 较低值 (0-0.5): 更中性的表达，适合通用信息传递。

### 组织声音配置的建议

- 使用有意义的命名和描述
- 利用标签系统进行分类（如语言、年龄、用途等）
- 为每个声音提供多样化的提示词示例
- 定期测试和优化声音参数

## 常见问题

### 如何获取新的声音ID？

1. 登录 [ElevenLabs 控制台](https://elevenlabs.io/)
2. 导航到 "Voice Library" 选择或创建您想使用的声音
3. 声音详情页面的 URL 中包含声音 ID，格式如：`https://elevenlabs.io/voice-library/[声音ID]`

### 如何调整声音参数以获得最佳效果？

声音参数调整是一个反复实验的过程：
1. 从中等值开始（如 stability: 0.5, similarity_boost: 0.6）
2. 生成测试音频并评估
3. 根据需要调整参数：如需更稳定的声音增加 stability，如需更像原声增加 similarity_boost
4. 记录最佳参数组合并保存到配置中

### 如何在不同场景间切换声音？

```typescript
// 根据内容类型选择合适的声音
function getVoiceForContent(contentType: 'children' | 'adult' | 'formal' | 'casual') {
  switch (contentType) {
    case 'children':
      return findVoicesByTags(['儿童'])[0] || getDefaultVoice()
    case 'adult':
      return findVoicesByTags(['成人'])[0] || getDefaultVoice()
    case 'formal':
      return findVoicesByTags(['正式'])[0] || getDefaultVoice()
    case 'casual':
      return findVoicesByTags(['轻松'])[0] || getDefaultVoice()
    default:
      return getDefaultVoice()
  }
}

// 使用
const voiceConfig = getVoiceForContent('children')
await generateWithVoiceConfig('今天我们要学习有趣的科学知识！', voiceConfig)
```

---

通过这个声音配置管理系统，您可以轻松地预设、管理和应用不同的声音设置，为应用程序的不同部分创建一致且优化的语音体验。 