---
title: 运营工具开发计划
description: 博物馆、展品、展厅、角色、讲解文案和讲解音频的运营工具开发计划。
---

# 运营工具开发计划

## 目标

构建一个运营工具，允许用户对博物馆、展品、展厅、角色、讲解文案和讲解音频进行查看和管理（增、删、改、查）。

## 技术栈

Nuxt.js (客户端渲染), Supabase (后端服务), Tailwind CSS, Shadcn UI, Pinia。

## 计划详情

### 第一阶段：后端 API 规划与利用

继续优先利用 Supabase 自动生成的 PostgREST API 进行数据的增删改查。对于需要更复杂逻辑或聚合数据的场景，可以考虑以下方案：

1.  **利用 Supabase 视图 (Views):** 对于需要聚合或联表查询的数据，可以在 Supabase 中创建视图。PostgREST 会自动为视图生成对应的 API 端点，前端可以直接调用。例如，可以创建一个视图来获取博物馆及其关联的展厅和展品数量。
2.  **利用 Supabase 存储过程/函数 (Stored Procedures/Functions):** 对于更复杂的业务逻辑，例如在删除博物馆时需要同时删除所有关联的展厅和展品，可以编写 Supabase 函数来实现事务性操作。这些函数也可以通过 PostgREST 调用。
3.  **Supabase Edge Functions:** 对于需要自定义 Node.js 环境或集成第三方服务的场景（例如处理文件上传后的回调），可以使用 Edge Functions。

针对每个实体，核心 API 操作（GET, POST, PUT, DELETE）将主要依赖 PostgREST API。对于需要自定义逻辑的部分，将考虑上述 Supabase 内建功能。

**后端注意事项：**

*   **Supabase RLS (Row Level Security):** 必须为运营工具的用户配置精细的 RLS 策略，确保数据安全。
*   **数据验证:** 继续在数据库层面（通过约束、触发器）和可能的 Supabase 函数中实现数据验证。
*   **API 性能:** 对于数据量较大的表，考虑在 Supabase 中创建索引以优化查询性能。

### 第二阶段：前端设计与实现

前端将基于 Nuxt.js 框架，利用 Pinia 进行状态管理，并使用 Tailwind CSS 和 Shadcn UI 构建用户界面。

1.  **整体布局与导航：**
    *   使用 Nuxt.js 的布局功能，创建一个专门用于运营后台的布局。
    *   利用 Shadcn UI 的组件构建侧边栏导航或顶部导航，包含指向各个实体管理页面的链接。
    *   实现基于 Supabase Auth 的用户认证流程，并根据用户角色控制导航和页面访问权限。

2.  **实体管理页面：**
    *   为每个实体在 `pages/` 目录下创建对应的管理页面（例如 `pages/admin/museums/index.vue`, `pages/admin/museums/[id].vue`）。
    *   **列表视图：**
        *   使用 Shadcn UI 的 Table 组件展示数据。
        *   利用 Pinia Store 管理列表数据、分页、排序和过滤状态。
        *   通过 Supabase SDK 或 Nuxt 的 useFetch/useAsyncData composable 调用后端 API 获取数据。
        *   实现基于 URL 查询参数的分页、排序和过滤功能，方便分享和书签。
        *   为每条记录提供操作按钮，触发相应的详情、编辑或删除流程。
    *   **详情/编辑视图：**
        *   创建新的页面或使用模态框/抽屉展示详情和编辑表单。
        *   使用 Shadcn UI 的 Form 和 Input 组件构建表单。
        *   利用 Pinia Store 管理单个实体的数据状态。
        *   对于关联字段，使用 Shadcn UI 的 Select 或 Combobox 组件，数据源通过调用关联表的 API 获取。
        *   集成文件上传功能，调用 Supabase Storage SDK 进行文件上传，并将返回的 URL 存储到数据库中。
        *   对于富文本内容，可以集成一个兼容 Vue 3 的富文本编辑器组件。
        *   实现表单验证，并使用 Shadcn UI 的 Toast 组件显示验证错误和操作结果。
    *   **创建视图：**
        *   创建新的页面或使用模态框/抽屉展示创建表单。
        *   表单结构类似于编辑视图，但字段初始值为空。
        *   调用相应的 POST API 创建新记录。

3.  **状态管理 (Pinia):**
    *   为每个实体或相关功能模块创建 Pinia Store。
    *   Store 中应包含数据状态、加载状态、错误状态以及用于调用 API 和更新状态的 actions。
    *   利用 Pinia 的 subscribe 或 watch 功能，可以在状态变化时执行副作用（例如重新加载列表数据）。

4.  **API 交互：**
    *   利用 Nuxt 的 useFetch/useAsyncData composable 简化数据获取。
    *   直接使用 Supabase JavaScript SDK 调用 Supabase API，包括数据库操作、认证和存储。
    *   将 Supabase 客户端实例注入到应用中，方便在各个组件和 Store 中使用。

5.  **前端注意事项：**
    *   **组件化:** 充分利用 Vue 3 的组件化能力，构建可复用和易于维护的 UI 组件。
    *   **错误处理:** 在前端捕获 API 调用错误，并向用户显示友好的错误信息。
    *   **加载状态:** 在数据加载期间显示加载指示器，提升用户体验。
    *   **权限控制:** 在前端根据用户权限控制页面元素的可见性和可操作性。
    *   **路由守卫:** 使用 Nuxt 的路由中间件实现页面级别的权限控制。

### 第三阶段：实施与迭代

*   按照计划逐步实现各个实体的管理功能。
*   优先实现核心的查看和编辑功能。
*   充分利用 Shadcn UI 提供的组件和样式，保持界面一致性。
*   编写 Pinia Store 来管理复杂的状态和异步操作。
*   进行全面的测试，确保功能的稳定性和数据安全。
*   根据用户反馈进行持续优化和改进。