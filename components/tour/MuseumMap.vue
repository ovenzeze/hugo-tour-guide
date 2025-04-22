<template>
  <div class="w-full h-full">
    <!-- 使用ClientOnly包装Leaflet组件避免SSR问题 -->
    <ClientOnly>
      <div v-if="useImageMap" class="relative w-full h-full">
        <!-- 图片地图模式 -->
        <div class="absolute inset-0 overflow-hidden">
          <img
            :src="currentFloorImageUrl"
            alt="Floor map"
            class="w-full h-full object-contain"
            @click="onMapImageClick"
          />
        </div>
        
        <!-- 楼层控制器 -->
        <div class="absolute top-2 right-2 bg-white p-2 rounded shadow z-10">
          <div class="flex flex-col space-y-1">
            <button
              v-for="floor in availableFloors"
              :key="floor.id"
              class="px-3 py-1 rounded text-sm"
              :class="currentFloor.toString() === floor.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              @click="changeFloor(floor.id)"
            >
              {{ floor.name }}
            </button>
          </div>
        </div>

        <!-- 展品标记点 -->
        <div v-for="marker in currentFloorMarkers" :key="marker.id" 
          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          :style="{ left: `${marker.x}%`, top: `${marker.y}%` }"
          @click="selectExhibit(marker.id)">
          <div class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="[
              highlightedMarkerId === marker.id 
                ? 'bg-yellow-500 text-white shadow-lg scale-125' 
                : 'bg-blue-500 text-white'
            ]">
            {{ marker.label || marker.id }}
          </div>
        </div>
      </div>

      <!-- 原有的Leaflet地图 -->
      <LMap
        v-else
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
      <div v-if="(!currentFloorGeoJson && !loadError && !useImageMap) || (useImageMap && !imageLoaded)" 
           class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
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

// 图片地图模式
const useImageMap = ref(true); // 切换到图片地图模式
const imageLoaded = ref(false);

// 定义可用楼层
const availableFloors = [
  { id: 'ground', name: 'Ground Floor' },
  { id: 'floor1', name: 'Floor 1' },
  { id: 'floor2-3', name: 'Floor 2-3' }
];

// 楼层图片URL
const currentFloorImageUrl = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return `/data/mapdata/floor-images/${floorId}/${floorId}.png`;
});

// 模拟的展品标记点数据
const exhibitMarkers = {
  'ground': [
    { id: 1, x: 50, y: 30, label: '1', name: 'Great Hall' },
    { id: 2, x: 20, y: 40, label: '2', name: 'Egyptian Art' },
    { id: 3, x: 75, y: 60, label: '3', name: 'Greek and Roman Art' }
  ],
  'floor1': [
    { id: 4, x: 50, y: 25, label: '1', name: 'European Sculpture' },
    { id: 5, x: 30, y: 45, label: '2', name: 'Medieval Art' },
    { id: 6, x: 70, y: 65, label: '3', name: 'The American Wing' }
  ],
  'floor2-3': [
    { id: 7, x: 25, y: 25, label: '1', name: 'Modern Art' },
    { id: 8, x: 60, y: 40, label: '2', name: 'European Paintings' },
    { id: 9, x: 75, y: 60, label: '3', name: 'Asian Art' }
  ]
};

// 当前楼层的标记点
const currentFloorMarkers = computed(() => {
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  return exhibitMarkers[floorId] || [];
});

// 图片地图点击事件
function onMapImageClick(event: MouseEvent) {
  if (!event.target) return;
  
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  console.log(`点击位置: ${x.toFixed(2)}%, ${y.toFixed(2)}%`);
  
  // 寻找最近的展品点
  const floorId = props.currentFloor === 1 ? 'floor1' : 
                 props.currentFloor === 2 ? 'floor2-3' : 'ground';
  const markers = exhibitMarkers[floorId] || [];
  
  let closestMarker = null;
  let minDistance = Infinity;
  
  markers.forEach(marker => {
    const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
    if (distance < minDistance && distance < 10) { // 10%的点击容差
      minDistance = distance;
      closestMarker = marker;
    }
  });
  
  if (closestMarker) {
    selectExhibit(closestMarker.id);
  }
}

// 选择展品
function selectExhibit(id: number) {
  highlightedMarkerId.value = id;
  emit('select-exhibit', { id });
}

// 加载图片
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageLoaded.value = true;
      resolve();
    };
    img.onerror = () => {
      imageLoaded.value = false;
      loadError.value = `无法加载图片: ${url}`;
      reject(new Error(`无法加载图片: ${url}`));
    };
    img.src = url;
  });
}

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

