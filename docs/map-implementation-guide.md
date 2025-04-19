# 博物馆室内地图实现指南

基于错误分析，以下是详细的修复方案和代码实现指南。

## MuseumMap.vue 组件修改

将`MuseumMap.vue`替换为以下优化后的代码：

```vue
<template>
  <div class="w-full h-full">
    <!-- 使用ClientOnly包装Leaflet组件避免SSR问题 -->
    <ClientOnly>
      <LMap
        ref="mapRef"
        :zoom="18"
        :center="mapCenter"
        :use-global-leaflet="false"
        style="background-color: #eee; width: 100%; height: 100%;"
      >
        <!-- 条件性渲染GeoJSON数据 -->
        <LGeoJson
          v-if="currentFloorGeoJson"
          :geojson="currentFloorGeoJson"
          :options-style="geoJsonStyle"
          :options="geoJsonOptions"
        />
      </LMap>
      
      <!-- 添加加载指示器 -->
      <div v-if="!currentFloorGeoJson && !loadError" class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <div class="text-center">
          <p class="text-gray-600">正在加载地图数据...</p>
        </div>
      </div>
      
      <!-- 添加错误提示 -->
      <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <div class="text-center text-red-600">
          <p>无法加载地图数据</p>
          <p class="text-sm">{{ loadError }}</p>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
// 显式导入所需的Leaflet类型
import type { Map as LeafletMap, LatLngExpression, Layer, Marker } from 'leaflet';
// 导入GeoJSON类型
import type { Feature, GeoJsonObject } from 'geojson';

// 确保在客户端环境下导入Leaflet，避免SSR问题
// 注意：在模板中使用ClientOnly确保Leaflet组件仅在客户端渲染
let L: any = null;
if (process.client) {
  // 导入Leaflet CSS - 确保地图正确显示
  import('leaflet/dist/leaflet.css');
  // 动态导入Leaflet
  L = require('leaflet');
  // 引入leaflet-indoor插件
  require('leaflet-indoor');
}

// 定义Props
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
});

// 定义Emits
const emit = defineEmits(['select-exhibit', 'update:currentFloor']);

// Refs
const mapRef = ref<any>(null); // Ref for the LMap component instance
const currentFloorGeoJson = ref<GeoJsonObject | null>(null); // Holds the loaded GeoJSON data
const mapInstance = ref<LeafletMap | null>(null); // Holds the actual Leaflet Map instance
const markerLayers = ref<Record<number, Marker>>({});
const highlightedMarkerId = ref<number | null>(null);
const loadError = ref<string | null>(null);

// Map center computed property based on the current floor
const mapCenter = computed((): LatLngExpression => {
  // Provide slightly different centers for visual feedback on floor change
  return props.currentFloor === 1 ? [0.015, 0.015] : [0.015, 0.055];
});

// --- Marker Icons ---
// 将图标定义移动到条件块中，确保只在客户端执行
let defaultIcon: any = null;
let highlightedIcon: any = null;

// 在客户端初始化图标
if (process.client && L) {
  defaultIcon = L.icon({
    iconUrl: '/icons/marker-icon-blue.png',
    iconRetinaUrl: '/icons/marker-icon-blue-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/icons/marker-shadow.png',
    shadowSize: [41, 41]
  });

  highlightedIcon = L.icon({
    iconUrl: '/icons/marker-icon-red.png',
    iconRetinaUrl: '/icons/marker-icon-red-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/icons/marker-shadow.png',
    shadowSize: [41, 41]
  });
}

// --- GeoJSON Loading Function ---
// 修改为使用fetch方法而非import
async function loadGeoJson(floor: number) {
  // 重置错误状态
  loadError.value = null;
  
  // Reset markers before loading new data
  markerLayers.value = {};
  highlightedMarkerId.value = null;
  console.log(`Reset markers for floor ${floor}`);

  try {
    // 使用fetch API加载GeoJSON数据
    const response = await fetch(`/assets/mapdata/floor${floor}.geojson`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const geojsonData = await response.json();
    currentFloorGeoJson.value = geojsonData as GeoJsonObject;
    console.log(`Successfully loaded GeoJSON for floor ${floor}`);
  } catch (error) {
    console.error(`Failed to load GeoJSON for floor ${floor}:`, error);
    loadError.value = error instanceof Error ? error.message : '未知错误';
    currentFloorGeoJson.value = null; // Clear data in case of an error
  }
}

// --- Watch for changes in the currentFloor prop ---
watch(() => props.currentFloor, (newFloor) => {
  console.log(`Floor prop changed to ${newFloor}. Loading new GeoJSON...`);
  loadGeoJson(newFloor);
  // Pan the map to the new center when the floor changes
  if (mapInstance.value) {
     mapInstance.value.panTo(mapCenter.value);
  }
}, { immediate: true }); // immediate: true ensures loading on initial component mount

// --- Get Leaflet Instance on Mount ---
onMounted(async () => {
  // 确保只在客户端执行
  if (!process.client) return;
  
  // Wait for the component and potentially the LMap to render
  await nextTick();
  
  // Access the underlying Leaflet map instance via the ref
  if (mapRef.value && mapRef.value.leafletObject) {
    mapInstance.value = mapRef.value.leafletObject;
    console.log('Leaflet map instance obtained successfully:', mapInstance.value);

    // --- Initialize leaflet-indoor Level Control (Client-side only) ---
    if (L && L.Control && L.Control.Level) {
      try {
        const levelControl = new L.Control.Level({
          level: props.currentFloor.toString(), // Initial level from prop
          levels: ['1', '2'], // Available levels
          // Optional: customize control appearance/position
          position: 'topright'
        });

        // Listen for level changes from the control
        levelControl.on('levelchange', (e: any) => {
          if (e.level) {
            console.log('Level control changed to:', e.level);
            // Emit event to parent component
            emit('update:currentFloor', parseInt(e.level, 10));
          }
        });

        levelControl.addTo(mapInstance.value);
        console.log('Leaflet Indoor Level Control added.');

      } catch (pluginError) {
        console.error("Error initializing leaflet-indoor:", pluginError);
        loadError.value = '无法初始化室内地图控制器';
      }
    } else {
      console.warn("Leaflet Indoor Control not available.");
      loadError.value = '室内地图控制器不可用';
    }
    // --- End leaflet-indoor initialization ---

  } else {
    console.error("Could not obtain Leaflet map instance from mapRef. Check component rendering.");
    loadError.value = '无法获取地图实例';
  }
});

// --- GeoJSON Styling Function ---
const geoJsonStyle = (feature: any) => {
  // Define a basic style for GeoJSON features (points will be handled by pointToLayer)
  return {
    color: '#3388ff', // Blue lines/borders
    weight: 2,
    opacity: 1,
    fillOpacity: 0.1 // Slight blue fill for polygons (if any)
  };
};

// --- GeoJSON Options (including pointToLayer for markers) ---
// Computed property for options to ensure reactivity if needed, though static here
const geoJsonOptions = computed(() => ({
  pointToLayer: (feature: any, latlng: LatLngExpression) => {
    // 确保在客户端环境
    if (process.client && L && defaultIcon) {
      // Create a default Leaflet marker for each point feature
      const marker = L.marker(latlng, { icon: defaultIcon });
      // Add a tooltip showing the exhibit name
      marker.bindTooltip(feature.properties?.name || 'Unknown Exhibit');
      // Add a click event listener to the marker
      marker.on('click', () => {
        console.log('Exhibit marker clicked:', feature.properties);
        // Emit the select-exhibit event with the exhibit's ID
        emit('select-exhibit', { id: feature.properties?.id });
      });
      return marker; // Return the created marker
    }
    return null; // Return null if L is not available (e.g., during SSR)
  },
  onEachFeature: (feature: Feature, layer: Layer) => {
    // 确保在客户端环境
    if (process.client && L && feature.properties && feature.properties.id) {
      // Store marker instance if it's a marker and has an ID
      if (layer instanceof L.Marker) {
        markerLayers.value[feature.properties.id] = layer;
      }
    }
  }
}));

// --- Exposed Methods ---
function highlightExhibit(id: number) {
  // 确保在客户端环境
  if (!process.client || !L) return;
  
  console.log(`MuseumMap: Highlighting exhibit ${id}`);

  // Reset previously highlighted marker
  if (highlightedMarkerId.value !== null && markerLayers.value[highlightedMarkerId.value]) {
    try {
      markerLayers.value[highlightedMarkerId.value].setIcon(defaultIcon);
    } catch (e) { console.error("Error resetting previous marker icon:", e); }
  } else if (highlightedMarkerId.value !== null) {
    console.warn(`Previous highlighted marker ${highlightedMarkerId.value} not found in layers.`);
  }

  // Highlight the new marker
  const targetMarker = markerLayers.value[id];
  if (targetMarker) {
    try {
      targetMarker.setIcon(highlightedIcon);
      highlightedMarkerId.value = id;
      // Optional: Pan map to the highlighted marker smoothly
      if (mapInstance.value) {
        mapInstance.value.flyTo(targetMarker.getLatLng(), mapInstance.value.getZoom()); // Use flyTo for smoother transition
      }
    } catch (e) { console.error(`Error setting highlighted icon for marker ${id}:`, e); }
  } else {
    console.warn(`Marker with ID ${id} not found.`);
    highlightedMarkerId.value = null; // Ensure no ID is tracked if marker not found
  }
}

function zoomIn() {
  if (!process.client) return;
  
  console.log('MuseumMap: Executing Zoom In');
  if (mapInstance.value) {
    mapInstance.value.zoomIn();
  } else {
    console.warn('Zoom In called before map instance is ready.');
  }
}

function zoomOut() {
  if (!process.client) return;
  
  console.log('MuseumMap: Executing Zoom Out');
  if (mapInstance.value) {
    mapInstance.value.zoomOut();
  } else {
    console.warn('Zoom Out called before map instance is ready.');
  }
}

// Expose methods for the parent component (MapSection) to call
defineExpose({
  highlightExhibit,
  zoomIn,
  zoomOut
});
</script>

<style>
/* 可以在这里添加自定义样式，确保地图容器有合适的尺寸和外观 */
</style>
```

