# 版本发布规范

## 语义化版本
- `MAJOR` 不兼容的API修改
- `MINOR` 向下兼容的功能新增
- `PATCH` 向下兼容的问题修复

## 发布流程
1. 创建 release 分支：
   ```bash
   git checkout -b release/v1.2.0
   ```
2. 更新 CHANGELOG.md
3. 执行预发布检查：
   ```bash
   pnpm run release:dry
   ```
4. 创建GitHub Release
5. 合并到 main 并打标签：
   ```bash
   git tag -a v1.2.0 -m "Release 1.2.0"
   git push origin --tags
   ```

## 自动化工具
使用 standard-version 自动生成变更日志：
```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:dry": "standard-version --dry-run"
  }
}
``` 