import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ExhibitItem {
  id: number;
  name: string;
  location: string;
  floor: number;
  highlight: boolean;
  description?: string;
}

export interface Museum {
  id: string;
  name: string;
  description: string;
  location: string;
  routeItems: ExhibitItem[];
  featuredExhibits: {
    id: number;
    name: string;
    description: string;
    floor: number;
  }[];
}

export const useTourStore = defineStore('tour', () => {
  // 当前楼层
  const currentFloor = ref(1)
  
  // 当前选中的博物馆ID
  const currentMuseumId = ref('metropolitan')
  
  // 博物馆数据集合
  const museums = ref<Museum[]>([
    {
      id: 'metropolitan',
      name: 'Metropolitan Museum of Art',
      description: 'One of the world\'s largest and finest art museums',
      location: 'New York, USA',
      routeItems: [
        { id: 1, name: 'Egyptian Collection', location: 'Floor 1, Room 4', floor: 1, highlight: false },
        { id: 2, name: 'Greek Sculptures', location: 'Floor 1, Room 7', floor: 1, highlight: false },
        { id: 3, name: 'Renaissance Paintings', location: 'Floor 2, Room 3', floor: 2, highlight: false },
        { id: 4, name: 'Modern Art Gallery', location: 'Floor 2, Room 8', floor: 2, highlight: false }
      ],
      featuredExhibits: [
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
      ]
    },
    {
      id: 'louvre',
      name: 'Louvre Museum',
      description: 'The world\'s most-visited museum',
      location: 'Paris, France',
      routeItems: [
        { id: 1, name: 'Mona Lisa', location: 'Floor 1, Denon Wing', floor: 1, highlight: false },
        { id: 2, name: 'Venus de Milo', location: 'Floor 1, Sully Wing', floor: 1, highlight: false },
        { id: 3, name: 'Winged Victory of Samothrace', location: 'Floor 2, Denon Wing', floor: 2, highlight: false },
        { id: 4, name: 'Liberty Leading the People', location: 'Floor 2, Sully Wing', floor: 2, highlight: false }
      ],
      featuredExhibits: [
        {
          id: 101,
          name: 'Mona Lisa',
          description: 'Leonardo da Vinci\'s masterpiece portrait',
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
          name: 'The Raft of the Medusa',
          description: 'Romantic painting by Théodore Géricault',
          floor: 2
        }
      ]
    }
  ])
  
  // 计算属性：当前博物馆
  const currentMuseum = computed(() => {
    return museums.value.find(museum => museum.id === currentMuseumId.value) || museums.value[0]
  })
  
  // 计算属性：当前博物馆的路线项目
  const routeItems = computed(() => {
    return currentMuseum.value.routeItems
  })
  
  // 计算属性：当前博物馆的特色展品
  const featuredExhibits = computed(() => {
    return currentMuseum.value.featuredExhibits
  })
  
  // 当前高亮的展品
  const highlightedExhibit = ref<ExhibitItem | null>(null)
  
  // 语音指导状态
  const isGuideExplaining = ref(false)
  
  // 方法: 设置当前博物馆
  function setCurrentMuseum(museumId: string) {
    const museum = museums.value.find(m => m.id === museumId)
    if (museum) {
      currentMuseumId.value = museumId
      return true
    }
    return false
  }
  
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
    currentMuseumId,
    currentMuseum,
    museums,
    routeItems,
    featuredExhibits,
    highlightedExhibit,
    isGuideExplaining,
    setCurrentMuseum,
    highlightExhibit
  }
})