# AI旅游导游应用需求文档

## 技术栈
- 框架: Nuxt 3 (Vue 3)
- UI组件: Shadcn/ui for Vue  
- 状态管理: Pinia
- 样式: Tailwind CSS
- 图标: Lucide Vue

## 核心功能
1. **用户引导流程**
   - 停留时间选择 (0.5/1/1.5/2+小时)
   - 原籍地选择 (北美/欧洲/亚洲等)
   - 兴趣点选择 (西方艺术/东亚艺术等)

2. **AI导游功能**
   - 导游介绍页面 (Lisa Ghimire)
   - 语音交互界面
   - 实时问答系统

3. **展品导航**
   - 博物馆地图集成
   - 展品推荐路线
   - 展品详细信息

4. **社交功能**
   - 找搭子模式
   - 用户兴趣匹配

## 页面结构
```
/
  |- /guide      # AI导游介绍
  |- /preference # 偏好设置
  |- /tour       # 展品导航  
  |- /chat       # 语音交互
```

## 项目结构
```
ai-tour-guide/
  |- docs/       # 文档
  |- assets/     # 静态资源
  |- components/ # 公共组件
  |- pages/      # 页面路由
  |- stores/     # Pinia状态
```

## 后续步骤
1. 初始化Nuxt项目
2. 配置Shadcn/ui组件库
3. 实现核心页面框架
