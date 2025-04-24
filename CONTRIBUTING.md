# 开发者贡献指南

欢迎加入智慧导览系统前端项目的开发！本指南旨在帮助您快速融入团队，并遵循一致的开发规范。

## 首次设置

1.  **克隆仓库**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  **安装 pnpm** (如果尚未安装):
    ```bash
    npm install -g pnpm
    ```
    *请确保 pnpm 版本符合 `README.md` 中的要求。*
3.  **安装依赖**:
    ```bash
    pnpm install
    ```
4.  **配置环境变量**:
    *   复制环境变量模板文件：
        ```bash
        cp .env.example .env
        ```
    *   编辑 `.env` 文件，填入必要的配置值。请向项目负责人或参考内部文档获取具体的 API 地址、地图 Token 等敏感信息。 **切勿将 `.env` 文件提交到版本库！**
5.  **运行开发服务器**:
    ```bash
    pnpm dev
    ```
    *   访问 `http://localhost:3000` 查看项目。

## 开发规范

### Git 工作流

我们采用基于功能分支（Feature Branch）的工作流。

1.  **保持 `main` 分支最新**: 在开始新任务前，务必更新本地 `main` 分支：
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **创建特性分支**: 从最新的 `main` 分支创建特性分支，命名约定：
    *   新功能: `feat/<short-description>` (例如: `feat/user-profile`)
    *   Bug 修复: `fix/<short-description>` (例如: `fix/login-redirect`)
    *   文档: `docs/<short-description>`
    *   重构: `refactor/<short-description>`
    ```bash
    git checkout -b feat/your-feature-name main
    ```
