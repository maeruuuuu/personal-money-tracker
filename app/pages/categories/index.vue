<script setup lang="ts">
import type { Category } from '~/stores/categories'

const store = useCategoriesStore()
await store.fetch()

const activeTab = ref<'income' | 'expense'>('expense')
const showModal = ref(false)
const editing = ref<Category | null>(null)

const form = reactive({
  name: '',
  type: 'expense' as 'income' | 'expense',
  color: '#ffd93d',
  status: 'active'
})

const colorOptions = ['#4d96ff', '#6bcf7f', '#ffd93d', '#ff6b9d', '#ff5c5c', '#b592ff']

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const visibleCategories = computed(() => (activeTab.value === 'income' ? store.income : store.expense))

function openCreate() {
  editing.value = null
  form.name = ''
  form.type = activeTab.value
  form.color = '#ffd93d'
  form.status = 'active'
  showModal.value = true
}

function openEdit(category: Category) {
  editing.value = category
  form.name = category.name
  form.type = category.type
  form.color = category.color
  form.status = category.status
  showModal.value = true
}

async function submit() {
  if (editing.value) {
    await store.update(editing.value.id, { ...form })
  } else {
    await store.create({ ...form })
  }
  showModal.value = false
}

async function remove(category: Category) {
  if (!confirm(`Hapus kategori "${category.name}"?`)) return
  try {
    await store.remove(category.id)
  } catch {
    alert('Kategori masih dipakai di transaksi, tidak bisa dihapus.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Kategori</h1>
      <BrutalButton @click="openCreate">+ Tambah Kategori</BrutalButton>
    </div>

    <div class="flex gap-2">
      <button
        class="brutal-border brutal-shadow-sm brutal-press px-4 py-2 text-sm font-bold uppercase"
        :class="activeTab === 'expense' ? 'bg-brutal-red text-white' : 'bg-brutal-surface'"
        @click="activeTab = 'expense'"
      >
        Pengeluaran
      </button>
      <button
        class="brutal-border brutal-shadow-sm brutal-press px-4 py-2 text-sm font-bold uppercase"
        :class="activeTab === 'income' ? 'bg-brutal-green' : 'bg-brutal-surface'"
        @click="activeTab = 'income'"
      >
        Pemasukan
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BrutalCard v-for="c in visibleCategories" :key="c.id" :class="c.status === 'inactive' && 'opacity-50'">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 brutal-border" :style="{ backgroundColor: c.color }" />
            <p class="font-bold">{{ c.name }}</p>
          </div>
          <BrutalBadge v-if="c.status === 'inactive'" color="#111111" class="!text-white">Nonaktif</BrutalBadge>
        </div>
        <div class="flex gap-2 mt-4 flex-wrap">
          <NuxtLink :to="`/categories/${c.id}`">
            <BrutalButton variant="ghost">Detail</BrutalButton>
          </NuxtLink>
          <BrutalButton variant="ghost" @click="openEdit(c)">Edit</BrutalButton>
          <BrutalButton variant="danger" @click="remove(c)">Hapus</BrutalButton>
        </div>
      </BrutalCard>
      <p v-if="!visibleCategories.length" class="text-sm">Belum ada kategori.</p>
    </div>

    <BrutalModal v-if="showModal" :title="editing ? 'Edit Kategori' : 'Tambah Kategori'" @close="showModal = false">
      <form class="space-y-4" @submit.prevent="submit">
        <BrutalInput v-model="form.name" label="Nama Kategori" required />
        <BrutalSelect
          v-model="form.type"
          label="Tipe"
          :options="[
            { label: 'Pengeluaran', value: 'expense' },
            { label: 'Pemasukan', value: 'income' }
          ]"
        />
        <BrutalSelect v-model="form.status" label="Status" :options="statusOptions" />
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
