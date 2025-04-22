# ElevenLabs API 集成指南 (Nuxt)

本文档提供了在 Nuxt 3 应用中集成 ElevenLabs 文字转语音 (TTS) API 的详细指南，帮助您快速实现虚拟导游、语音叙述等功能。

## 目录

- [快速开始](#快速开始)
- [安装依赖](#安装依赖)
- [环境配置](#环境配置)
- [API 集成方案](#api-集成方案)
- [基本用法](#基本用法)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

## 相关文档

- [API 配置指南](./configuration.md)
- [Nuxt 服务端 API 实现](./server-api.md)
- [组件示例](./components.md)
- [实时语音流实现](./streaming.md)

## 关于 ElevenLabs

ElevenLabs 提供先进的 AI 语音生成服务，支持多语言（包括中文）的自然语音合成，可用于创建虚拟导游、有声内容和互动式应用。 