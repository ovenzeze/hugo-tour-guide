import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ExhibitItem {
  id: number;
  name: string;
  location: string;
  floor: number;
  highlight: boolean;
  description?: string;
}

export const useTourStore = defineStore('tour', () => {
  // 当前楼层
  const currentFloor = ref(1)
  
  // 推荐路线数据
  const routeItems = ref<ExhibitItem[]>([
    { id: 1, name: 'Egyptian Collection', location: 'Floor 1, Room 4', floor: 1, highlight: false },
    { id: 2, name: 'Greek Sculptures', location: 'Floor 1, Room 7', floor: 1, highlight: false },
    { id: 3, name: 'Renaissance Paintings', location: 'Floor 2, Room 3', floor: 2, highlight: false },
    { id: 4, name: 'Modern Art Gallery', location: 'Floor 2, Room 8', floor: 2, highlight: false }
  ])
  
  // 特色展品数据
  const featuredExhibits = ref([
    {
      id: 101,
      name: 'The Rosetta Stone',
      description: 'Ancient Egyptian artifact, key to deciphering hieroglyphics',
      floor: 1
    },
    {
      id: 102,
      name: 'Venus de Milo',
      description: 'Ancient Greek sculpture from the Hellenistic period',
      floor: 1
    },
    {
      id: 103,
      name: 'Mona Lisa',
      description: 'Leonardo da Vinci\'s masterpiece portrait',
      floor: 2
    }
  ])
  
  // 当前高亮的展品
  const highlightedExhibit = ref<ExhibitItem | null>(null)
  
  // 语音指导状态
  const isGuideExplaining = ref(false)
  
  // 方法: 高亮展品
  function highlightExhibit(item: ExhibitItem) {
    // 重置所有展品的高亮状态
    routeItems.value.forEach(exhibit => exhibit.highlight = false)
    
    // 设置当前展品为高亮
    item.highlight = true
    highlightedExhibit.value = item
    
    return item
  }
  
  return {
    currentFloor,
    routeItems,
    featuredExhibits,
    highlightedExhibit,
    isGuideExplaining,
    highlightExhibit
  }
})
