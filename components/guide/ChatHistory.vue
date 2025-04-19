<template>
  <div class="chat-history">
    <div
      v-if="messages.length === 0"
      class="text-center py-10 text-muted-foreground"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 0.2 } }"
    >
      Start a conversation with your AI guide
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
        <!-- AI avatar (only shown for AI messages) -->
        <div v-if="message.sender === 'ai'" class="flex-shrink-0 mr-2">
          <Avatar class="size-8 border border-primary/10">
            <AvatarImage src="/assets/images/guide/ai-avatar.png" alt="AI Guide" />
            <AvatarFallback class="bg-primary-50 text-primary-900 text-xs">AI</AvatarFallback>
          </Avatar>
        </div>
        
        <div
          class="max-w-[80%] rounded-lg shadow-sm px-4 py-3 text-sm"
          :class="
            message.sender === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted/80 text-foreground rounded-bl-none'
          "
        >
          <!-- Text message -->
          <div v-if="!message.attachments || message.attachments.length === 0">
            {{ message.content }}
          </div>

          <!-- Messages with attachments -->
          <div v-else>
            <div class="mb-2">{{ message.content }}</div>
            
            <!-- Image attachments -->
            <div v-for="(attachment, i) in message.attachments" :key="i" class="my-1">
              <img
                v-if="attachment.type === 'image'"
                :src="attachment.url"
                class="rounded-md max-w-full h-auto"
                :alt="attachment.caption || 'Image attachment'"
                loading="lazy"
              />
              
              <!-- Audio attachments -->
              <div v-else-if="attachment.type === 'audio'" class="bg-background/80 rounded-md p-2">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="ph:speaker-high" class="text-primary size-4" />
                  <span class="text-xs font-medium">Audio clip</span>
                </div>
                <audio
                  controls
                  class="w-full max-w-[250px]"
                >
                  <source :src="attachment.url" type="audio/mpeg">
                  Your browser does not support audio playback
                </audio>
              </div>
              
              <!-- Link attachments -->
              <a
                v-else-if="attachment.type === 'link'"
                :href="attachment.url"
                target="_blank"
                class="flex items-center gap-1 text-primary hover:underline block p-2 bg-primary/5 rounded-md"
              >
                <Icon name="ph:link" class="size-4" />
                {{ attachment.caption || attachment.url }}
                <Icon name="ph:arrow-square-out" class="size-3 ml-1" />
              </a>
            </div>
          </div>
          
          <!-- Timestamp -->
          <div class="text-xs opacity-70 text-right mt-2 flex items-center justify-end gap-1">
            <span>{{ formatTime(message.timestamp) }}</span>
            <Icon v-if="message.sender === 'user'" name="ph:check-circle" class="size-3" :class="{'text-blue-500': true}" />
          </div>
        </div>
        
        <!-- User avatar (only shown for user messages) -->
        <div v-if="message.sender === 'user'" class="flex-shrink-0 ml-2">
          <Avatar class="size-8 border border-primary/10">
            <AvatarFallback class="bg-blue-100 text-blue-800 text-xs">You</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { ChatMessage } from "~/types";
import { Icon } from "#components";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

// Define component props
const props = defineProps({
  messages: {
    type: Array as PropType<ChatMessage[]>,
    default: () => [],
  },
});

// Format time
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