## floor1.geojson 和 floor2.geojson 修复

如果GeoJSON文件导入有问题，请检查它们是否是有效的JSON格式。以下是正确的GeoJSON格式示例：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "name": "Egyptian Collection",
        "level": 1
      },
      "geometry": {
        "type": "Point",
        "coordinates": [0.01, 0.01]
      }
    },
    // 其他特征...
  ]
}
```

请确保GeoJSON文件没有语法错误，特别是第二行的"`:`"令牌错误表明可能存在格式问题。

## 静态资源配置

为了使GeoJSON文件可以通过fetch访问，需要确保它们被正确放置在public目录下：

1. 创建目录：`public/assets/mapdata/`
2. 将GeoJSON文件复制到这个目录：
   - `public/assets/mapdata/floor1.geojson`
   - `public/assets/mapdata/floor2.geojson`

这样它们就可以通过`/assets/mapdata/floor1.geojson`这样的URL访问。

## nuxt.config.ts 配置

确保Leaflet正确配置，可以在`nuxt.config.ts`中添加以下配置：

```typescript
export default defineNuxtConfig({
  // 现有配置...
  
  modules: [
    // 其他模块...
    '@nuxtjs/leaflet',
  ],
  
  // Leaflet模块配置
  leaflet: {
    // 配置Leaflet模块选项
  },
  
  // 确保静态资源目录配置正确
  nitro: {
    preset: 'vercel',
    // 可能需要配置静态资源处理
  },
  
  // SSR设置（如果需要，可以禁用SSR避免Leaflet相关问题）
  ssr: false,
})
```

## 图标文件

确保以下图标文件存在于`public/icons/`目录下：
- marker-icon-blue.png
- marker-icon-blue-2x.png
- marker-icon-red.png
- marker-icon-red-2x.png
- marker-shadow.png

如果缺少这些文件，可以从Leaflet默认图标复制或创建自定义图标。

## 实施步骤

1. 首先更新MuseumMap.vue组件
2. 确保GeoJSON文件格式正确并放在正确位置
3. 确认所有必要的图标文件存在
4. 检查nuxt.config.ts配置
5. 重启开发服务器并测试地图是否正确渲染

## 测试

实施更改后，应该进行以下测试：
- 地图是否正确加载并显示
- 楼层切换是否正常工作
- 展品标记是否显示
- 展品高亮功能是否正常

如果仍然有问题，请检查浏览器控制台的错误消息以获取更多信息。