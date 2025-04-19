<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps({
  modelValue: {
    type: [Number, Array],
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

const containerRef = ref(null)
const thumbRef = ref(null)
const isDragging = ref(false)
const isArray = computed(() => Array.isArray(props.modelValue))

const thumbs = computed(() => {
  if (isArray.value) {
    return props.modelValue.map(value => getPercentage(value))
  }
  return [getPercentage(props.modelValue)]
})

function getPercentage(value) {
  return ((value - props.min) / (props.max - props.min)) * 100
}

function getValue(percentage) {
  const rawValue = (percentage / 100) * (props.max - props.min) + props.min
  const steppedValue = Math.round(rawValue / props.step) * props.step
  return Math.max(props.min, Math.min(props.max, steppedValue))
}

function updateValue(event) {
  if (props.disabled) return
  
  const container = containerRef.value
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const percentage = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
  
  if (isArray.value) {
    // For multi-thumb sliders - find the closest thumb and update its value
    const newValue = [...props.modelValue]
    const closestIndex = newValue.reduce((closest, value, index) => {
      const thumbPercentage = getPercentage(value)
      const distance = Math.abs(thumbPercentage - percentage)
      if (closest.distance === null || distance < closest.distance) {
        return { index, distance }
      }
      return closest
    }, { index: 0, distance: null }).index
    
    newValue[closestIndex] = getValue(percentage)
    emit('update:modelValue', newValue)
  } else {
    // For single thumb slider
    emit('update:modelValue', getValue(percentage))
  }
}

function startDrag(event) {
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
      ref="thumbRef"
      class="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm transform -translate-x-1/2 focus:outline-none"
      tabindex="0"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="isArray ? props.modelValue[index] : props.modelValue"
      :style="{
        left: `${position}%`
      }"
    ></div>
  </div>
</template>