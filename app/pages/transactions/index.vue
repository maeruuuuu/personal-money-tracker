<script setup lang="ts">
import type { Transaction } from '~/stores/transactions'

const transactionsStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const PAGE_SIZE = 20

await Promise.all([transactionsStore.fetchPage(1, PAGE_SIZE), walletsStore.fetch(), categoriesStore.fetch()])

const showModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)

function openCreate() {
  editingTransaction.value = null
  showModal.value = true
}

function openEdit(tx: Transaction) {
  editingTransaction.value = tx
  showModal.value = true
}

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
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Transaksi</h1>
      <BrutalButton :disabled="!walletsStore.items.length || !categoriesStore.items.length" @click="openCreate">
        + Tambah Transaksi
      </BrutalButton>
    </div>

    <p v-if="!walletsStore.items.length" class="text-sm">Buat wallet dulu sebelum mencatat transaksi.</p>
    <p v-else-if="!categoriesStore.items.length" class="text-sm">Buat kategori dulu sebelum mencatat transaksi.</p>

    <div class="space-y-2">
      <BrutalCard v-for="tx in transactionsStore.pageItems" :key="tx.id" class="flex items-center justify-between">
        <div>
          <BrutalBadge :color="tx.categoryColor">{{ tx.categoryName }}</BrutalBadge>
          <p class="mt-1 text-sm font-bold">{{ tx.walletName }}</p>
          <p class="text-xs">{{ formatDate(tx.date) }} · {{ tx.note || '-' }}</p>
        </div>
        <div class="text-right">
          <p class="font-black" :class="tx.type === 'income' ? 'text-green-700' : 'text-brutal-red'">
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </p>
          <div class="flex gap-3 justify-end mt-1">
            <button class="text-xs font-bold uppercase underline" @click="openEdit(tx)">Edit</button>
            <button class="text-xs font-bold uppercase underline" @click="remove(tx.id)">Hapus</button>
          </div>
        </div>
      </BrutalCard>
      <p v-if="!transactionsStore.pageItems.length" class="text-sm">Belum ada transaksi.</p>
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

    <TransactionFormModal v-if="showModal" :transaction="editingTransaction" @close="showModal = false" />
  </div>
</template>
