<template>
  <Dialog 
    v-model="isOpen"
    class="z-50"
  >
    <DialogContent
      class="guide-dialog max-w-md w-full mx-auto bg-white rounded-xl overflow-hidden flex flex-col max-h-[80vh] sm:max-w-lg"
    >
      <!-- Guide information -->
      <DialogHeader class="border-b bg-primary/5 pb-3 pt-4">
        <div class="flex items-center">
          <div
            class="size-10 rounded-full bg-primary/10 flex items-center justify-center mr-3"
          >
            <span class="text-primary font-bold">AI</span>
          </div>
          <div>
            <DialogTitle class="font-medium text-base">Lisa Ghimire</DialogTitle>
            <DialogDescription class="text-xs">AI Museum Guide</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Chat history -->
      <div class="flex-1 overflow-y-auto p-4 bg-white">
        <ChatHistory :messages="messages" />
      </div>

      <!-- Voice interface -->
      <div class="border-t">
        <VoiceInterface @send="sendMessage" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import ChatHistory from "./ChatHistory.vue";
import VoiceInterface from "../chat/VoiceInterface.vue";
import { useChatStore } from "~/stores/chatStore";

// Dialog state
const isOpen = defineModel("modelValue", { type: Boolean });

// Chat store
const chatStore = useChatStore();
const messages = computed(() => chatStore.messages);

// Handle sending messages
function sendMessage(content: string) {
  chatStore.sendMessage(content);
}

// Load chat history when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    chatStore.initialize();
  }
});
</script>

<style scoped>
.guide-dialog :deep(.scrollbar) {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.guide-dialog :deep(.scrollbar::-webkit-scrollbar) {
  width: 5px;
}

.guide-dialog :deep(.scrollbar::-webkit-scrollbar-track) {
  background: transparent;
}

.guide-dialog :deep(.scrollbar::-webkit-scrollbar-thumb) {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}
</style>