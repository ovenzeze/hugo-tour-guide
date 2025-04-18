<template>
  <Dialog v-model="isOpen">
    <div
      class="guide-dialog max-w-md w-full mx-auto bg-white rounded-xl overflow-hidden flex flex-col max-h-[80vh]"
    >
      <!-- 导游信息 -->
      <div class="p-4 border-b">
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3"
          >
            <span class="text-blue-600 font-bold">AI</span>
          </div>
          <div>
            <h3 class="font-medium">Lisa Ghimire</h3>
            <p class="text-xs text-gray-500">AI 博物馆导游</p>
          </div>
        </div>
      </div>

      <!-- 聊天历史 -->
      <div class="flex-1 overflow-y-auto p-4 bg-white">
        <ChatHistory :messages="messages" />
      </div>

      <!-- 语音界面 -->
      <div class="border-t">
        <VoiceInterface @send="sendMessage" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { Dialog } from "~/components/ui/dialog";
import ChatHistory from "./ChatHistory.vue";
import VoiceInterface from "../chat/VoiceInterface.vue";
import { useChatStore } from "~/stores/chatStore";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "send"]);

// 同步 modelValue 与内部状态
const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;
  }
);

watch(isOpen, (val) => {
  emit("update:modelValue", val);
});

// 使用 chatStore
const chatStore = useChatStore();

// 在组件挂载时初始化
onMounted(() => {
  chatStore.initialize?.();
});

// 使用 computed 获取消息列表
const messages = computed(() => chatStore.messages);

// 处理消息发送
function sendMessage(content: string) {
  if (!content.trim()) return;
  
  // 使用 chatStore 发送消息
  chatStore.sendMessage(content);
  
  // 同时向父组件发送事件
  emit("send", content);
}
</script>