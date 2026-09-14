<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="emit('close')">
      <div class="brutal-border brutal-shadow bg-brutal-surface w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-black uppercase">{{ title }}</h2>
          <button
            class="brutal-border brutal-shadow-sm brutal-press w-8 h-8 font-black bg-brutal-surface"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
