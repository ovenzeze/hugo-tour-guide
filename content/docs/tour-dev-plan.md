# 博物馆列表页面改进计划：动效与 AI 导游功能实施方案

## 项目背景与目标

当前页面（`pages/index.vue`）展示了一个博物馆和活动的列表，包含筛选功能。我们需要通过添加动效来提升用户体验，并集成 AI 导游功能，使用户可以通过语音与导游交互获取信息。

## 实施子任务清单

### 子任务 1：引入和配置 Motion 动画库

**背景与目标**：
为页面添加流畅、专业的动画效果，需要一个功能强大的动画库。我们将集成 Motion One 库，它提供了现代化的 Web 动画 API。

**详细步骤**：

1. 安装 Motion One 库

   ```bash
   npm install motion
   # 或者使用 yarn
   yarn add motion
   ```

2. 在 Nuxt 配置中设置插件（如果您使用的是 Nuxt）

   ```typescript
   // 创建文件：plugins/motion.ts
   import { defineNuxtPlugin } from "#app";
   import { createElement } from "vue";
   import { createMotionDirective } from "motion";

   export default defineNuxtPlugin((nuxtApp) => {
     const { vMotion } = createMotionDirective(createElement);
     nuxtApp.vueApp.directive("motion", vMotion);
   });
   ```

