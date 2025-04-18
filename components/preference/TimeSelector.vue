<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-lg font-semibold mb-3">Visit Duration</h2>
    <p class="text-gray-600 mb-4">How much time do you plan to spend at the museum?</p>
    
    <div class="space-y-3">
      <label 
        v-for="option in timeOptions" 
        :key="option.value" 
        class="flex items-center p-3 border rounded cursor-pointer transition-colors"
        :class="selectedTime === option.value ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'"
      >
        <input 
          type="radio" 
          name="duration" 
          :value="option.value" 
          v-model="selectedTime"
          class="mr-3"
        />
        <div>
          <div class="font-medium">{{ option.label }}</div>
          <div class="text-sm text-gray-600">{{ option.description }}</div>
        </div>
      </label>
    </div>
    
    <div class="mt-4 pt-3 border-t">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Selected time: <strong>{{ getSelectedTimeLabel() }}</strong></span>
        <button 
          class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          @click="savePreference"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedTime = ref(1) // Default: 1 hour

const timeOptions = [
  {
    value: 0.5,
    label: '30 minutes',
    description: 'Quick visit (5-7 exhibits)'
  },
  {
    value: 1,
    label: '1 hour',
    description: 'Standard visit (10-12 exhibits)'
  },
  {
    value: 1.5,
    label: '1.5 hours',
    description: 'Extended visit (15-18 exhibits)'
  },
  {
    value: 2,
    label: '2+ hours',
    description: 'Comprehensive visit (20+ exhibits)'
  }
]

// Get the label for the currently selected time
function getSelectedTimeLabel() {
  const option = timeOptions.find(opt => opt.value === selectedTime.value)
  return option ? option.label : ''
}

// Save the selected time preference
function savePreference() {
  // In a real implementation, this would save to a store or API
  console.log('Saving time preference:', selectedTime.value)
  
  // Example of emitting an event that parent components can listen for
  emit('update:duration', selectedTime.value)
}

// Define emits
const emit = defineEmits(['update:duration'])
</script>