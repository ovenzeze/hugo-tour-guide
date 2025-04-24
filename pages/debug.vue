<template>
  <div class="py-6">
    <h1 class="text-2xl font-bold mb-6 border-b pb-2">Debug Information</h1>

    <!-- Debug Tools Section -->
    <div class="mb-6">
      <button 
        @click="toggleTools = !toggleTools" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Debug Tools</span>
        <Icon :name="toggleTools ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleTools" class="space-y-4 p-4 border rounded-lg">
          <!-- Safari Guide Popup Debug -->
          <section class="p-4 border border-amber-300 bg-amber-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-amber-800">Safari Guide Popup</h2>
            <p class="text-sm text-gray-700 mb-3">
              Reset the Safari guide popup that prompts users to add the app to their home screen.
            </p>
            <button
              @click="resetGuidePopup"
              class="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition text-sm flex items-center"
            >
              <Icon name="ph:arrow-counter-clockwise" class="mr-2 w-4 h-4" />
              Reset Safari Guide Popup
            </button>
          </section>
          
          <!-- Tour Store Debug -->
          <section class="p-4 border border-blue-300 bg-blue-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-blue-800">Tour Store</h2>
            <p class="text-sm text-gray-700 mb-3">
              Reset the tour store state to its initial values.
            </p>
            <button
              @click="clearStoreState"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm flex items-center"
            >
              <Icon name="ph:database" class="mr-2 w-4 h-4" />
              Reset Tour Store
            </button>
          </section>
          
          <!-- Voice Navigation Debug -->
          <section class="p-4 border border-green-300 bg-green-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-green-800">Voice Navigation</h2>
            <p class="text-sm text-gray-700 mb-3">
              Test the speech synthesis functionality.
            </p>
            <button
              @click="testSpeak"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm flex items-center"
            >
              <Icon name="ph:speaker-high" class="mr-2 w-4 h-4" />
              Test Speak
            </button>
          </section>
          
          <!-- Notification Debug -->
          <section class="p-4 border border-purple-300 bg-purple-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2 text-purple-800">Notifications</h2>
            <p class="text-sm text-gray-700 mb-3">
              Test the notification system.
            </p>
            <button
              @click="testNotification"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm flex items-center"
            >
              <Icon name="ph:bell" class="mr-2 w-4 h-4" />
              Test Notification
            </button>
          </section>

          <!-- ElevenLabs TTS Test Section (Refactored with shadcn-vue) -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg text-teal-800">ElevenLabs TTS 调试工具</CardTitle>
              <CardDescription>
                使用 shadcn-vue 组件构建的增强型 TTS 测试和调试界面。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs default-value="generate">
                <TabsList class="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="config">配置</TabsTrigger>
                  <TabsTrigger value="generate">生成与播放</TabsTrigger>
                  <TabsTrigger value="debug">调试日志</TabsTrigger>
                </TabsList>

                <!-- 配置 Tab -->
                <TabsContent value="config">
                  <div class="space-y-6 p-1">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label for="voice-select">选择声音</Label>
                        <Select id="voice-select" v-model="selectedVoiceId" @update:modelValue="handleVoiceChange">
                          <SelectTrigger>
                            <SelectValue placeholder="选择一个声音..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem v-for="voice in availableVoices" :key="voice.id" :value="voice.id">
                                {{ voice.name }} ({{ voice.language }})
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <p v-if="selectedVoiceConfig" class="text-xs text-muted-foreground mt-1">
                          ID: {{ selectedVoiceConfig.id }} | 模型: {{ selectedVoiceConfig.modelId }}
                        </p>
                      </div>
                      <div>
                        <Label for="model-select">选择模型 (覆盖)</Label>
                        <Select id="model-select" v-model="selectedModelId">
                           <SelectTrigger>
                            <SelectValue placeholder="默认或选择模型..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="">使用声音默认模型</SelectItem>
                              <SelectItem v-for="(modelId, key) in elevenLabsConfig.models" :key="key" :value="modelId">
                                {{ key }} ({{ modelId }})
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                         <p class="text-xs text-muted-foreground mt-1">
                          覆盖上方选定声音的默认模型。
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label :for="`stability-slider-${_uid}`">稳定性 ({{ (ttsSettings.stability ?? 0).toFixed(2) }})</Label>
                      <Slider
                        :id="`stability-slider-${_uid}`"
                        :model-value="[ttsSettings.stability ?? elevenLabsConfig.defaultSettings.stability]"
                        @update:model-value="val => ttsSettings.stability = val[0]"
                        :min="0" :max="1" :step="0.05"
                        :default-value="[elevenLabsConfig.defaultSettings.stability]"
                        class="my-2"
                      />
                      <p class="text-xs text-muted-foreground">值越高越稳定，但可能单调；越低越多变，但可能不稳定。</p>
                    </div>

                     <div>
                      <Label :for="`similarity-slider-${_uid}`">相似度增强 ({{ (ttsSettings.similarity_boost ?? 0).toFixed(2) }})</Label>
                      <Slider
                        :id="`similarity-slider-${_uid}`"
                         :model-value="[ttsSettings.similarity_boost ?? elevenLabsConfig.defaultSettings.similarity_boost]"
                        @update:model-value="val => ttsSettings.similarity_boost = val[0]"
                        :min="0" :max="1" :step="0.05"
                        :default-value="[elevenLabsConfig.defaultSettings.similarity_boost]"
                         class="my-2"
                      />
                       <p class="text-xs text-muted-foreground">值越高越接近原声，但可能产生杂音；建议保持默认值。</p>
                    </div>

                    <div v-if="isStyleSupported">
                      <Label :for="`style-slider-${_uid}`">风格夸张 ({{ (ttsSettings.style ?? 0).toFixed(2) }})</Label>
                      <Slider
                        :id="`style-slider-${_uid}`"
                         :model-value="[ttsSettings.style ?? 0]"
                        @update:model-value="val => ttsSettings.style = val[0]"
                        :min="0" :max="1" :step="0.05"
                        :default-value="[elevenLabsConfig.defaultSettings.style || 0]"
                        class="my-2"
                      />
                      <p class="text-xs text-muted-foreground">提升说话风格的强度（仅部分模型支持）。</p>
                    </div>

                    <div class="flex items-center space-x-2">
                      <Switch id="speaker-boost-switch" v-model:checked="ttsSettings.use_speaker_boost" />
                      <Label for="speaker-boost-switch">使用 Speaker Boost</Label>
                      <p class="text-xs text-muted-foreground ml-auto">提升音频质量和发音清晰度（推荐开启）。</p>
                    </div>

                  </div>
                </TabsContent>

                <!-- 生成与播放 Tab -->
                <TabsContent value="generate">
                   <div class="space-y-4">
                     <!-- 预设提示词示例 -->
                    <div v-if="selectedVoiceConfig?.promptExamples && Object.keys(selectedVoiceConfig.promptExamples).length > 0">
                      <Label class="block text-sm font-medium mb-1">提示词示例:</Label>
                      <div class="flex flex-wrap gap-2">
                        <Button
                          v-for="(prompt, key) in selectedVoiceConfig.promptExamples"
                          :key="key"
                          @click="loadPromptExample(prompt)"
                          variant="outline"
                          size="sm"
                        >
                          加载 "{{ key }}"
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label for="tts-input">输入文本</Label>
                      <Textarea
                        id="tts-input"
                        v-model="elevenLabsInputText"
                        placeholder="在此输入要转换为语音的文本..."
                        class="mt-1 min-h-[80px]"
                        rows="4"
                      />
                    </div>

                    <div class="flex flex-wrap gap-2 items-center">
                      <Button @click="handleElevenLabsGenerate" :disabled="elevenLabsIsLoading">
                        <Icon v-if="!elevenLabsIsLoading" name="ph:play-circle" class="mr-2 h-4 w-4" />
                         <Icon v-else name="svg-spinners:180-ring-with-bg" class="mr-2 h-4 w-4" />
                        {{ elevenLabsIsLoading ? '生成中...' : '生成语音' }}
                      </Button>
                       <Button
                        v-if="elevenLabsInputText"
                        @click="elevenLabsInputText = ''"
                        variant="outline"
                      >
                        清除文本
                      </Button>
                    </div>

                    <Alert v-if="elevenLabsError" variant="destructive">
                      <Icon name="ph:warning-circle" class="h-4 w-4" />
                      <AlertTitle>错误</AlertTitle>
                      <AlertDescription>
                        {{ elevenLabsError }}
                      </AlertDescription>
                    </Alert>

                    <div v-if="elevenLabsAudioUrl">
                       <Label>播放生成的音频</Label>
                       <audio controls :src="elevenLabsAudioUrl" class="w-full mt-1">
                        您的浏览器不支持音频播放。
                      </audio>
                      <div class="flex gap-2 mt-2">
                        <Button @click="clearElevenLabsAudio" variant="outline" size="sm">
                          清除音频
                        </Button>
                        <Button v-if="elevenLabsAudioData" @click="downloadAudio" variant="outline" size="sm">
                           <Icon name="ph:download-simple" class="mr-1 h-4 w-4" />
                           下载 MP3
                        </Button>
                      </div>
                    </div>
                   </div>
                </TabsContent>

                <!-- 调试日志 Tab -->
                <TabsContent value="debug">
                   <div class="space-y-4">
                    <Alert v-if="lastRequestPayload">
                      <Icon name="ph:code" class="h-4 w-4" />
                      <AlertTitle>上次请求 Payload</AlertTitle>
                      <AlertDescription>
                        <pre class="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
                          <code class="text-white">{{ JSON.stringify(lastRequestPayload, null, 2) }}</code>
                        </pre>
                      </AlertDescription>
                    </Alert>
                     <Alert v-if="lastResponseInfo" :variant="lastResponseInfo.ok ? 'default' : 'destructive'">
                       <Icon :name="lastResponseInfo.ok ? 'ph:check-circle' : 'ph:warning-circle'" class="h-4 w-4" />
                       <AlertTitle>上次响应信息</AlertTitle>
                      <AlertDescription>
                         <pre class="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
                          <code class="text-white">{{ JSON.stringify(lastResponseInfo, null, 2) }}</code>
                        </pre>
                      </AlertDescription>
                    </Alert>
                    <Alert v-if="!lastRequestPayload && !lastResponseInfo">
                       <Icon name="ph:info" class="h-4 w-4" />
                       <AlertTitle>无调试信息</AlertTitle>
                      <AlertDescription>
                        生成一次语音后，此处将显示相关的请求和响应信息。
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </div>

    <!-- Environment Info -->
    <div class="mb-6">
      <button 
        @click="toggleEnv = !toggleEnv" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Environment Information</span>
        <Icon :name="toggleEnv ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleEnv" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border">
            <pre>Mode: {{ runtimeConfig.public.NODE_ENV || 'N/A' }}</pre>
            <pre>SSR: {{ isSSR ? 'Enabled' : 'Disabled' }}</pre>
            <pre>PWA Mode: {{ isPwa ? 'Yes' : 'No' }}</pre>
            <pre>User Language: {{ userLanguage }}</pre>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Store State -->
    <div class="mb-6">
      <button 
        @click="toggleStore = !toggleStore" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Tour Store State</span>
        <Icon :name="toggleStore ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleStore" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border max-h-60 overflow-auto">
            <pre>{{ JSON.stringify(tourStoreState, null, 2) }}</pre>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Voice Navigation State -->
    <div class="mb-6">
      <button 
        @click="toggleVoice = !toggleVoice" 
        class="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 transition-colors"
      >
        <span class="font-semibold">Voice Navigation State</span>
        <Icon :name="toggleVoice ? 'ph:caret-up' : 'ph:caret-down'" class="w-5 h-5" />
      </button>
      
      <Transition name="slide">
        <div v-show="toggleVoice" class="p-4 border rounded-lg">
          <div class="bg-gray-50 p-4 rounded-lg text-sm border">
            <pre>Listening: {{ voiceNavState.isListening.value }}</pre>
            <pre>Speaking: {{ voiceNavState.isSpeaking.value }}</pre>
            <pre>Transcript: {{ voiceNavState.transcript.value || 'N/A' }}</pre>
            <pre>Recognition Error: {{ voiceNavState.recognitionError.value || 'N/A' }}</pre>
            <pre>Command Error: {{ voiceNavState.commandError.value || 'N/A' }}</pre>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tourStore'
