<template>
  <div class="w-full h-full">
    <!-- 使用ClientOnly包装Leaflet组件避免SSR问题 -->
    <ClientOnly>
      <LMap
        ref="mapRef"
        :zoom="18"
        :center="mapCenter"
        :use-global-leaflet="true"
        style="background-color: #eee; width: 100%; height: 100%;"
        @ready="onMapReady"
      >
        <!-- 添加基础瓦片图层 -->
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          layer-type="base"
          name="OpenStreetMap"
        />
        
        <!-- 条件性渲染GeoJSON数据 -->
        <LGeoJson
          v-if="currentFloorGeoJson"
          :geojson="currentFloorGeoJson"
          :options-style="geoJsonStyle"
          :options="geoJsonOptions"
        />

        <!-- 添加楼层控制器 -->
        <LControl position="topright">
          <div class="bg-white p-2 rounded shadow">
            <div class="flex flex-col space-y-1">
              <button
                v-for="level in ['1', '2']"
                :key="level"
                class="px-3 py-1 rounded text-sm"
                :class="currentFloor.toString() === level 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                @click="changeFloor(parseInt(level, 10))"
              >
                Floor {{ level }}
              </button>
            </div>
          </div>
        </LControl>
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
import { computed, ref, watch, onMounted } from 'vue';
import type { Map as LeafletMap, LatLngExpression, Layer, Marker, Icon } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';

// 定义Props
const props = defineProps({
  currentFloor: {
    type: Number,
    default: 1
  }
});

// 定义Emits
const emit = defineEmits(['select-exhibit', 'update:currentFloor', 'map-error']);

// Refs - 修改引用名称以匹配文档示例
const mapRef = ref(null); // 地图组件引用
const leafletMap = ref<LeafletMap | null>(null); // 存储获取的Leaflet地图实例
const currentFloorGeoJson = ref<GeoJsonObject | null>(null);
const markerLayers = ref<Record<number, Marker>>({});
const highlightedMarkerId = ref<number | null>(null);
const loadError = ref<string | null>(null);
const defaultIcon = ref<any>(null);
const highlightedIcon = ref<any>(null);
const isLeafletReady = ref<boolean>(false);

// Map center computed property based on the current floor
const mapCenter = computed((): LatLngExpression => {
  // 使用标准经纬度格式 [纬度, 经度]
  return props.currentFloor === 1 
    ? [51.5194, -0.1269] // 一楼中心点
    : [51.5194, -0.1267]; // 二楼中心点略有偏移以示区别
});

