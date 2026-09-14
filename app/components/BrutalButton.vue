<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', type: 'button' }
)
</script>

<template>
  <button
    :type="type"
    class="brutal-border brutal-press font-bold uppercase tracking-wide px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variant === 'primary' && 'bg-brutal-yellow brutal-shadow-sm hover:bg-brutal-yellow/90',
      variant === 'danger' && 'bg-brutal-red text-white brutal-shadow-sm hover:bg-brutal-red/90',
      variant === 'ghost' && 'bg-brutal-surface brutal-shadow-sm hover:bg-brutal-bg'
    ]"
  >
    <slot />
  </button>
</template>