import { useVoiceNavigation } from '~/composables/useVoiceNavigation'
import { usePwa } from '~/composables/usePwa'
// Add missing Vue imports
import { ref, computed, onMounted, watch, reactive, getCurrentInstance } from 'vue' 
import { useElevenLabsTTS } from '~/composables/useElevenLabsTTS'
import elevenlabsConfigImport, { getAllVoices, findVoiceById, updateVoicesFromAPI } from '~/config/elevenlabs' // Import config object directly
import type { Voice } from '~/types/voice'
// Add missing useNotifications import
import { useNotifications } from '~/composables/useNotifications'; 

// Shadcn-vue component imports (ensure these are correctly imported/added via CLI)
// Re-add missing shadcn-vue imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// import { getCurrentInstance } from 'vue' // Already added above

// Define page meta for title
definePageMeta({
  title: 'Debug'
})

// Toggle states for collapsible sections
const toggleTools = ref(true)  // Open by default
const toggleEnv = ref(false)
const toggleStore = ref(false)
const toggleVoice = ref(false)

// 获取所有可用的声音配置
const voices = computed(() => getAllVoices())

const runtimeConfig = useRuntimeConfig()
const tourStore = useTourStore()
const voiceNavState = useVoiceNavigation()
const { isPwa } = usePwa()
const { userLanguage } = useVoiceNavigation()

