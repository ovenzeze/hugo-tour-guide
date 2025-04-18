# AI旅游导游应用项目结构设计

## 目录结构设计

基于需求文档和当前项目结构，我们设计以下目录结构:

```
hugo-tour-guide/
├── assets/                # 静态资源
│   ├── css/               # CSS样式
│   ├── images/            # 图片资源
│   │   ├── guide/         # 导游相关图片
│   │   ├── exhibits/      # 展品相关图片
│   │   └── map/           # 地图相关图片
│   └── icons/             # 图标资源
├── components/            # 组件
│   ├── ui/                # UI基础组件(已有)
│   ├── layout/            # 布局组件
│   │   ├── Header.vue     # 页面头部
│   │   ├── Footer.vue     # 页面底部
│   │   └── Navigation.vue # 导航菜单
│   ├── guide/             # 导游相关组件
│   │   └── GuideProfile.vue # 导游介绍组件
│   ├── preference/        # 偏好设置相关组件
│   │   ├── TimeSelector.vue  # 停留时间选择
│   │   ├── RegionSelector.vue # 原籍地选择
│   │   └── InterestSelector.vue # 兴趣点选择
│   ├── tour/              # 展品导航相关组件
│   │   ├── MuseumMap.vue  # 博物馆地图
│   │   ├── ExhibitCard.vue # 展品卡片
│   │   └── RouteDisplay.vue # 路线显示
│   ├── chat/              # 聊天相关组件
│   │   ├── VoiceInterface.vue # 语音交互界面
│   │   ├── ChatHistory.vue # 聊天历史记录
│   │   └── QuestionInput.vue # 问题输入框
│   └── social/            # 社交功能相关组件
│       ├── PartnerFinder.vue # 找搭子组件
│       └── InterestMatcher.vue # 兴趣匹配组件
├── layouts/               # 页面布局
│   └── default.vue        # 默认布局
├── middleware/            # 路由中间件
│   └── auth.ts            # 认证中间件
├── pages/                 # 页面路由
│   ├── index.vue          # 首页
│   ├── guide/index.vue    # AI导游介绍页面
│   ├── preference/index.vue # 偏好设置页面
│   ├── tour/index.vue     # 展品导航页面
│   └── chat/index.vue     # 语音交互页面
├── stores/                # Pinia状态管理
│   ├── userStore.ts       # 用户信息和偏好
│   ├── tourStore.ts       # 导览信息和展品数据
│   └── chatStore.ts       # 聊天历史和交互状态
├── types/                 # TypeScript类型定义
│   └── index.ts           # 通用类型定义
└── utils/                 # 工具函数
    ├── api.ts             # API相关函数
    └── helpers.ts         # 辅助函数
```

## 实施计划

我们将把这个任务分解为以下子任务:

### 子任务1: 创建基础目录结构
- 创建pages目录及其子目录
- 创建stores目录
- 创建layouts目录
- 创建middleware目录
- 创建types目录
- 创建utils目录
- 扩展components目录，添加业务组件子目录
- 扩展assets目录，添加images和icons子目录

### 子任务2: 实现布局组件
- 创建默认布局(layouts/default.vue)
- 创建Header组件(components/layout/Header.vue)
- 创建Footer组件(components/layout/Footer.vue)
- 创建Navigation组件(components/layout/Navigation.vue)

### 子任务3: 实现页面路由
- 创建首页(pages/index.vue)
- 创建AI导游介绍页面(pages/guide/index.vue)
- 创建偏好设置页面(pages/preference/index.vue)
- 创建展品导航页面(pages/tour/index.vue)
- 创建语音交互页面(pages/chat/index.vue)

### 子任务4: 实现状态管理
- 创建用户状态管理(stores/userStore.ts)
- 创建导览状态管理(stores/tourStore.ts)
- 创建聊天状态管理(stores/chatStore.ts)

### 子任务5: 实现业务组件
- 实现导游相关组件(components/guide/*)
- 实现偏好设置相关组件(components/preference/*)
- 实现展品导航相关组件(components/tour/*)
- 实现聊天相关组件(components/chat/*)
- 实现社交功能相关组件(components/social/*)

## 组件详细设计

### 布局组件

#### Header.vue
- 显示应用标题和logo
- 提供用户登录/注册入口
- 显示当前用户信息(如已登录)

#### Footer.vue
- 显示版权信息
- 提供联系方式和社交媒体链接
- 显示应用版本信息

#### Navigation.vue
- 提供主要页面导航链接
- 高亮显示当前页面
- 响应式设计，适配移动端

### 导游相关组件

#### GuideProfile.vue
- 显示AI导游(Lisa Ghimire)的个人资料
- 包含头像、简介和专长领域
- 提供开始导览的按钮

### 偏好设置相关组件

#### TimeSelector.vue
- 提供停留时间选择(0.5/1/1.5/2+小时)
- 使用单选按钮或滑块进行选择
- 显示每个选项的推荐展品数量

#### RegionSelector.vue
- 提供原籍地选择(北美/欧洲/亚洲等)
- 使用下拉菜单或地图选择界面
- 根据选择调整推荐内容

#### InterestSelector.vue
- 提供兴趣点选择(西方艺术/东亚艺术等)
- 使用多选框或标签选择界面
- 可按类别筛选兴趣点

### 展品导航相关组件

#### MuseumMap.vue
- 显示博物馆地图
- 标记当前位置和推荐展品位置
- 提供缩放和平移功能

#### ExhibitCard.vue
- 显示展品信息卡片
- 包含展品图片、名称、简介
- 提供查看详情和添加到路线的按钮

#### RouteDisplay.vue
- 显示推荐路线
- 包含路线上的展品列表
- 提供路线时间估计和距离信息

### 聊天相关组件

#### VoiceInterface.vue
- 提供语音输入按钮
- 显示语音识别状态
- 支持语音播放AI回复

#### ChatHistory.vue
- 显示聊天历史记录
- 区分用户和AI的消息
- 支持图文混合内容

#### QuestionInput.vue
- 提供文本输入框
- 包含发送按钮和语音输入切换
- 支持快捷问题推荐

### 社交功能相关组件

#### PartnerFinder.vue
- 提供找搭子功能界面
- 显示附近的其他用户
- 支持发送配对请求

#### InterestMatcher.vue
- 显示兴趣匹配结果
- 基于用户偏好推荐潜在伙伴
- 提供联系方式或聊天入口