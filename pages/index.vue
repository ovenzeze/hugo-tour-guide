<template>
  <div class="container mx-auto p-4">
    <!-- 筛选栏 -->
    <div
      class="flex flex-wrap gap-3 items-center mb-4"
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
    >
      <Combobox v-model="selectedType" :options="typeOptions" placeholder="Type" class="w-32" />
      <Combobox v-model="selectedRegion" :options="regionOptions" placeholder="Region" class="w-32" />
      <Select v-model="selectedTime" :options="timeOptions" placeholder="Open Time" class="w-32" />
      <div class="flex items-center gap-1">
        <Checkbox v-model="onlyFavorite" id="onlyFavorite" />
        <label for="onlyFavorite" class="text-sm select-none cursor-pointer">Only Favorites</label>
      </div>
    </div>
    <!-- 列表区 -->
    <TransitionGroup
      name="list"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5"
    >
      <Card
        v-for="(item, index) in filteredList"
        :key="item.id"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 0.3 + index * 0.05,
            duration: 0.6
          }
        }"
        class="relative group overflow-hidden shadow transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl flex flex-col h-full pt-0 pb-3 gap-0 cursor-pointer"
        @click="navigateToDetail(item)"
      >
        <CardContent class="p-0">
          <div class="relative">
            <img :src="item.cover" class="w-full h-40 object-cover rounded-t-2xl transition-all duration-200" alt="cover" />
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white"
              @click.stop="toggleFavorite(item)"
              :aria-label="item.favorite ? 'Unfavorite' : 'Favorite'"
              v-motion:click="{ scale: [1, 1.2, 1], transition: { duration: 0.3 } }"
            >
              <span class="sr-only">Favorite</span>
              <div class="group relative">
                <Icon :name="item.favorite ? 'ph:heart-fill' : 'ph:heart'" class="text-red-900 transition-transform group-hover:scale-110" />
                <span class="absolute left-1/2 -translate-x-1/2 top-full mt-4 px-2 py-2 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                  {{ item.favorite ? 'Unfavorite' : 'Favorite' }}
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
        
        <CardHeader class="px-4 py-4">
          <CardTitle class="text-lg font-semibold mb-1">{{ item.name }}</CardTitle>
          <CardDescription class="text-gray-500 line-clamp-2">{{ item.desc }}</CardDescription>
        </CardHeader>
        
        <CardFooter class="px-4 pt-0 mt-auto ">
          <div class="w-full">
            <div class="flex gap-4 mb-3 flex-wrap">
              <Badge v-for="tag in item.tags" :key="tag" variant="secondary" class="text-xs py-0.5">{{ tag }}</Badge>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <Icon name="ph:map-pin" class="w-4 h-4" /> {{ item.distance }}km
              </div>
              <div class="flex items-center gap-1">
                <Icon name="ph:star" class="text-yellow-400 w-4 h-4" /> {{ item.rating }}
              </div>
            </div>
          </div>
        </CardFooter>
        
      </Card>
    </TransitionGroup>
    <!-- 空状态 -->
    <div
      v-if="filteredList.length === 0"
      class="flex flex-col items-center justify-center h-60"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 0.5 } }"
    >
      <Alert variant="default" class="mt-10 text-center">
        No items found, try adjusting your filters.
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '#components'
import { computed, onMounted, ref } from 'vue'
import { useMotion } from '@vueuse/motion'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Combobox } from '~/components/ui/combobox'
import { Select } from '~/components/ui/select'

const typeOptions = [
  { label: 'All', value: '' }, { label: 'Museum', value: 'museum' }, { label: 'Local', value: 'local' }
]
const regionOptions = [
  { label: 'All', value: '' }, { label: 'Downtown', value: 'downtown' }, { label: 'Suburb', value: 'suburb' }
]
const timeOptions = [
  { label: 'Any', value: '' }, { label: 'Open Now', value: 'open' }, { label: 'Morning', value: 'morning' }
]
const onlyFavorite = ref(false)
const selectedType = ref('')
const selectedRegion = ref('')
const selectedTime = ref('')

// 定义项目类型
interface TourItem {
  id: number
  name: string
  cover: string
  desc: string
  tags: string[]
  distance: number
  rating: number
  favorite: boolean
  type: string
  region: string
}

// mock数据，图片全部使用unsplash公开可访问资源
const items = ref<TourItem[]>([])

onMounted(() => {
  // 模拟API请求
  setTimeout(() => {
    items.value = [
      { id: 1, name: 'City Museum', cover: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80', desc: 'Art & History', tags: ['Family', 'Art'], distance: 1.2, rating: 4.7, favorite: false, type: 'museum', region: 'downtown' },
      { id: 2, name: 'Local Pottery Class', cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', desc: 'Hands-on Experience', tags: ['DIY'], distance: 2.3, rating: 4.9, favorite: true, type: 'local', region: 'suburb' },
      { id: 3, name: 'Science Center', cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', desc: 'Interactive Science', tags: ['Kids', 'Tech'], distance: 0.8, rating: 4.6, favorite: false, type: 'museum', region: 'downtown' },
      { id: 4, name: 'Street Art Walk', cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', desc: 'Outdoor Art Tour', tags: ['Art', 'Outdoor'], distance: 3.1, rating: 4.8, favorite: false, type: 'local', region: 'downtown' },
      { id: 5, name: 'History Museum', cover: 'https://images.unsplash.com/photo-1468449032589-876ed4b3eafe?auto=format&fit=crop&w=600&q=80', desc: 'Local History', tags: ['History'], distance: 2.6, rating: 4.5, favorite: false, type: 'museum', region: 'suburb' },
      { id: 6, name: 'Cooking Workshop', cover: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', desc: 'Taste & Learn', tags: ['Food', 'DIY'], distance: 1.9, rating: 4.9, favorite: false, type: 'local', region: 'suburb' }
    ]
  }, 400)
})

const filteredList = computed(() => {
  return items.value.filter(item =>
    (!selectedType.value || item.type === selectedType.value) &&
    (!selectedRegion.value || item.region === selectedRegion.value) &&
    (!selectedTime.value || selectedTime.value === 'open') && // 可扩展时间筛选逻辑
    (!onlyFavorite.value || item.favorite)
  )
})
function toggleFavorite(item: TourItem) {
  item.favorite = !item.favorite
}

// 导航到详情页
function navigateToDetail(item: TourItem) {
  navigateTo('/tour');
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.list-move {
  transition: transform 0.5s ease;
}
</style>