// Check if running on server or client
const isSSR = computed(() => process.server)

// Get reactive store state
const tourStoreState = computed(() => tourStore.$state)

// --- ElevenLabs TTS Refactored State ---
const {
  audioUrl: elevenLabsAudioUrl,
  audioData: elevenLabsAudioData, // Get Blob data
  isLoading: elevenLabsIsLoading,
  error: elevenLabsError,
  generateTTS, // Use the base generator
  clearAudio: clearElevenLabsAudioBase,
} = useElevenLabsTTS()

const elevenLabsConfig = elevenlabsConfigImport // Use imported config
const availableVoices = ref<Voice.Config[]>([])
const selectedVoiceId = ref<string | undefined>(undefined)
const selectedModelId = ref<string>('') // Empty string means use voice default
const elevenLabsInputText = ref('')

// Reactive object for TTS settings
const ttsSettings = ref({
  stability: elevenLabsConfig.defaultSettings.stability,
  similarity_boost: elevenLabsConfig.defaultSettings.similarity_boost,
  style: elevenLabsConfig.defaultSettings.style || 0,
  use_speaker_boost: elevenLabsConfig.defaultSettings.use_speaker_boost !== undefined ? elevenLabsConfig.defaultSettings.use_speaker_boost : true,
})

// Debugging state
const lastRequestPayload = ref<object | null>(null)
const lastResponseInfo = ref<object | null>(null) // Store response status/error details

