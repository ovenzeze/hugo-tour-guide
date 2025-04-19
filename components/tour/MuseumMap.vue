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
import { computed, ref, watch } from 'vue';
import * as L from 'leaflet'; // 使用命名导入
import type { Map as LeafletMap, LatLngExpression, Layer, Marker } from 'leaflet';
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

// Map center computed property based on the current floor
const mapCenter = computed((): LatLngExpression => {
  // 使用标准经纬度格式 [纬度, 经度]
  // 转换已有的小数坐标为真实地理坐标，以便与底图对齐
  // 以下是伦敦大英博物馆的大致坐标，可以根据需要调整为您的博物馆位置
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
        
        // 输出地图状态信息以便调试
        console.log('Map instance:', leafletMap.value);
        console.log('Map center:', leafletMap.value.getCenter());
        console.log('Map zoom:', leafletMap.value.getZoom());
        
        // 地图准备好后初始化图标
        initializeIcons();
        
        // 加载当前楼层数据
        loadGeoJson(props.currentFloor);
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

// 初始化图标
function initializeIcons() {
  // 确保在客户端环境
  if (!process.client) return;
  
  try {
    defaultIcon.value = L.icon({
      iconUrl: '/icons/marker-icon-blue.png',
      iconRetinaUrl: '/icons/marker-icon-blue-2x.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '/icons/marker-shadow.png',
      shadowSize: [41, 41]
    });

    highlightedIcon.value = L.icon({
      iconUrl: '/icons/marker-icon-red.png',
      iconRetinaUrl: '/icons/marker-icon-red-2x.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '/icons/marker-shadow.png',
      shadowSize: [41, 41]
    });
    
    console.log('Leaflet marker icons initialized');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '初始化图标时出错';
    console.error('Error initializing icons:', error);
    emit('map-error', errorMsg);
  }
}

// 切换楼层
function changeFloor(floor: number) {
  emit('update:currentFloor', floor);
}

// GeoJSON加载函数
async function loadGeoJson(floor: number) {
  // 重置错误状态
  loadError.value = null;
  
  // 重置标记
  markerLayers.value = {};
  highlightedMarkerId.value = null;
  console.log(`Reset markers for floor ${floor}`);

  try {
    // 使用fetch API加载GeoJSON数据
    const mapUrl = `/assets/mapdata/floor${floor}.geojson`;
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
    // 注意：这是示例转换，如果您的数据已经使用标准经纬度，则不需要此步骤
    if (geojsonData.features && Array.isArray(geojsonData.features)) {
      geojsonData.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
          // 将小数坐标转换为经纬度
          // 这里假设coordinates[0]是x坐标(相当于经度)，coordinates[1]是y坐标(相当于纬度)
          // 将这些小值映射到英国伦敦的区域(仅作示例，根据实际需要调整)
          const rawX = feature.geometry.coordinates[0]; // 假设原始x值范围为0-0.1
          const rawY = feature.geometry.coordinates[1]; // 假设原始y值范围为0-0.1
          
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
  loadGeoJson(newFloor);
  
  // 在楼层变化时将地图平移到新的中心
  if (leafletMap.value) {
    leafletMap.value.panTo(mapCenter.value);
  }
}, { immediate: false }); // 改为 false，因为我们在 onMapReady 中已经初始加载

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
    if (!process.client) return null;
    
    if (!L || !defaultIcon.value) {
      console.warn('Leaflet or icons not ready yet for pointToLayer');
      return null;
    }
    
    try {
      console.log('Creating marker at:', latlng, 'for feature:', feature.properties?.name);
      
      // 为每个点要素创建默认Leaflet标记
      const marker = L.marker(latlng, { icon: defaultIcon.value });
      
      // 添加显示展品名称的工具提示
      marker.bindTooltip(feature.properties?.name || 'Unknown Exhibit');
      
      // 为标记添加点击事件监听器
      marker.on('click', () => {
        console.log('Exhibit marker clicked:', feature.properties);
        // 用展品ID发出select-exhibit事件
        emit('select-exhibit', { id: feature.properties?.id });
      });
      
      return marker; // 返回创建的标记
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  },
  onEachFeature: (feature: Feature, layer: Layer) => {
    if (!process.client) return;
    
    if (!feature.properties || !feature.properties.id) return;
    
    try {
      // 使用安全的类型检查
      if (L.Marker && layer instanceof L.Marker) {
        console.log('Storing marker for feature ID:', feature.properties.id);
        markerLayers.value[feature.properties.id] = layer as unknown as Marker;
      }
    } catch (error) {
      console.error('Error in onEachFeature:', error);
    }
  },
  // 确保坐标数组解释正确（GeoJSON中通常是[经度,纬度]，而Leaflet期望[纬度,经度]）
  coordsToLatLng: (coords: number[]) => {
    // 注意：如果坐标已在loadGeoJson方法中转换，可能不需要此转换
    // return L.latLng(coords[1], coords[0]); // 标准GeoJSON转换
    return L.latLng(coords[1], coords[0]); // 经度,纬度 -> 纬度,经度
  }
}));

// 高亮展品
function highlightExhibit(id: number) {
  if (!process.client) return;
  
  if (!L || !highlightedIcon.value || !defaultIcon.value) {
    console.warn('Leaflet or icons not available for highlighting');
    return;
  }
  
  console.log(`MuseumMap: Highlighting exhibit ${id}`);

  // 重置之前高亮的标记
  if (highlightedMarkerId.value !== null && markerLayers.value[highlightedMarkerId.value]) {
    try {
      markerLayers.value[highlightedMarkerId.value].setIcon(defaultIcon.value);
    } catch (e) { console.error("Error resetting previous marker icon:", e); }
  } else if (highlightedMarkerId.value !== null) {
    console.warn(`Previous highlighted marker ${highlightedMarkerId.value} not found in layers.`);
  }

  // 高亮新标记
  const targetMarker = markerLayers.value[id];
  if (targetMarker) {
    try {
      targetMarker.setIcon(highlightedIcon.value);
      highlightedMarkerId.value = id;
      // 可选：平滑地将地图平移到高亮的标记
      if (leafletMap.value) {
        leafletMap.value.flyTo(targetMarker.getLatLng(), leafletMap.value.getZoom()); // 使用flyTo进行更平滑的过渡
      }
    } catch (e) { console.error(`Error setting highlighted icon for marker ${id}:`, e); }
  } else {
    console.warn(`Marker with ID ${id} not found.`);
    highlightedMarkerId.value = null; // 确保在未找到标记时不跟踪ID
  }
}

// 缩放功能
function zoomIn() {
  if (!process.client || !leafletMap.value) {
    console.warn('Zoom In called before map instance is ready.');
    return;
  }
  
  console.log('MuseumMap: Executing Zoom In');
  leafletMap.value.zoomIn();
}

function zoomOut() {
  if (!process.client || !leafletMap.value) {
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