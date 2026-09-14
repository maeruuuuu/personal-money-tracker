<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/')
  } catch {
    error.value = 'Password salah.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BrutalCard class="w-full max-w-sm bg-brutal-yellow">
    <h1 class="text-2xl font-black uppercase mb-1">💰 Money Tracker</h1>
    <p class="text-sm mb-4">Masukkan password untuk masuk.</p>
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalInput v-model="password" type="password" label="Password" placeholder="••••••••" required />
      <p v-if="error" class="text-sm font-bold text-brutal-red">{{ error }}</p>
      <BrutalButton type="submit" class="w-full" :disabled="loading">
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </BrutalButton>
    </form>
  </BrutalCard>
</template>