3.  **本地开发与提交**:
    *   在特性分支上进行开发。
    *   频繁、小批量地提交代码，遵循 [提交规范](#提交规范)。
    *   保持本地分支与远程 `main` 分支同步（推荐使用 `rebase`）：
        ```bash
        # 在提交本地改动前或遇到冲突时
        git fetch origin
        git rebase origin/main
        # 解决冲突（如有）后继续 rebase
        git rebase --continue
        ```
4.  **推送与 Pull Request (PR)**:
    *   将本地特性分支推送到远程仓库：
        ```bash
        git push origin feat/your-feature-name
        ```
    *   在 GitHub 上创建 Pull Request，目标分支为 `main`。
    *   清晰地描述 PR 的目的、改动内容和测试方法。如果关联了 Issue，请在描述中添加 `Closes #issue_number`。
    *   确保 CI 检查（构建、测试、Lint）通过。
    *   至少需要 **1** 位核心成员审查并批准后方可合并。

### 提交规范

我们遵循 [Conventional Commits v1.0.0](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范。这有助于自动化生成 CHANGELOG 和管理版本。

**格式**:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**主要 `type`**:
*   `feat`: 新增功能
*   `fix`: 修复 Bug
*   `docs`: 文档变更
*   `style`: 代码风格调整（不影响代码逻辑）
*   `refactor`: 代码重构（非 Bug 修复也非功能新增）
*   `perf`: 性能优化
*   `test`: 新增或修改测试
*   `build`: 构建系统或外部依赖变更
*   `ci`: CI/CD 配置文件和脚本变更
*   `chore`: 其他不修改 `src` 或 `test` 文件的小任务

**示例**:
```
feat(map): add support for indoor navigation layer

Implement the rendering and routing logic for indoor maps using the new Mapbox SDK features.

Closes #123
```
fix(auth): correct redirect loop after logout

The user was incorrectly redirected back to the login page even after successful logout. This commit fixes the redirection logic.

Refs #456
```

*推荐使用 `commitizen` (如果已配置) 或 VS Code 插件来辅助生成规范的提交信息。*

### 代码风格

项目使用 **ESLint** 和 **Prettier** 来保证代码风格统一和质量。配置文件 (`.eslintrc.cjs`, `.prettierrc` 等) 已包含在仓库中，并基于 `@nuxt/eslint-config` 进行了配置。

*   **自动格式化**: 强烈建议在 VS Code 中安装 Prettier 和 ESLint 插件，并开启保存时自动格式化。
*   **手动检查**:
    ```bash
    # 检查代码风格和潜在错误
    pnpm lint

    # 尝试自动修复代码风格问题
    pnpm lint:fix
    ```
*   **核心原则**:
    *   遵循 Nuxt 3 和 Vue 3 的最佳实践（组合式 API、`<script setup>`）。
    *   组件命名使用大驼峰式 (PascalCase)，例如 `UserProfileCard.vue`。
    *   组合式函数 (Composables) 使用 `use` 前缀，例如 `useAuth.ts`。
    *   优先使用 TypeScript，并添加必要的类型定义。

## 环境配置

项目的运行依赖于环境变量，例如后端 API 地址、第三方服务密钥（如 Mapbox Token）等。

1.  **获取配置**: 从项目负责人或内部文档获取 `.env.example` 中列出的所有环境变量的值。
2.  **创建 `.env`**:
    ```bash
    cp .env.example .env
    ```
3.  **填入值**: 编辑 `.env` 文件，填入获取到的实际值。
    ```env
    # 示例
    NUXT_PUBLIC_API_BASE=https://api.example.com/v1
    NUXT_MAPBOX_TOKEN=pk.eyJ1Ijoie... # 替换为你的 Mapbox Token
    # ... 其他变量
    ```
4.  **安全**: `.env` 文件包含敏感信息，**严禁**将其添加到 Git 版本控制中。`.gitignore` 文件已配置忽略 `.env`。

## 测试流程

保证代码质量是团队协作的关键。我们使用 Vitest进行单元/集成测试，Playwright 进行端到端（E2E）测试。

*   **测试文件位置**: 通常位于 `tests/` 目录下，按照单元（unit）、集成（integration）、端到端（e2e）分类。
*   **运行测试**:
    ```bash
    # 运行所有单元测试
    pnpm test:unit

    # 运行所有 E2E 测试 (可能需要先启动开发或预览服务器)
    pnpm test:e2e

    # （可选）生成测试覆盖率报告
    pnpm test:coverage
    ```
*   **要求**:
    *   新增或修改功能时，应编写相应的单元或集成测试。
    *   关键用户流程（如登录、下单、导航）应有 E2E 测试覆盖。
    *   提交 PR 前必须确保所有相关测试通过。

## 代码审查

代码审查是保证代码质量、分享知识和促进团队成长的必要环节。

1.  **发起审查**: 创建 PR 后，在 GitHub 上指定至少一位核心团队成员作为审查者。
2.  **审查清单**: 审查者将参考 [.github/CODE_REVIEW.md](./.github/CODE_REVIEW.md) 中的清单进行审查，但不仅限于清单内容。
3.  **沟通与修改**:
    *   审查者会通过评论提出建议或问题。
    *   PR 作者应积极回应评论，讨论或进行修改。
    *   修改后再次提交，并通知审查者。
4.  **合并**:
    *   所有 CI 检查必须通过。
    *   至少获得 **1** 位核心成员的批准 (Approved)。
    *   由 PR 作者或具备权限的成员点击合并按钮，推荐使用 "Squash and merge" 或 "Rebase and merge" （根据团队约定）以保持 `main` 分支的整洁。

## 文档更新

代码的变更通常需要伴随文档的更新。

*   **README.md**: 如果有涉及项目设置、启动方式、核心依赖等的变更，请更新 `README.md`。
*   **组件/逻辑文档**: 对于复杂组件或核心业务逻辑，建议在代码中添加清晰的 JSDoc/TSDoc 注释。
*   **用户文档**: 如果变更影响最终用户，确保相关用户手册或帮助文档得到更新。

感谢您的贡献！让我们一起构建出色的智慧导览系统！ 