// 切换楼层
function changeFloor(floor: number | string) {
  emit('update:currentFloor', typeof floor === 'string' ? floor : floor);
  
  if (useImageMap.value) {
    // 在图片模式下预加载图片
    const floorId = floor.toString();
    preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
      .catch(error => {
        console.error('Error loading floor image:', error);
        loadError.value = error.message;
      });
  } else if (leafletMap.value && isLeafletReady.value) {
    // 在楼层变化时将地图平移到新的中心
    leafletMap.value.panTo(mapCenter.value);
  }
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
  console.log(`Floor prop changed to ${newFloor}. Loading new data...`);
  
  if (useImageMap.value) {
    // 在图片模式下不需要加载GeoJSON
    const floorId = newFloor === 1 ? 'floor1' : 
                   newFloor === 2 ? 'floor2-3' : 'ground';
    
    preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
      .catch(error => {
        console.error('Error loading floor image:', error);
        loadError.value = error.message;
      });
    
    // 重置高亮状态
    highlightedMarkerId.value = null;
  } else {
    // 加载新的GeoJSON数据
    loadGeoJSON(newFloor);
    
    // 在楼层变化时将地图平移到新的中心
    if (leafletMap.value && isLeafletReady.value) {
      leafletMap.value.panTo(mapCenter.value);
    }
  }
}, { immediate: true });

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
  console.log(`MuseumMap: Highlighting exhibit ${id}`);
  
  if (useImageMap.value) {
    // 在图片模式下直接设置高亮ID
    highlightedMarkerId.value = id;
    return;
  }
  
  // Reset previously highlighted marker
  if (highlightedMarkerId.value !== null && markerLayers.value[highlightedMarkerId.value]) {
    try {
      markerLayers.value[highlightedMarkerId.value].setIcon(defaultIcon.value);
    } catch (e) { console.error("Error resetting previous marker icon:", e); }
  } else if (highlightedMarkerId.value !== null) {
    console.warn(`Previous highlighted marker ${highlightedMarkerId.value} not found in layers.`);
  }

  // Highlight the new marker
  const targetMarker = markerLayers.value[id];
  if (targetMarker) {
    try {
      targetMarker.setIcon(highlightedIcon.value);
      highlightedMarkerId.value = id;
      // Optional: Pan map to the highlighted marker smoothly
      if (leafletMap.value) {
        leafletMap.value.flyTo(targetMarker.getLatLng(), leafletMap.value.getZoom()); // Use flyTo for smoother transition
      }
    } catch (e) { console.error(`Error setting highlighted icon for marker ${id}:`, e); }
  } else {
    console.warn(`Marker with ID ${id} not found.`);
    highlightedMarkerId.value = null; // Ensure no ID is tracked if marker not found
  }
}

// 缩放功能
function zoomIn() {
  if (useImageMap.value) {
    // 在图片模式下不支持缩放
    console.warn('Zoom not supported in image mode');
    return;
  }
  
  if (leafletMap.value && isLeafletReady.value) {
    leafletMap.value.zoomIn();
  } else {
    console.warn('Zoom In called before map instance is ready.');
  }
}

function zoomOut() {
  if (useImageMap.value) {
    // 在图片模式下不支持缩放
    console.warn('Zoom not supported in image mode');
    return;
  }
  
  if (leafletMap.value && isLeafletReady.value) {
    leafletMap.value.zoomOut();
  } else {
    console.warn('Zoom Out called before map instance is ready.');
  }
}

// 初始化
onMounted(() => {
  if (useImageMap.value) {
    // 在图片模式下预加载第一张图片
    const floorId = props.currentFloor === 1 ? 'floor1' : 
                   props.currentFloor === 2 ? 'floor2-3' : 'ground';
    
    preloadImage(`/data/mapdata/floor-images/${floorId}/${floorId}.png`)
      .catch(error => {
        console.error('Error loading initial floor image:', error);
        loadError.value = error.message;
      });
  }
});

// 暴露方法给父组件
defineExpose({
  highlightExhibit,
  zoomIn,
  zoomOut
});
</script>

<style>
/* 可以在这里添加自定义样式，确保地图容器有合适的尺寸和外观 */
.floor-map-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.marker-container {
  transition: all 0.3s ease;
}

.marker-container:hover {
  transform: scale(1.2);
}
</style>