// Get component instance uid for unique IDs
const instance = getCurrentInstance()
const _uid = instance?.uid || Math.random().toString(36).substring(7) // Fallback for unique ID

// --- Computed Properties ---
const selectedVoiceConfig = computed(() => {
  return selectedVoiceId.value ? findVoiceById(selectedVoiceId.value) : null
})

// Check if the currently selected (or default) model supports style exaggeration
const isStyleSupported = computed(() => {
  const model = selectedModelId.value || selectedVoiceConfig.value?.modelId
  // Add logic here based on which ElevenLabs models support style
  // Example (adjust based on actual ElevenLabs model IDs):
  return model?.includes('eleven_multilingual_v2') || model?.includes('eleven_english_v2');
})

// --- Methods ---
const clearElevenLabsAudio = () => {
  clearElevenLabsAudioBase()
  lastRequestPayload.value = null // Clear debug info as well
  lastResponseInfo.value = null
}

// Load voices on mount
onMounted(async () => {
  // Optionally update from API first
  // await updateVoicesFromAPI();
  availableVoices.value = getAllVoices()
  // Set default selection if needed
  // selectedVoiceId.value = elevenLabsConfig.voices.find(v => v.is_default)?.id || elevenLabsConfig.voices[0]?.id;
  // handleVoiceChange(selectedVoiceId.value); // Trigger initial settings load
})

// Handle voice selection change - Adjust parameter type and add check
const handleVoiceChange = (voiceIdPayload: string | null | undefined | number | Record<string, any>) => { // Accept broader type from event
  const voiceId = typeof voiceIdPayload === 'string' ? voiceIdPayload : undefined;

  if (!voiceId) {
    selectedVoiceId.value = undefined
    Object.assign(ttsSettings, elevenLabsConfig.defaultSettings);
    selectedModelId.value = '';
    return;
  }
  selectedVoiceId.value = voiceId
  const voice = findVoiceById(voiceId)
  if (voice) {
    Object.assign(ttsSettings, { ...elevenLabsConfig.defaultSettings, ...voice.settings });
    selectedModelId.value = '';
     if (!isStyleSupported.value) {
        ttsSettings.style = 0;
     }
  }
}

// Load prompt example into textarea
const loadPromptExample = (prompt: string) => {
  elevenLabsInputText.value = prompt
}

