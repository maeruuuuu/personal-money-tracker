<script setup lang="ts">
defineProps<{
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  min?: string | number
  step?: string | number
}>()

const model = defineModel<string | number>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-xs font-bold uppercase mb-1">{{ label }}</span>
    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :required="required"
      :min="min"
      :step="step"
      class="brutal-border w-full px-3 py-2 bg-brutal-surface focus:outline-none focus:brutal-shadow-sm placeholder:text-black/40"
    />
  </label>
</template>
