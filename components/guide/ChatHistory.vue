按照<template>
  <div class="chat-history">
    <div
      v-if="messages.length === 0"
      class="text-center py-10 text-gray-500"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 0.2 } }"
    >
      开始与您的AI导游对话
    </div>

    <TransitionGroup name="chat" tag="div" class="space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="message.id"
        class="flex"
        :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
        v-motion
        :initial="{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }"
        :enter="{
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.1 + index * 0.05,
            duration: 0.3,
          },
        }"
      >
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2 text-sm"
          :class="
            message.sender === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          "
        >
          <!-- 文本消息 -->
          <div v-if="!message.attachments || message.attachments.length === 0">
            {{ message.content }}
          </div>

          <!-- 带附件的消息 -->
          <div v-else>
            <div class="mb-2">{{ message.content }}</div>
            
            <!-- 图片附件 -->
            <div v-for="(attachment, i) in message.attachments" :key="i" class="my-1">
              <img
                v-if="attachment.type === 'image'"
                :src="attachment.url"
                class="rounded max-w-full"
                :alt="attachment.caption || 'Image'"
              />
              
              <!-- 音频附件 -->
              <audio
                v-else-if="attachment.type === 'audio'"
                controls
                class="w-full max-w-[250px]"
              >
                <source :src="attachment.url" type="audio/mpeg">
                您的浏览器不支持音频元素。
              </audio>
              
              <!-- 链接附件 -->
              <a
                v-else-if="attachment.type === 'link'"
                :href="attachment.url"
                target="_blank"
                class="text-blue-500 underline block"
              >
                {{ attachment.caption || attachment.url }}
              </a>
            </div>
          </div>
          
          <!-- 时间戳 -->
          <div class="text-xs opacity-70 text-right mt-1">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { ChatMessage } from "~/types";

// 定义组件属性
const props = defineProps({
  messages: {
    type: Array as PropType<ChatMessage[]>,
    default: () => [],
  },
});

// 格式化时间
function formatTime(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  transform: translateY(-20px);
}
</style>