// Handle TTS generation click
const handleElevenLabsGenerate = async () => {
  if (!elevenLabsInputText.value || !selectedVoiceId.value) {
    elevenLabsError.value = '请选择一个声音并输入文本。'
    return
  }

  const voiceConfig = selectedVoiceConfig.value;
  if (!voiceConfig) {
     elevenLabsError.value = '无法找到所选声音的配置。'
     return;
  }

  // Prepare options, overriding defaults with UI settings
  const options = {
    voiceId: selectedVoiceId.value,
    modelId: selectedModelId.value || voiceConfig.modelId || elevenLabsConfig.models.multilingual,
    voiceSettings: {
      // Provide definite fallbacks here
      stability: ttsSettings.stability ?? elevenLabsConfig.defaultSettings.stability,
      similarity_boost: ttsSettings.similarity_boost ?? elevenLabsConfig.defaultSettings.similarity_boost,
      ...(isStyleSupported.value && (ttsSettings.style ?? 0) > 0 && { style: ttsSettings.style }),
      use_speaker_boost: ttsSettings.use_speaker_boost ?? true,
    },
  };

  // Store request payload for debugging
  lastRequestPayload.value = {
    text: elevenLabsInputText.value.substring(0, 500), // Limit text length in debug log
    ...options
  }
  lastResponseInfo.value = null // Clear previous response info

  try {
    await generateTTS(elevenLabsInputText.value, options)
    if (!elevenLabsError.value) {
       lastResponseInfo.value = { ok: true, status: 200, timestamp: new Date().toISOString() }
    } else {
       // Use nullish coalescing for error assignment
       lastResponseInfo.value = { ok: false, error: elevenLabsError.value ?? undefined, timestamp: new Date().toISOString() }
    }
  } catch(err: any) {
      console.error("Error during handleElevenLabsGenerate:", err);
      const errorMsg = err.message || '生成过程中发生意外错误。';
      elevenLabsError.value = errorMsg;
      // Use nullish coalescing here too
      lastResponseInfo.value = { ok: false, error: errorMsg ?? undefined, message: err.message, stack: err.stack, timestamp: new Date().toISOString() }
  }
}

// Download audio function
const downloadAudio = () => {
  if (!elevenLabsAudioData.value) return;
  const url = URL.createObjectURL(elevenLabsAudioData.value);
  const a = document.createElement('a');
  a.href = url;
  // Try to get a reasonable filename
  const voiceName = selectedVoiceConfig.value?.name?.replace(/\s+/g, '_') || 'audio';
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  a.download = `elevenlabs_${voiceName}_${timestamp}.mp3`; // Assuming MP3 format
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Watch for style support changes (e.g., when model changes)
// This might be complex if model change doesn't directly trigger recalculation
// Simplified: Reset style if support changes via selected voice config
watch(isStyleSupported, (newVal, oldVal) => {
  if (!newVal && ttsSettings.value.style > 0) {
    // console.log("Model/Voice changed, style not supported. Resetting style slider.");
    // Decide if you want to reset the value or just disable interaction
    // ttsSettings.style = 0;
  }
});

// --- Existing Debug Tools Methods ---
const resetGuidePopup = () => {
  localStorage.removeItem('safariAddToHomeScreenDismissed')
  alert('Safari Guide Popup has been reset. Refresh the page on Safari.')
}

const store = useTourStore()

const clearStoreState = () => {
  store.$reset() // Use Pinia's $reset method
  alert('Tour store state has been reset.')
}

const testSpeak = () => {
  voiceNavState.speak('这是语音导航测试。')
}

const { showNotification } = useNotifications()
const testNotification = () => {
  showNotification({
    title: '测试通知',
    body: '这是一条测试通知消息。',
    requireInteraction: true,
  })
}

// --- Environment Info ---
// const toggleEnv = ref(false) // Remove redundant declaration
// const toggleStore = ref(false) // Remove redundant declaration
// const toggleVoice = ref(false) // Remove redundant declaration

// const runtimeConfig = useRuntimeConfig() // Remove redundant declaration
// const isSSR = computed(() => typeof window === 'undefined') // Remove redundant declaration (keep process.server version)
// const { isPwa } = usePwa() // Remove redundant declaration
// const userLanguage = computed(() => typeof navigator !== 'undefined' ? navigator.language : 'N/A') // Remove redundant declaration (keep useVoiceNavigation version)

</script>

<style scoped>
/* Slide transition for collapsible sections */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px; /* Adjust max-height based on content */
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}
/* Style for debug pre blocks */
pre {
  white-space: pre-wrap;       /* CSS 3 */
  white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
  white-space: -pre-wrap;      /* Opera 4-6 */
  white-space: -o-pre-wrap;    /* Opera 7 */
  word-wrap: break-word;       /* Internet Explorer 5.5+ */
  font-family: 'Courier New', Courier, monospace; /* Monospaced font */
  font-size: 0.8rem; /* Slightly smaller font */
}
code {
 font-family: 'Courier New', Courier, monospace; /* Ensure code block uses monospace */
}
</style>