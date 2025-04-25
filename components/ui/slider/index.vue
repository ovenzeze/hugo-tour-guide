<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps({
  modelValue: {
    type: [Number, Array] as PropType<number | number[]>,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref<HTMLDivElement | null>(null)
const thumbRef = ref<HTMLDivElement[] | null>(null)
const isDragging = ref(false)
const isArray = computed(() => Array.isArray(props.modelValue))

const thumbs = computed(() => {
  if (isArray.value && Array.isArray(props.modelValue)) {
    return props.modelValue.map(value => getPercentage(value))
  }
  return [getPercentage(typeof props.modelValue === 'number' ? props.modelValue : props.min)]
})

function getPercentage(value: number): number {
  return ((value - props.min) / (props.max - props.min)) * 100
}

function getValue(percentage: number): number {
  const rawValue = (percentage / 100) * (props.max - props.min) + props.min
  const steppedValue = Math.round(rawValue / props.step) * props.step
  return Math.max(props.min, Math.min(props.max, steppedValue))
}

function updateValue(event: MouseEvent) {
  if (props.disabled || !containerRef.value) return

  const container = containerRef.value
  const rect = container.getBoundingClientRect()
  const percentage = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))

  if (isArray.value && Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    let closestIndex = 0;
    let minDistance = Infinity;

    newValue.forEach((value, index) => {
        const thumbPercentage = getPercentage(value);
        const distance = Math.abs(thumbPercentage - percentage);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    newValue[closestIndex] = getValue(percentage)
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', getValue(percentage))
  }
}

function startDrag(event: MouseEvent) {
  if (props.disabled) return
  isDragging.value = true
  updateValue(event)
  document.addEventListener('mousemove', updateValue)
  document.addEventListener('mouseup', stopDrag)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', updateValue)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('mousedown', startDrag)
  }
})

// Clean up event listeners
onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousedown', startDrag)
  }
  document.removeEventListener('mousemove', updateValue)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn(
      'relative w-full h-5 flex items-center cursor-pointer touch-none select-none',
      props.disabled ? 'opacity-50 cursor-not-allowed' : '',
      props.class
    )"
  >
    <!-- Track background -->
    <div class="relative w-full h-2 rounded-full bg-muted-foreground/20">
      <!-- Fill -->
      <div
        v-for="(position, index) in thumbs"
        :key="index"
        class="absolute h-full bg-primary rounded-full"
        :style="{
          left: 0,
          width: `${position}%`
        }"
      ></div>
    </div>

    <!-- Thumb(s) -->
    <div
      v-for="(position, index) in thumbs"
      :key="`thumb-${index}`"
      :ref="el => { if (thumbRef) thumbRef[index] = el as HTMLDivElement }"
      class="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm transform -translate-x-1/2 focus:outline-none"
      tabindex="0"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="isArray && Array.isArray(props.modelValue) ? props.modelValue[index] : typeof props.modelValue === 'number' ? props.modelValue : undefined"
      :style="{
        left: `${position}%`
      }"
    ></div>
  </div>
</template>