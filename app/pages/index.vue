<script setup lang="ts">
const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()

const RECENT_PAGE_SIZE = 5

await Promise.all([
  walletsStore.fetch(),
  categoriesStore.fetch(),
  transactionsStore.fetchSummary(),
  transactionsStore.fetchPage(1, RECENT_PAGE_SIZE)
])

const showTransactionModal = ref(false)
const showTransferModal = ref(false)

function goToPage(page: number) {
  if (page < 1 || page > transactionsStore.pageTotalPages) return
  transactionsStore.fetchPage(page, RECENT_PAGE_SIZE)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BrutalCard class="bg-brutal-green">
        <p class="text-xs font-bold uppercase mb-1">Total Pemasukan</p>
        <p class="text-2xl font-black">{{ formatCurrency(transactionsStore.summary.totalIncome) }}</p>
      </BrutalCard>
      <BrutalCard class="bg-brutal-red">
        <p class="text-xs font-bold uppercase mb-1">Total Pengeluaran</p>
        <p class="text-2xl font-black">{{ formatCurrency(transactionsStore.summary.totalExpense) }}</p>
      </BrutalCard>
      <BrutalCard class="bg-brutal-yellow">
        <p class="text-xs font-bold uppercase mb-1">Saldo Akhir</p>
        <p class="text-2xl font-black">{{ formatCurrency(transactionsStore.summary.totalBalance) }}</p>
      </BrutalCard>
    </div>

    <div class="flex flex-wrap gap-3">
      <BrutalButton
        :disabled="!walletsStore.items.length || !categoriesStore.items.length"
        @click="showTransactionModal = true"
      >
        + Tambah Transaksi
      </BrutalButton>
      <BrutalButton :disabled="walletsStore.items.length < 2" @click="showTransferModal = true">
        + Transfer
      </BrutalButton>
    </div>

    <BrutalCard>
      <h2 class="font-black uppercase mb-3">Transaksi Terbaru</h2>
      <ul v-if="transactionsStore.pageItems.length" class="space-y-2">
        <li
          v-for="tx in transactionsStore.pageItems"
          :key="tx.id"
          class="brutal-border px-3 py-2 flex items-center justify-between text-sm"
        >
          <div>
            <BrutalBadge :color="tx.categoryColor">{{ tx.categoryName }}</BrutalBadge>
            <p class="mt-1 text-xs">{{ tx.walletName }} · {{ formatDate(tx.date) }}</p>
          </div>
          <span class="font-bold" :class="tx.type === 'income' ? 'text-green-700' : 'text-brutal-red'">
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </span>
        </li>
      </ul>
      <p v-else class="text-sm">Belum ada transaksi.</p>

      <div v-if="transactionsStore.pageTotalPages > 1" class="flex items-center justify-between gap-3 mt-4">
        <BrutalButton
          variant="ghost"
          :disabled="transactionsStore.pageNumber <= 1"
          @click="goToPage(transactionsStore.pageNumber - 1)"
        >
          ← Sebelumnya
        </BrutalButton>
        <p class="text-xs font-bold uppercase">
          Halaman {{ transactionsStore.pageNumber }} dari {{ transactionsStore.pageTotalPages }}
        </p>
        <BrutalButton
          variant="ghost"
          :disabled="transactionsStore.pageNumber >= transactionsStore.pageTotalPages"
          @click="goToPage(transactionsStore.pageNumber + 1)"
        >
          Berikutnya →
        </BrutalButton>
      </div>
    </BrutalCard>

    <TransactionFormModal v-if="showTransactionModal" @close="showTransactionModal = false" />
    <TransferFormModal v-if="showTransferModal" @close="showTransferModal = false" />
  </div>
</template>
