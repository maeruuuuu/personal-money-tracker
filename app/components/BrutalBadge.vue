<script setup lang="ts">
defineProps<{ color?: string }>()
</script>

<template>
  <span
    class="brutal-border inline-block px-2 py-0.5 text-xs font-bold"
    :style="{ backgroundColor: color || '#ffd93d' }"
  >
    <slot />
  </span>
</template>