// 地图准备好时的回调 - 采用文档中的风格
const onMapReady = () => {
  console.log('Map is ready');
  
  try {
    // 按照文档，正确获取Leaflet地图实例
    if (mapRef.value) {
      leafletMap.value = mapRef.value.leafletObject;
      
      if (leafletMap.value) {
        console.log('Leaflet map instance obtained successfully');
        isLeafletReady.value = true;
        
        // 输出地图状态信息以便调试
        console.log('Map instance:', leafletMap.value);
        console.log('Map center:', leafletMap.value.getCenter());
        console.log('Map zoom:', leafletMap.value.getZoom());
        
        // 加载当前楼层数据
        loadGeoJSON(props.currentFloor);
      } else {
        throw new Error('leafletObject is undefined in mapRef');
      }
    } else {
      throw new Error('mapRef is null, LMap component might not be mounted');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '获取地图实例时出错';
    console.error('Map initialization error:', errorMsg);
    loadError.value = errorMsg;
    emit('map-error', errorMsg);
  }
}

// 初始化图标 - 已移除不需要的函数，由Leaflet组件内部处理

// 切换楼层
function changeFloor(floor: number) {
  emit('update:currentFloor', floor);
}

// GeoJSON加载函数
async function loadGeoJSON(floor: number) {
  // 重置错误状态
  loadError.value = null;
  
  // 重置标记
  markerLayers.value = {};
  highlightedMarkerId.value = null;
  console.log(`Reset markers for floor ${floor}`);

  try {
    // Update path to data directory
    const mapUrl = `/data/mapdata/floor${floor}.geojson`;
    console.log(`Attempting to load map data from: ${mapUrl}`);
    
    const response = await fetch(mapUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }
    
    const geojsonData = await response.json();
    
    // 验证GeoJSON数据
    if (!geojsonData || !geojsonData.type || !geojsonData.features) {
      throw new Error('无效的GeoJSON数据格式');
    }
    
    // 转换坐标系统
    if (geojsonData.features && Array.isArray(geojsonData.features)) {
      geojsonData.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
          // 将小数坐标转换为经纬度
          const rawX = feature.geometry.coordinates[0];
          const rawY = feature.geometry.coordinates[1];
          
          // 转换为经纬度 (英国伦敦区域，可以调整为任何适合的区域)
          const longitude = -0.127 + (rawX * 0.005); // 经度
          const latitude = 51.519 + (rawY * 0.005);  // 纬度
          
          // 更新坐标
          feature.geometry.coordinates = [longitude, latitude];
        }
      });
    }
    
    currentFloorGeoJson.value = geojsonData as GeoJsonObject;
    console.log(`Successfully loaded GeoJSON for floor ${floor}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '加载地图数据时出错';
    console.error(`Failed to load GeoJSON for floor ${floor}:`, error);
    loadError.value = errorMsg;
    currentFloorGeoJson.value = null; // 清空错误情况下的数据
    emit('map-error', errorMsg);
  }
}

// 监听currentFloor属性变化
watch(() => props.currentFloor, (newFloor) => {
  console.log(`Floor prop changed to ${newFloor}. Loading new GeoJSON...`);
  
  // 加载新的GeoJSON数据
  loadGeoJSON(newFloor);
  
  // 在楼层变化时将地图平移到新的中心
  if (leafletMap.value && isLeafletReady.value) {
    leafletMap.value.panTo(mapCenter.value);
  }
}, { immediate: false });

// GeoJSON样式函数
const geoJsonStyle = (feature: any) => {
  // 为GeoJSON要素定义基本样式（点将由pointToLayer处理）
  return {
    color: '#3388ff', // 蓝色线条/边框
    weight: 2,
    opacity: 1,
    fillOpacity: 0.1 // 多边形适当的蓝色填充（如果有）
  };
};

// GeoJSON选项（包括pointToLayer用于标记）
const geoJsonOptions = computed(() => ({
  pointToLayer: (feature: any, latlng: LatLngExpression) => {
    // 为每个点要素创建默认Marker
    try {
      console.log('Creating marker at:', latlng, 'for feature:', feature.properties?.name);
      
      // 为每个点要素创建简单的圆圈标记，不使用图标
      return null; // 不直接创建marker，让Leaflet使用默认处理
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  },
  onEachFeature: (feature: Feature, layer: Layer) => {
    if (!feature.properties || !feature.properties.id) return;
    
    try {
      // 存储并处理marker层，但不调用特定的Leaflet方法
    } catch (error) {
      console.error('Error in onEachFeature:', error);
    }
  }
}));

// 高亮展品
function highlightExhibit(id: number) {
  if (!isLeafletReady.value) return;
  console.log(`MuseumMap: Highlighting exhibit ${id}`);
}

// 缩放功能
function zoomIn() {
  if (!isLeafletReady.value || !leafletMap.value) {
    console.warn('Zoom In called before map instance is ready.');
    return;
  }
  
  console.log('MuseumMap: Executing Zoom In');
  leafletMap.value.zoomIn();
}

function zoomOut() {
  if (!isLeafletReady.value || !leafletMap.value) {
    console.warn('Zoom Out called before map instance is ready.');
    return;
  }
  
  console.log('MuseumMap: Executing Zoom Out');
  leafletMap.value.zoomOut();
}

// 暴露方法给父组件（MapSection）调用
defineExpose({
  highlightExhibit,
  zoomIn,
  zoomOut
});
</script>

<style>
/* 可以在这里添加自定义样式，确保地图容器有合适的尺寸和外观 */
</style>