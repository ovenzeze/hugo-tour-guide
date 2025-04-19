import { ref } from 'vue'
import { useTourStore, type ExhibitItem } from '~/stores/tourStore'
import { storeToRefs } from 'pinia'

export function useVoiceNavigation() {
  const tourStore = useTourStore()
  const { isGuideExplaining } = storeToRefs(tourStore)
  
  // 自动播放欢迎介绍
  function playWelcomeIntroduction() {
    console.log('Welcome to the Metropolitan Museum tour!')
    isGuideExplaining.value = true
    
    // 模拟语音持续时间
    setTimeout(() => {
      isGuideExplaining.value = false
    }, 3000)
  }
  
  // 根据展品解释内容
  function explainExhibit(exhibit: ExhibitItem) {
    console.log(`Explaining exhibit: ${exhibit.name}`)
    isGuideExplaining.value = true
    
    // 模拟语音持续时间
    setTimeout(() => {
      isGuideExplaining.value = false
    }, 3000)
  }
  
  // 处理语音命令
  function handleVoiceCommand(command: string) {
    console.log(`Processing voice command: ${command}`)
    isGuideExplaining.value = true
    
    // 模拟响应时间
    setTimeout(() => {
      isGuideExplaining.value = false
    }, 2000)
  }
  
  return {
    playWelcomeIntroduction,
    explainExhibit,
    handleVoiceCommand
  }
}