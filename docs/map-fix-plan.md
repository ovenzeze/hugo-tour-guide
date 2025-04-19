# 博物馆室内地图修复计划

## 问题诊断

通过分析错误日志和代码检查，发现以下关键问题：

1. **GeoJSON导入错误**：
   ```
   Failed to load GeoJSON for floor 1: SyntaxError: Unexpected token ':' (at floor1.geojson?import:2:9)
   ```
   - 原因：使用`import`方式导入GeoJSON文件在Nuxt中可能导致解析问题

2. **Leaflet实例获取失败**：
   ```
   Could not obtain Leaflet map instance from mapRef. Check component rendering.
   ```
   - 原因：LMap组件引用未正确获取或Leaflet未正确初始化

3. **类型和引用问题**：
   - 缺少必要的Leaflet类型导入
   - 直接使用L对象但未导入
   - 类型错误可能导致编译或运行时问题

4. **客户端渲染问题**：
   - Leaflet是纯客户端库，可能需要特殊处理确保SSR兼容性

## 解决方案

### 1. 修复MuseumMap.vue组件

主要修改：
- 使用`fetch`替代`import`加载GeoJSON文件
- 添加必要的Leaflet和类型导入
- 使用`ClientOnly`包装Leaflet组件
- 改进地图初始化逻辑
- 添加Leaflet CSS导入

### 2. 优化GeoJSON加载和解析

- 使用正确的方式获取静态JSON资源
- 确保GeoJSON格式正确 
- 改进数据处理流程

### 3. 修复Leaflet相关问题

- 确保正确导入Leaflet
- 添加必要的CSS
- 正确处理leaflet-indoor插件

### 4. 实现步骤

1. 修改MuseumMap.vue组件
2. 确保GeoJSON数据正确
3. 测试修复效果
4. 根据需要进一步改进