<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/wallets', label: 'Wallets' },
  { to: '/categories', label: 'Kategori' },
  { to: '/transactions', label: 'Transaksi' },
  { to: '/report', label: 'Laporan' },
  { to: '/idol', label: 'Idol' }
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen">
    <header class="brutal-border border-t-0 border-x-0 bg-brutal-surface">
      <div class="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <span class="font-black text-xl uppercase">💰 Money Tracker</span>
        <nav class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="brutal-border brutal-shadow-sm brutal-press px-3 py-1.5 text-xs font-bold uppercase bg-brutal-surface"
            :class="{ 'bg-brutal-yellow': route.path === item.to }"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            class="brutal-border brutal-shadow-sm brutal-press px-3 py-1.5 text-xs font-bold uppercase bg-brutal-red text-white"
            @click="logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
