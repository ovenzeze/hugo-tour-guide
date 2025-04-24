<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  checked?: boolean
  disabled?: boolean
  modelValue?: boolean
  class?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
  modelValue: undefined,
})

const emit = defineEmits<Emits>()

// Handle both checked and modelValue for v-model support
const isChecked = ref(props.modelValue !== undefined ? props.modelValue : props.checked)

// Sync with external modelValue changes
watch(toRef(props, 'modelValue'), (value) => {
  if (value !== undefined) {
    isChecked.value = value
  }
})

// Sync with external checked changes
watch(toRef(props, 'checked'), (value) => {
  if (props.modelValue === undefined) {
    isChecked.value = value
  }
})

const toggle = () => {
  if (props.disabled) return
  
  const newValue = !isChecked.value
  isChecked.value = newValue
  
  if (props.modelValue !== undefined) {
    emit('update:modelValue', newValue)
  }
  
  emit('change', newValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="isChecked"
    :data-state="isChecked ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :class="cn(
      'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      props.class
    )"
    @click="toggle"
  >
    <span
      :data-state="isChecked ? 'checked' : 'unchecked'"
      class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    />
  </button>
</template> 