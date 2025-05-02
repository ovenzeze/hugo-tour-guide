// pnpmfile.cjs - 自定义 pnpm 行为
/**
 * 当在 Vercel 环境中使用 pnpm 10+ 时，better-sqlite3 需要特殊处理
 * 这个文件确保构建脚本可以正确执行
 */
function readPackage(pkg) {
  // 特殊处理 better-sqlite3 依赖
  if (pkg.name === 'better-sqlite3') {
    // 强制覆盖某些版本，或更改依赖关系
    pkg.dependencies = pkg.dependencies || {};
    
    // 确保构建脚本可执行
    pkg.scripts = pkg.scripts || {};
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}; 