<script setup lang="ts">
const route = useRoute()
const categoryId = Number(route.params.id)

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const PAGE_SIZE = 20

await Promise.all([categoriesStore.fetch(), transactionsStore.fetchPage(1, PAGE_SIZE, { categoryId })])

const category = computed(() => categoriesStore.items.find((c) => c.id === categoryId))

async function remove(id: number) {
  if (!confirm('Hapus transaksi ini?')) return
  await transactionsStore.remove(id)
  if (!transactionsStore.pageItems.length && transactionsStore.pageNumber > 1) {
    await transactionsStore.fetchPage(transactionsStore.pageNumber - 1, PAGE_SIZE)
  }
}

function goToPage(page: number) {
  if (page < 1 || page > transactionsStore.pageTotalPages) return
  transactionsStore.fetchPage(page, PAGE_SIZE)
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/categories" class="text-xs font-bold uppercase underline">← Kembali ke Kategori</NuxtLink>

    <div v-if="category" class="flex items-center gap-2">
      <span class="w-4 h-4 brutal-border" :style="{ backgroundColor: category.color }" />
      <h1 class="text-xl font-black uppercase">{{ category.name }}</h1>
    </div>
    <p v-else class="text-sm">Kategori tidak ditemukan.</p>

    <div class="space-y-3">
      <h2 class="font-black uppercase">Riwayat Transaksi</h2>
      <div class="space-y-2">
        <BrutalCard v-for="tx in transactionsStore.pageItems" :key="tx.id" class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold">{{ tx.walletName }}</p>
            <p class="text-xs mt-1">{{ formatDate(tx.date) }} · {{ tx.note || '-' }}</p>
          </div>
          <div class="text-right">
            <p class="font-black" :class="tx.type === 'income' ? 'text-green-700' : 'text-brutal-red'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </p>
            <button class="text-xs font-bold uppercase underline mt-1" @click="remove(tx.id)">Hapus</button>
          </div>
        </BrutalCard>
        <p v-if="!transactionsStore.pageItems.length" class="text-sm">Belum ada transaksi untuk kategori ini.</p>
      </div>

      <div v-if="transactionsStore.pageTotalPages > 1" class="flex items-center justify-between gap-3">
        <BrutalButton
          variant="ghost"
          :disabled="transactionsStore.pageNumber <= 1"
          @click="goToPage(transactionsStore.pageNumber - 1)"
        >
          ← Sebelumnya
        </BrutalButton>
        <p class="text-xs font-bold uppercase">
          Halaman {{ transactionsStore.pageNumber }} dari {{ transactionsStore.pageTotalPages }}
          ({{ transactionsStore.pageTotal }} transaksi)
        </p>
        <BrutalButton
          variant="ghost"
          :disabled="transactionsStore.pageNumber >= transactionsStore.pageTotalPages"
          @click="goToPage(transactionsStore.pageNumber + 1)"
        >
          Berikutnya →
        </BrutalButton>
      </div>
    </div>
  </div>
</template>
