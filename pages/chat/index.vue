<template>
  <div class="container mx-auto px-4 py-6 max-w-3xl">
    <div class="flex flex-col h-[calc(100vh-120px)]">
      <!-- 聊天头部 -->
      <div class="bg-white border-b p-4 rounded-t-lg shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span class="text-blue-600 font-bold">AI</span>
          </div>
          <div>
            <h2 class="text-xl font-medium">语音助手</h2>
            <p class="text-sm text-gray-500">使用语音进行交流</p>
          </div>
        </div>
      </div>
      
      <!-- 聊天消息区域 -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div v-if="messages.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center text-gray-500">
            <p>尚无对话记录</p>
            <p class="text-sm mt-2">点击下方的麦克风按钮开始对话</p>
          </div>
        </div>
        
        <TransitionGroup name="chat" tag="div" class="space-y-4">
          <div v-for="msg in messages" :key="msg.id" class="flex items-end"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
            <div class="max-w-3/4 rounded-lg px-4 py-2"
              :class="msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'">
              {{ msg.content }}
            </div>
          </div>
        </TransitionGroup>
      </div>
    
      <!-- 语音界面 -->
      <div class="bg-white border-t p-4 rounded-b-lg shadow-sm">
        <VoiceInterface @send="handleSendMessage" />
        
        <div class="mt-3 flex justify-between items-center">
          <p class="text-xs text-gray-500">{{ messages.length > 0 ? `${messages.length} 条消息` : '开始新对话' }}</p>
          
          <button v-if="messages.length > 0" 
            @click="clearChat" 
            class="text-xs text-red-500 hover:text-red-700">
            清空对话
          </button>
    </div>
  </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VoiceInterface from '~/components/chat/VoiceInterface.vue'
import { useSpeechSynthesis } from '~/composables/useSpeechSynthesis'

// 定义消息类型
interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 聊天消息
const messages = ref<ChatMessage[]>([])

// 语音合成
const { speak } = useSpeechSynthesis({
  lang: 'zh-CN',
  rate: 1.0
})

// 在组件挂载时添加欢迎消息
onMounted(() => {
  setTimeout(() => {
    const welcomeMessage = "你好！我是你的AI语音助手。你可以通过语音与我交流，或者直接发送文字消息。有什么我可以帮助你的吗？"
    addMessage('ai', welcomeMessage)
    speak(welcomeMessage)
  }, 500)
})

// 处理发送消息
async function handleSendMessage(content: string) {
  if (!content.trim()) return
  
  // 添加用户消息
  addMessage('user', content)
  
  // 模拟AI思考
  setTimeout(async () => {
    // 这里实际项目中应该调用API获取回复
    const aiResponse = generateResponse(content)
    
    // 添加AI回复
    addMessage('ai', aiResponse)
    
    // 语音播报AI回复
    await speak(aiResponse)
  }, 1000)
}

// 添加消息到聊天记录
function addMessage(sender: 'user' | 'ai', content: string) {
  messages.value.push({
    id: Date.now(),
    sender,
    content,
    timestamp: new Date()
  })
}

// 清空聊天记录
function clearChat() {
  messages.value = []
  
  setTimeout(() => {
    const welcomeMessage = "聊天已清空。有什么新的问题我可以帮助你吗？"
    addMessage('ai', welcomeMessage)
    speak(welcomeMessage)
  }, 300)
}

// 模拟回复生成 (实际项目中应该调用API)
function generateResponse(query: string): string {
  // 简单的回复逻辑，实际项目中应该使用真实的API
  if (query.includes('你好') || query.includes('您好')) {
    return '你好！很高兴和你交流。我可以帮助你回答问题或者提供展品信息。'
  }
  
  if (query.includes('名字') || query.includes('谁')) {
    return '我是博物馆的AI语音助手，可以为您提供展品信息和参观指南。'
  }
  
  if (query.includes('展品') || query.includes('藏品')) {
    return '我们博物馆有众多精彩展品，包括古埃及文物、欧洲艺术品、亚洲艺术收藏等。您对哪个展区比较感兴趣呢？'
  }
  
  if (query.includes('时间') || query.includes('开放')) {
    return '博物馆每天上午9点至下午5点开放，周一闭馆。特别展览可能有不同的开放时间。'
  }
  
  // 默认回复
  return `关于"${query}"，我可以提供更多展品信息或者帮您规划参观路线。请告诉我您更具体的需求。`
}
</script>

<style scoped>
.chat-enter-active,
.chat-leave-active {
  transition: all 0.3s ease;
}
.chat-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.chat-leave-to {
  opacity: 0;
}
</style>