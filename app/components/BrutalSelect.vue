<script setup lang="ts">
defineProps<{
  label?: string
  options: { label: string; value: string | number }[]
  required?: boolean
}>()

const model = defineModel<string | number>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-xs font-bold uppercase mb-1">{{ label }}</span>
    <select
      v-model="model"
      :required="required"
      class="brutal-border w-full px-3 py-2 bg-brutal-surface focus:outline-none focus:brutal-shadow-sm"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>
