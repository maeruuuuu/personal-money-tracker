<script setup lang="ts">
import type { Wallet } from '~/stores/wallets'

const store = useWalletsStore()
await store.fetch()

const showModal = ref(false)
const editing = ref<Wallet | null>(null)

const form = reactive({
  name: '',
  type: 'cash',
  initialBalance: 0,
  color: '#4d96ff'
})

const walletTypeOptions = [
  { label: 'Tunai', value: 'cash' },
  { label: 'Bank', value: 'bank' },
  { label: 'E-Wallet', value: 'ewallet' },
  { label: 'Lainnya', value: 'other' }
]

const colorOptions = ['#4d96ff', '#6bcf7f', '#ffd93d', '#ff6b9d', '#ff5c5c', '#b592ff']

function openCreate() {
  editing.value = null
  form.name = ''
  form.type = 'cash'
  form.initialBalance = 0
  form.color = '#4d96ff'
  showModal.value = true
}

function openEdit(wallet: Wallet) {
  editing.value = wallet
  form.name = wallet.name
  form.type = wallet.type
  form.initialBalance = wallet.initialBalance
  form.color = wallet.color
  showModal.value = true
}

async function submit() {
  const payload = { ...form, initialBalance: Number(form.initialBalance) }
  if (editing.value) {
    await store.update(editing.value.id, payload)
  } else {
    await store.create(payload)
  }
  showModal.value = false
}

async function remove(wallet: Wallet) {
  if (!confirm(`Hapus wallet "${wallet.name}"? Semua transaksi & transfer terkait ikut terhapus.`)) return
  await store.remove(wallet.id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Wallets</h1>
      <BrutalButton @click="openCreate">+ Tambah Wallet</BrutalButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BrutalCard v-for="w in store.items" :key="w.id" :style="{ backgroundColor: w.color }">
        <p class="text-xs font-bold uppercase">{{ w.type }}</p>
        <p class="text-lg font-black">{{ w.name }}</p>
        <p class="text-2xl font-black mt-2">{{ formatCurrency(w.balance) }}</p>
        <div class="flex gap-2 mt-4">
          <BrutalButton variant="ghost" @click="openEdit(w)">Edit</BrutalButton>
          <BrutalButton variant="danger" @click="remove(w)">Hapus</BrutalButton>
        </div>
      </BrutalCard>
    </div>

    <BrutalModal v-if="showModal" :title="editing ? 'Edit Wallet' : 'Tambah Wallet'" @close="showModal = false">
      <form class="space-y-4" @submit.prevent="submit">
        <BrutalInput v-model="form.name" label="Nama Wallet" required />
        <BrutalSelect v-model="form.type" label="Tipe" :options="walletTypeOptions" />
        <BrutalInput v-model="form.initialBalance" type="number" label="Saldo Awal" min="0" />
        <div>
          <span class="block text-xs font-bold uppercase mb-1">Warna</span>
          <div class="flex gap-2">
            <button
              v-for="c in colorOptions"
              :key="c"
              type="button"
              class="w-8 h-8 brutal-border"
              :class="form.color === c && 'ring-2 ring-offset-2 ring-black'"
              :style="{ backgroundColor: c }"
              @click="form.color = c"
            />
          </div>
        </div>
        <BrutalButton type="submit" class="w-full">{{ editing ? 'Simpan' : 'Tambah' }}</BrutalButton>
      </form>
    </BrutalModal>
  </div>
</template>
