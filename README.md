# 智慧导览系统 - 前端

[![GitHub License](https://img.shields.io/github/license/yourname/project)](LICENSE)
[![Nuxt Version](https://img.shields.io/badge/Nuxt-3.11.2-green)](https://nuxt.com)
[![Code Style](https://img.shields.io/badge/code_style-@nuxt/eslint--config-blue.svg)](https://github.com/nuxt/eslint-config)

本项目是 **智慧导览系统** 的前端部分，旨在为游客提供沉浸式、智能化的景区游览体验。利用现代 Web 技术，实现地图导览、路线规划、信息推送和 AR 互动等功能。

## ✨ 功能特性
- **实时定位与导航**: 基于 GPS 和地图引擎，提供精确的室内外定位和路线指引。
- **多语言支持**: 支持中英文切换，满足不同国家游客的需求。
- **无障碍访问**: 遵循 WCAG 标准，为视障、听障用户提供辅助功能。
- **离线地图缓存**: 支持下载离线地图数据，在无网络环境下也能使用核心导航功能。
- **3D 场景交互**: （可选）集成三维模型，提供更直观的景点展示。

## 🛠️ 技术栈
- **框架**: [Nuxt 3](https://nuxt.com) (Vue 3, Nitro, Vite)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **UI 组件**: (例如：Tailwind CSS, Naive UI - *请根据实际情况修改*)
- **地图**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) (*或其他地图库*)
- **代码规范**: ESLint + Prettier (@nuxt/eslint-config)
- **测试**: Vitest (单元测试), Playwright (E2E 测试) (*请根据实际情况修改*)

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- pnpm >= 8.x

### 安装依赖
```bash
pnpm install
```

### 开发模式
启动本地开发服务器 (访问 `http://localhost:3000`):
```bash
pnpm dev
```

### 生产构建
```bash
# 构建应用
pnpm build

# 本地预览生产版本
pnpm preview
```

### 环境变量
项目运行需要配置环境变量（如 API 地址、地图 Token 等）。请参考 [CONTRIBUTING.md](./CONTRIBUTING.md#环境配置) 中的说明创建和配置 `.env` 文件。

## 📁 项目结构
```
.
├── .github/          # GitHub Actions 工作流及模板
├── .vscode/          # VSCode 编辑器配置
├── assets/           # 静态资源 (会被 Vite 处理)
├── components/       # 全局 Vue 组件 (自动导入)
│   └── content/      # Markdown 文件对应的 Vue 组件
│   └── global/       # 全局注册的基础组件
├── composables/      # Vue 组合式函数 (自动导入)
├── content/          # Markdown 内容文件 (Nuxt Content)
├── layouts/          # 布局组件
├── middleware/       # 路由中间件
├── pages/            # 页面级组件 (基于文件系统路由)
├── plugins/          # Nuxt 插件
├── public/           # 公共资源 (直接复制到根目录)
├── server/           # 后端 API 路由 (Nitro)
│   ├── api/          # API 端点
│   └── middleware/   # 服务器中间件
├── tests/            # 测试文件 (单元/集成/E2E)
├── .env.example      # 环境变量模板
├── .eslintrc.cjs     # ESLint 配置
├── .gitignore        # Git 忽略配置
├── nuxt.config.ts    # Nuxt 核心配置文件
├── package.json      # 项目依赖与脚本
├── pnpm-lock.yaml    # pnpm 锁定文件
├── tsconfig.json     # TypeScript 配置
└── README.md         # 项目说明 (本文档)
```
详细的目录结构说明请参考 [Nuxt 官方文档](https://nuxt.com/docs/guide/directory-structure)。

## 🤝 参与贡献
我们欢迎各种形式的贡献！请在开始前仔细阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细的开发流程、代码规范和提交要求。

主要维护者: (@your_github_username)

## 部署
请查阅 [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment) 获取不同平台的部署指南。 CI/CD 流程配置见 [.github/workflows/main.yml](./.github/workflows/main.yml)。

## Setup

Make sure to install dependencies:

```