3. 添加到 nuxt.config.ts 文件
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     plugins: [
       // 其他插件...
       "~/plugins/motion",
     ],
   });
   ```

**验证方法**：

1. 确认安装成功：检查 package.json 中是否已添加 motion 库
2. 尝试使用基本动画：在任意组件中添加 v-motion 指令，测试是否生效
3. 没有控制台报错

**预期结果**：

- Motion 库成功集成到项目中
- v-motion 指令可以使用
- 能够使用 Motion API 创建基本动画

### 子任务 2：实现卡片列表动画效果

**背景与目标**：
当用户进入页面或进行筛选操作时，卡片列表应有流畅的动画效果，提升用户体验。我们将实现卡片进场、退场和重排的动画。

**详细步骤**：

1. 修改列表容器，使用 TransitionGroup

   ```vue
   <!-- 原代码 -->
   <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
     <!-- 卡片内容 -->
   </div>

   <!-- 修改为 -->
   <TransitionGroup
     name="list"
     tag="div"
     class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5"
   >
     <!-- 卡片内容 -->
   </TransitionGroup>
   ```

2. 添加必要的 CSS 过渡样式

   ```vue
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
   ```

3. 使用 v-motion 为每个卡片添加进场动画（如果使用 Motion 库）
   ```vue
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
     class="..."
   >
   ```

**验证方法**：

1. 运行项目，访问页面，观察卡片是否有进场动画
2. 改变筛选条件，观察卡片是否有流畅的退出和进入动画
3. 筛选结果改变时，确认卡片重排有过渡效果

**预期结果**：

- 页面初次加载时，卡片从下往上逐个流畅地出现
- 筛选条件变化时，不再符合条件的卡片平滑消失
- 新符合条件的卡片平滑出现
- 布局变化时，卡片位置调整有平滑过渡，不会突然跳动

### 子任务 3：实现交互元素动效增强

**背景与目标**：
为提升用户体验，我们需要增强页面中交互元素（如按钮、筛选器、卡片）的动画效果，使其反馈更加直观。

**详细步骤**：

1. 为筛选栏添加淡入动画

   ```vue
   <div
     class="flex flex-wrap gap-3 items-center mb-4"
     v-motion
     :initial="{ opacity: 0, y: -20 }"
     :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
   >
     <!-- 筛选组件 -->
   </div>
   ```

2. 增强卡片悬停效果

   ```vue
   <Card
     class="relative group overflow-hidden shadow transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl flex flex-col h-full pt-0 pb-3 gap-0"
   >
   ```

3. 为收藏按钮添加点击动画

   ```vue
   <Button
     variant="ghost"
     size="icon"
     class="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white"
     @click.stop="toggleFavorite(item)"
     v-motion:click="{ scale: [1, 1.2, 1], transition: { duration: 0.3 } }"
   >
   ```

4. 为空状态添加淡入动画
   ```vue
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
   ```

**验证方法**：

1. 运行项目，观察筛选栏是否有淡入效果
2. 将鼠标悬停在卡片上，观察效果是否自然流畅
3. 点击收藏按钮，确认有反馈动画
4. 测试空状态显示，观察是否有平滑过渡

**预期结果**：

- 页面加载时，筛选栏平滑淡入
- 卡片悬停时有微妙的缩放和阴影效果
- 点击收藏按钮时有明显的视觉反馈
- 空状态显示时有平滑的淡入效果

### 子任务 4：创建 AskGuideButton 组件

**背景与目标**：
创建一个引人注目的悬浮按钮，作为用户与 AI 导游交互的入口。按钮应当有吸引人的动画效果，并在视觉上引导用户点击。

**详细步骤**：

1. 创建新组件文件

   ```bash
   mkdir -p components/guide
   touch components/guide/AskGuideButton.vue
   ```

2. 实现 AskGuideButton 组件

   ```vue
   <!-- components/guide/AskGuideButton.vue -->
   <template>
     <button
       class="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full h-14 px-4 shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-all duration-300"
       v-motion
       :initial="{ opacity: 0, scale: 0.8, y: 20 }"
       :enter="{
         opacity: 1,
         scale: 1,
         y: 0,
         transition: { delay: 0.8, duration: 0.5 },
       }"
       :hovered="{
         scale: 1.05,
         boxShadow:
           '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
       }"
       :tap="{ scale: 0.95 }"
       @click="$emit('click')"
     >
       <Icon name="ph:microphone" class="w-5 h-5 mr-2" />
       <span class="font-medium">Ask Guide</span>
     </button>
   </template>

   <script setup lang="ts">
   import { Icon } from "#components";

   // 定义组件事件
   defineEmits(["click"]);
   </script>
   ```

3. 在 index.vue 中引入并使用该组件

   ```vue
   <template>
     <div class="container mx-auto p-4">
       <!-- 现有内容 -->

       <!-- Ask Guide 按钮 -->
       <AskGuideButton @click="openGuideDialog" />
     </div>
   </template>

   <script setup lang="ts">
   // 现有导入...
   import AskGuideButton from "~/components/guide/AskGuideButton.vue";

   // 其他现有代码...

   // 处理 Ask Guide 按钮点击
   function openGuideDialog() {
     // 后续任务中实现
     console.log("Opening guide dialog");
   }
   </script>
   ```

**验证方法**：

1. 运行项目，确认按钮在页面右下角显示
2. 观察按钮的进场动画是否流畅
3. 悬停和点击按钮，确认有对应的动画效果
4. 点击按钮，确认控制台输出预期的日志

**预期结果**：

- 页面加载后，按钮平滑地淡入并上浮到位
- 鼠标悬停时按钮略微放大并增加阴影
- 点击时按钮有缩小反馈
- 按钮位置固定，不会被页面内容遮挡

### 子任务 5：创建 ChatHistory 组件

**背景与目标**：
创建一个组件来显示用户与 AI 导游之间的对话历史，支持文本和图片混合内容，并具备良好的滚动和动画效果。

**详细步骤**：

1. 创建新组件文件

   ```bash
   touch components/guide/ChatHistory.vue
   ```

2. 实现 ChatHistory 组件

   ```vue
   <!-- components/guide/ChatHistory.vue -->
   <template>
     <div class="chat-history">
       <div
         v-if="messages.length === 0"
         class="text-center py-10 text-gray-500"
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
           <div
             class="max-w-[80%] rounded-2xl px-4 py-2 text-sm"
             :class="
               message.sender === 'user'
                 ? 'bg-blue-600 text-white rounded-br-none'
                 : 'bg-gray-100 text-gray-800 rounded-bl-none'
             "
           >
             <!-- 文本消息 -->
             <div v-if="message.type === 'text'">
               {{ message.content }}
             </div>

             <!-- 图片消息 -->
             <div v-else-if="message.type === 'image'" class="my-1">
               <img
                 :src="message.content"
                 class="rounded max-w-full"
                 alt="Image"
               />
             </div>
           </div>
         </div>
       </TransitionGroup>
     </div>
   </template>

   <script setup lang="ts">
   import { PropType } from "vue";

   // 定义消息类型
   interface ChatMessage {
     id: number | string;
     sender: "user" | "guide";
     type: "text" | "image";
     content: string;
     timestamp: Date;
   }

   // 定义组件属性
   const props = defineProps({
     messages: {
       type: Array as PropType<ChatMessage[]>,
       default: () => [],
     },
   });
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
   ```

3. 在 index.vue 中准备消息数据（暂时使用模拟数据）

   ```vue
   <script setup lang="ts">
   // 现有代码...

   // 模拟聊天消息
   const chatMessages = ref([
     {
       id: 1,
       sender: "guide",
       type: "text",
       content:
         "Hello! I'm Lisa, your AI museum guide. How can I help you today?",
       timestamp: new Date(),
     },
   ]);
   </script>
   ```

**验证方法**：

1. 在 GuideDialog 组件中使用 ChatHistory 组件并传入模拟数据
2. 确认消息显示正确，用户和导游的消息有不同的样式和位置
3. 测试添加新消息，观察动画效果

**预期结果**：

- 无消息时显示引导文本
- 消息按照时间顺序显示，每个消息有进场动画
- 用户消息靠右显示，带蓝色背景
- 导游消息靠左显示，带灰色背景
- 支持文本和图片内容

### 子任务 6：创建 GuideDialog 组件并集成语音界面

**背景与目标**：
创建一个对话框组件，集成 GuideProfile、ChatHistory 和 VoiceInterface 组件，为用户提供与 AI 导游交互的完整界面。

**详细步骤**：

1. 创建新组件文件

   ```bash
   touch components/guide/GuideDialog.vue
   ```

2. 实现 GuideDialog 组件

   ```vue
   <!-- components/guide/GuideDialog.vue -->
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
               <p class="text-xs text-gray-500">AI Museum Guide</p>
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
   import { ref, watch } from "vue";
   import { Dialog } from "~/components/ui/dialog";
   import ChatHistory from "./ChatHistory.vue";
   import VoiceInterface from "../chat/VoiceInterface.vue";

   const props = defineProps({
     modelValue: {
       type: Boolean,
       required: true,
     },
     messages: {
       type: Array,
       default: () => [],
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

   // 处理消息发送
   function sendMessage(content: string) {
     emit("send", content);
   }
   </script>
   ```

3. 在 index.vue 中引入并使用该组件

   ```vue
   <template>
     <div class="container mx-auto p-4">
       <!-- 现有内容 -->

       <!-- Ask Guide 按钮 -->
       <AskGuideButton @click="openGuideDialog" />

       <!-- Guide 对话框 -->
       <GuideDialog
         v-model="showGuideDialog"
         :messages="chatMessages"
         @send="handleSendMessage"
       />
     </div>
   </template>

   <script setup lang="ts">
   // 现有导入...
   import AskGuideButton from "~/components/guide/AskGuideButton.vue";
   import GuideDialog from "~/components/guide/GuideDialog.vue";

   // 对话框状态
   const showGuideDialog = ref(false);

   // 模拟聊天消息
   const chatMessages = ref([
     {
       id: 1,
       sender: "guide",
       type: "text",
       content:
         "Hello! I'm Lisa, your AI museum guide. How can I help you today?",
       timestamp: new Date(),
     },
   ]);

   // 处理 Ask Guide 按钮点击
   function openGuideDialog() {
     showGuideDialog.value = true;
   }

   // 处理消息发送
   function handleSendMessage(content: string) {
     // 添加用户消息
     chatMessages.value.push({
       id: Date.now(),
       sender: "user",
       type: "text",
       content,
       timestamp: new Date(),
     });

     // 模拟 AI 回复（真实项目中应调用 API）
     setTimeout(() => {
       chatMessages.value.push({
         id: Date.now() + 1,
         sender: "guide",
         type: "text",
         content: `I can help you with information about museums and exhibits. Would you like to know more about "${content}"?`,
         timestamp: new Date(),
       });
     }, 1000);
   }
   </script>
   ```

**验证方法**：

1. 运行项目，点击 Ask Guide 按钮
2. 确认对话框正确打开，显示导游信息、空聊天记录和语音界面
3. 测试发送消息功能，观察消息添加和回复的动画效果
4. 测试对话框关闭功能

**预期结果**：

- 点击 Ask Guide 按钮时对话框平滑打开
- 对话框包含导游信息、聊天历史和语音界面三个区域
- 发送消息后，消息立即显示在聊天历史中，带有动画效果
- AI 回复后，回复消息也带有动画效果显示
- 关闭对话框时有平滑的退出动画

### 子任务 7：集成 Pinia 状态管理与完善交互

**背景与目标**：
使用 Pinia 状态管理库管理聊天状态，使聊天记录持久化并在组件间共享。同时，完善所有交互动效，确保整体体验流畅。

**详细步骤**：

1. 创建聊天状态管理

   ```bash
   mkdir -p stores
   touch stores/chatStore.ts
   ```

2. 实现聊天状态管理

   ```typescript
   // stores/chatStore.ts
   import { defineStore } from "pinia";

   export interface ChatMessage {
     id: number | string;
     sender: "user" | "guide";
     type: "text" | "image";
     content: string;
     timestamp: Date;
   }

   export const useChatStore = defineStore("chat", {
     state: () => ({
       messages: [] as ChatMessage[],
       isVoiceMode: false,
       isLoading: false,
     }),

     actions: {
       initialize() {
         // 初始欢迎消息
         if (this.messages.length === 0) {
           this.messages.push({
             id: 1,
             sender: "guide",
             type: "text",
             content:
               "Hello! I'm Lisa, your AI museum guide. How can I help you today?",
             timestamp: new Date(),
           });
         }
       },

       async sendMessage(content: string) {
         // 添加用户消息
         this.messages.push({
           id: Date.now(),
           sender: "user",
           type: "text",
           content,
           timestamp: new Date(),
         });

         // 设置加载状态
         this.isLoading = true;

         try {
           // 在真实项目中，这里应该调用 API
           // 这里我们使用 setTimeout 模拟 API 调用
           await new Promise((resolve) => setTimeout(resolve, 1000));

           // 添加 AI 回复
           this.messages.push({
             id: Date.now() + 1,
             sender: "guide",
             type: "text",
             content: `I can help you with information about museums and exhibits. Would you like to know more about "${content}"?`,
             timestamp: new Date(),
           });
         } finally {
           this.isLoading = false;
         }
       },

       clearMessages() {
         this.messages = [];
         this.initialize();
       },

       toggleVoiceMode() {
         this.isVoiceMode = !this.isVoiceMode;
       },
     },
   });
   ```

3. 修改 GuideDialog 组件，使用 chatStore

   ```vue
   <script setup lang="ts">
   import { useChatStore } from "~/stores/chatStore";

   const chatStore = useChatStore();

   // 在组件挂载时初始化
   onMounted(() => {
     chatStore.initialize();
   });

   // 使用 computed 获取消息列表
   const messages = computed(() => chatStore.messages);

   // 处理消息发送
   function sendMessage(content: string) {
     chatStore.sendMessage(content);
   }
   </script>
   ```

4. 在 index.vue 中使用 chatStore

   ```vue
   <script setup lang="ts">
   import { useChatStore } from "~/stores/chatStore";

   const chatStore = useChatStore();
   const showGuideDialog = ref(false);

   // 使用 computed 获取消息列表
   const chatMessages = computed(() => chatStore.messages);

   // 处理 Ask Guide 按钮点击
   function openGuideDialog() {
     showGuideDialog.value = true;
     chatStore.initialize();
   }

   // 处理消息发送
   function handleSendMessage(content: string) {
     chatStore.sendMessage(content);
   }
   </script>
   ```

5. 完善动画效果，确保所有交互流畅
   - 添加筛选动画
   - 优化卡片过渡效果
   - 完善对话框打开/关闭动画

**验证方法**：

1. 运行项目，测试完整流程：
   - 页面加载
   - 筛选操作
   - 打开 AI 导游对话框
   - 发送消息并接收回复
   - 关闭对话框再重新打开，确认消息记录保留
2. 在不同设备上测试（移动端和桌面端）
3. 测试在各种情况下的表现（快速操作、网络延迟等）

**预期结果**：

- 所有动画效果平滑自然
- 聊天记录在对话框关闭后依然保留
- 状态管理正常工作，组件间数据共享正确
- 整体用户体验流畅直观
- 在移动端和桌面端都有良好的表现

## 项目依赖与环境要求

- Node.js >= 14.x
- Vue 3.x
- Nuxt 3.x (如果使用 Nuxt)
- Tailwind CSS
- Motion One 动画库
- Icon 组件库（如 Phosphor Icons）

## 注意事项与排错指南

1. **安装依赖问题**：

   - 确保依赖版本兼容
   - 如遇到冲突，可尝试使用 `--force` 标志安装

2. **动画性能问题**：

   - 避免过度使用复杂动画，特别是在移动设备上
   - 使用 CSS transform 和 opacity 属性，而不是改变布局属性

3. **语音接口兼容性问题**：

   - Web Speech API 兼容性有限，需要在不同浏览器中测试
   - 考虑提供文本输入作为备选方案

4. **状态管理注意事项**：

   - 确保 store 在 SSR 环境中正常工作（如果使用 Nuxt）
   - 避免出现循环引用

5. **响应式布局问题**：
   - 确保在各种屏幕尺寸下测试
   - 优先使用 flex 和 grid 布局，结合 Tailwind 的响应式前缀

每项任务完成后，建议进行独立测试，确保功能正常，然后再整合到主页面中。
