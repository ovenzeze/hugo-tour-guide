<template>
  <div class="bg-black/70 backdrop-blur-md rounded-xl shadow-lg border border-white/10 overflow-hidden transition-all duration-300"
       :class="[expanded ? 'max-h-[60vh]' : 'max-h-[120px]']"
       :style="{ marginBottom: expanded ? '80px' : '16px' }">
    <div class="p-4">
    <!-- 步骤卡片 -->
    <div v-if="stepData" class="flex gap-3 items-start w-full">
      <img :src="stepData.image || 'https://via.placeholder.com/80x80'" alt="Step Context" class="w-[70px] h-[70px] object-cover rounded-lg flex-shrink-0 border border-white/10">
      <div class="flex-grow text-sm">
        <p class="font-semibold mb-1.5 flex items-center"><icon name="ph:signpost" size="16" class="mr-1.5 flex-shrink-0"/> Step {{ stepData.number }}:</p>
        <p class="text-white/90 leading-relaxed">{{ stepData.description }}</p>
        <span v-if="!expanded" class="text-xs text-white/50 mt-1 flex items-center cursor-pointer" @click="expanded = true">
          <icon name="ph:caret-down" size="14" class="mr-1"/> 展开查看更多
        </span>
      </div>
      <div class="flex flex-col gap-1.5">
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" @click="$emit('close')">
          <span class="material-icons text-base">close</span>
        </button>
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
                @click="expanded = !expanded"
                :aria-expanded="expanded" 
                :aria-label="expanded ? '折叠卡片' : '展开卡片'">
          <icon :name="expanded ? 'ph:caret-up' : 'ph:caret-down'" size="18"/>
        </button>
      </div>
    </div>

    <!-- 欢迎卡片 -->
    <div v-else-if="welcomeData" class="flex gap-3 items-start w-full">
      <img :src="welcomeData.image || 'https://via.placeholder.com/80x80'" alt="Museum Image" class="w-[70px] h-[70px] object-cover rounded-lg flex-shrink-0 border border-white/10">
      <div class="flex-grow text-sm">
        <p class="font-semibold mb-1.5 flex items-center"><icon name="ph:info" size="16" class="mr-1.5 flex-shrink-0"/> {{ welcomeData.title }}</p>
        <p class="text-white/90 leading-relaxed">{{ welcomeData.description }}</p>
        <span v-if="!expanded" class="text-xs text-white/50 mt-1 flex items-center cursor-pointer" @click="expanded = true">
          <icon name="ph:caret-down" size="14" class="mr-1"/> 展开查看更多
        </span>
      </div>
      <div class="flex flex-col gap-1.5">
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" @click="$emit('close')">
          <span class="material-icons text-base">close</span>
        </button>
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
                @click="expanded = !expanded"
                :aria-expanded="expanded" 
                :aria-label="expanded ? '折叠卡片' : '展开卡片'">
          <icon :name="expanded ? 'ph:caret-up' : 'ph:caret-down'" size="18"/>
        </button>
      </div>
    </div>

    <!-- 展品卡片 -->
    <div v-else-if="exhibitData" class="flex gap-3 items-start w-full">
      <img :src="exhibitData.image || 'https://via.placeholder.com/80x80'" :alt="exhibitData.name" class="w-[70px] h-[70px] object-cover rounded-lg flex-shrink-0 border border-white/10">
      <div class="flex-grow text-sm">
        <p class="font-semibold mb-1.5 flex items-center"><icon name="ph:bank" size="16" class="mr-1.5 flex-shrink-0"/> {{ exhibitData.name }}</p>
        <p class="text-white/90 leading-relaxed">{{ exhibitData.description }}</p>
        <span v-if="!expanded" class="text-xs text-white/50 mt-1 flex items-center cursor-pointer" @click="expanded = true">
          <icon name="ph:caret-down" size="14" class="mr-1"/> 展开查看更多
        </span>
      </div>
      <div class="flex flex-col gap-1.5">
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" @click="exhibitData && $emit('details', exhibitData)">
          <icon name="ph:eye" size="18"/>
        </button>
        <button class="text-white/80 hover:text-white/100 flex-shrink-0 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
                @click="expanded = !expanded"
                :aria-expanded="expanded" 
                :aria-label="expanded ? '折叠卡片' : '展开卡片'">
          <icon :name="expanded ? 'ph:caret-up' : 'ph:caret-down'" size="18"/>
        </button>
      </div>
    </div>
    </div>

    <!-- 展开内容区域 -->
    <div v-show="expanded" class="px-4 pb-4 pt-2 border-t border-white/10 mt-0 text-white expanded-content overflow-y-auto">
      <!-- 展品详情扩展内容 -->
      <div v-if="exhibitData" class="text-sm">
        <h3 class="font-medium mb-2 flex items-center" v-if="exhibitData.additionalInfo">
          <icon name="ph:info" size="16" class="mr-1.5 flex-shrink-0"/> Additional Information
        </h3>
        <p class="text-white/90 mb-4 leading-relaxed" v-if="exhibitData.additionalInfo">
          {{ exhibitData.additionalInfo }}
        </p>
        
        <h3 class="font-medium mb-2 flex items-center" v-if="exhibitData.relatedExhibits && exhibitData.relatedExhibits.length > 0">
          <icon name="ph:circles-three-plus" size="16" class="mr-1.5 flex-shrink-0"/> Related Exhibits
        </h3>
        <div class="flex gap-2 overflow-x-auto pb-3 hide-scrollbar" v-if="exhibitData.relatedExhibits && exhibitData.relatedExhibits.length > 0">
          <div v-for="(related, index) in exhibitData.relatedExhibits" :key="related.id || index" class="w-20 h-20 bg-white/10 rounded-lg flex-shrink-0 flex flex-col items-center justify-center p-1">
            <img v-if="related.thumbnail" :src="related.thumbnail" :alt="related.name" class="w-full h-12 object-cover rounded mb-1">
            <span class="text-xs text-white/60 text-center line-clamp-2">{{ related.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 步骤详情扩展内容 -->
      <div v-if="stepData" class="text-sm">
        <h3 class="font-medium mb-2 flex items-center" v-if="stepData.directions && stepData.directions.length > 0">
          <icon name="ph:signpost" size="16" class="mr-1.5 flex-shrink-0"/> Directions
        </h3>
        <ul class="list-disc list-inside text-white/90 mb-3 pl-1 space-y-2" v-if="stepData.directions && stepData.directions.length > 0">
          <li v-for="(direction, index) in stepData.directions" :key="index">{{ direction }}</li>
        </ul>
        
        <h3 class="font-medium mb-2 flex items-center" v-if="stepData.audioAvailable">
          <icon name="ph:headphones" size="16" class="mr-1.5 flex-shrink-0"/> Audio Guide
        </h3>
        <button v-if="stepData.audioAvailable" 
                class="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white/90 w-full mb-3 transition-colors"
                @click="$emit('play-audio', stepData)">
          <icon name="ph:play" size="18" class="mr-1"/> Play Audio Guide
        </button>
      </div>
      
      <!-- 欢迎卡片扩展内容 -->
      <div v-if="welcomeData" class="text-sm">
        <h3 class="font-medium mb-2 flex items-center" v-if="welcomeData.tourOptions && welcomeData.tourOptions.length > 0">
          <icon name="ph:compass-tool" size="16" class="mr-1.5 flex-shrink-0"/> Tour Options
        </h3>
        <div class="space-y-2 text-white/90" v-if="welcomeData.tourOptions && welcomeData.tourOptions.length > 0">
          <p v-for="(option, index) in welcomeData.tourOptions" :key="index">• {{ option }}</p>
        </div>
        
        <h3 class="font-medium mb-2 flex items-center mt-4" v-if="welcomeData.hours">
          <icon name="ph:clock" size="16" class="mr-1.5 flex-shrink-0"/> Opening Hours
        </h3>
        <div class="space-y-0.5 text-white/90" v-if="welcomeData.hours">
          <p v-for="(hour, day) in welcomeData.hours" :key="day">{{ day }}: {{ hour }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 添加展开/折叠状态
const expanded = ref(false);

// 定义类型
type StepData = {
  number: number;
  description: string;
  image?: string;
  directions?: string[];
  audioAvailable?: boolean;
};

type WelcomeData = {
  title: string;
  description: string;
  image?: string;
  tourOptions?: string[];
  hours?: Record<string, string>;
};

type ExhibitData = {
  id: number;
  name: string;
  description: string;
  image?: string;
  floor?: number;
  additionalInfo?: string;
  relatedExhibits?: {
    id: number;
    name: string;
    thumbnail?: string;
  }[];
};

type CardData = StepData | WelcomeData | ExhibitData;

// 属性定义
const props = defineProps<{
  type: 'step' | 'welcome' | 'exhibit';
  data: CardData;
}>();

// 事件定义
defineEmits(['close', 'details', 'play-audio']);

// --- Computed properties for type-safe data access ---
const stepData = computed(() => {
  return props.type === 'step' ? props.data as StepData : null;
});

const welcomeData = computed(() => {
  return props.type === 'welcome' ? props.data as WelcomeData : null;
});

const exhibitData = computed(() => {
  return props.type === 'exhibit' ? props.data as ExhibitData : null;
});
</script>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.expanded-content {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.expanded-content[v-show="false"] {
  opacity: 0;
  transform: translateY(-10px);
}


</style> 