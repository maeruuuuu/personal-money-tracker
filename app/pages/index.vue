<script setup lang="ts">
import type { Transaction } from '~/stores/transactions'
import type { Transfer } from '~/stores/transfers'

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()
const transfersStore = useTransfersStore()
const categoriesStore = useCategoriesStore()

const RECENT_PAGE_SIZE = 5
const HIDE_AMOUNTS_KEY = 'money-tracker:hide-amounts'
const currentMonth = currentMonthInput()

await Promise.all([
  walletsStore.fetch(),
  categoriesStore.fetch(),
  transactionsStore.fetchMonthlySummary(currentMonth),
  transactionsStore.fetchPage(1, RECENT_PAGE_SIZE, { month: currentMonth }),
  transfersStore.fetchPage(1, RECENT_PAGE_SIZE, { month: currentMonth })
])

const showTransactionModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const showTransferModal = ref(false)
const editingTransfer = ref<Transfer | null>(null)
const showCorrectionModal = ref(false)
const hideAmounts = ref(false)

onMounted(() => {
  try {
    hideAmounts.value = localStorage.getItem(HIDE_AMOUNTS_KEY) === '1'
  } catch {
    // localStorage tidak tersedia, abaikan
  }
})

function toggleHideAmounts() {
  hideAmounts.value = !hideAmounts.value
  try {
    localStorage.setItem(HIDE_AMOUNTS_KEY, hideAmounts.value ? '1' : '0')
  } catch {
    // localStorage tidak tersedia, abaikan
  }
}

function displayAmount(amount: number) {
  return hideAmounts.value ? '••••••' : formatCurrency(amount)
}

function openCreateTransaction() {
  editingTransaction.value = null
  showTransactionModal.value = true
}

function openEditTransaction(tx: Transaction) {
  editingTransaction.value = tx
  showTransactionModal.value = true
}

async function removeTransaction(id: number) {
  if (!confirm('Hapus transaksi ini?')) return
  await transactionsStore.remove(id)
  if (!transactionsStore.pageItems.length && transactionsStore.pageNumber > 1) {
    await transactionsStore.fetchPage(transactionsStore.pageNumber - 1, RECENT_PAGE_SIZE)
  }
}

function goToPage(page: number) {
  if (page < 1 || page > transactionsStore.pageTotalPages) return
  transactionsStore.fetchPage(page, RECENT_PAGE_SIZE)
}

function openCreateTransfer() {
  editingTransfer.value = null
  showTransferModal.value = true
}

function openEditTransfer(t: Transfer) {
  editingTransfer.value = t
  showTransferModal.value = true
}

async function removeTransfer(id: number) {
  if (!confirm('Hapus transfer ini?')) return
  await transfersStore.remove(id)
  if (!transfersStore.pageItems.length && transfersStore.pageNumber > 1) {
    await transfersStore.fetchPage(transfersStore.pageNumber - 1, RECENT_PAGE_SIZE)
  }
}

function goToTransferPage(page: number) {
  if (page < 1 || page > transfersStore.pageTotalPages) return
  transfersStore.fetchPage(page, RECENT_PAGE_SIZE)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Bulan Ini</h1>
      <BrutalButton variant="ghost" @click="toggleHideAmounts">
        {{ hideAmounts ? '👁 Tampilkan' : '🙈 Sembunyikan' }}
      </BrutalButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BrutalCard class="bg-brutal-green">
        <p class="text-xs font-bold uppercase mb-1">Pemasukan Bulan Ini</p>
        <p class="text-2xl font-black">{{ displayAmount(transactionsStore.monthlySummary.totalIncome) }}</p>
      </BrutalCard>
      <BrutalCard class="bg-brutal-red">
        <p class="text-xs font-bold uppercase mb-1">Pengeluaran Bulan Ini</p>
        <p class="text-2xl font-black">{{ displayAmount(transactionsStore.monthlySummary.totalExpense) }}</p>
      </BrutalCard>
      <BrutalCard :class="transactionsStore.monthlySummary.net >= 0 ? 'bg-brutal-yellow' : 'bg-brutal-red'">
        <p class="text-xs font-bold uppercase mb-1">Selisih Bulan Ini</p>
        <p class="text-2xl font-black">{{ displayAmount(transactionsStore.monthlySummary.net) }}</p>
      </BrutalCard>
    </div>

    <div class="flex flex-wrap gap-3">
      <BrutalButton
        :disabled="!walletsStore.items.length || !categoriesStore.items.length"
        @click="openCreateTransaction"
      >
        + Tambah Transaksi
      </BrutalButton>
      <BrutalButton :disabled="walletsStore.items.length < 2" @click="openCreateTransfer">
        + Transfer
      </BrutalButton>
      <BrutalButton :disabled="!walletsStore.items.length" @click="showCorrectionModal = true">
        + Koreksi
      </BrutalButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-3">
        <h2 class="font-black uppercase">Transaksi Bulan Ini</h2>
        <div class="space-y-2">
          <BrutalCard v-for="tx in transactionsStore.pageItems" :key="tx.id" class="flex items-center justify-between">
            <div>
              <BrutalBadge v-if="tx.type === 'correction'" color="#b592ff">Koreksi</BrutalBadge>
              <BrutalBadge v-else :color="tx.categoryColor">{{ tx.categoryName }}</BrutalBadge>
              <p class="mt-1 text-xs">{{ tx.walletName }} · {{ formatDate(tx.date) }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold" :class="tx.amount >= 0 && tx.type !== 'expense' ? 'text-green-700' : 'text-brutal-red'">
                {{ tx.type === 'expense' || tx.amount < 0 ? '-' : '+' }}{{ displayAmount(Math.abs(tx.amount)) }}
              </p>
              <div class="flex gap-3 justify-end mt-1">
                <button
                  v-if="tx.type !== 'correction'"
                  class="text-xs font-bold uppercase underline"
                  @click="openEditTransaction(tx)"
                >
                  Edit
                </button>
                <button class="text-xs font-bold uppercase underline" @click="removeTransaction(tx.id)">Hapus</button>
              </div>
            </div>
          </BrutalCard>
          <p v-if="!transactionsStore.pageItems.length" class="text-sm">Belum ada transaksi bulan ini.</p>
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

      <div class="space-y-3">
        <h2 class="font-black uppercase">Transfer Bulan Ini</h2>
        <div class="space-y-2">
          <BrutalCard v-for="t in transfersStore.pageItems" :key="t.id" class="flex items-center justify-between">
            <div>
              <p class="font-bold text-sm">{{ t.fromWalletName }} → {{ t.toWalletName }}</p>
              <p class="text-xs mt-1">{{ formatDate(t.date) }} · {{ t.note || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="font-black">{{ displayAmount(t.amount) }}</p>
              <div class="flex gap-3 justify-end mt-1">
                <button class="text-xs font-bold uppercase underline" @click="openEditTransfer(t)">Edit</button>
                <button class="text-xs font-bold uppercase underline" @click="removeTransfer(t.id)">Hapus</button>
              </div>
            </div>
          </BrutalCard>
          <p v-if="!transfersStore.pageItems.length" class="text-sm">Belum ada transfer bulan ini.</p>
        </div>

        <div v-if="transfersStore.pageTotalPages > 1" class="flex items-center justify-between gap-3">
          <BrutalButton
            variant="ghost"
            :disabled="transfersStore.pageNumber <= 1"
            @click="goToTransferPage(transfersStore.pageNumber - 1)"
          >
            ← Sebelumnya
          </BrutalButton>
          <p class="text-xs font-bold uppercase">
            Halaman {{ transfersStore.pageNumber }} dari {{ transfersStore.pageTotalPages }}
          </p>
          <BrutalButton
            variant="ghost"
            :disabled="transfersStore.pageNumber >= transfersStore.pageTotalPages"
            @click="goToTransferPage(transfersStore.pageNumber + 1)"
          >
            Berikutnya →
          </BrutalButton>
        </div>
      </div>
    </div>

    <TransactionFormModal
      v-if="showTransactionModal"
      :transaction="editingTransaction"
      @close="showTransactionModal = false"
    />
    <TransferFormModal v-if="showTransferModal" :transfer="editingTransfer" @close="showTransferModal = false" />
    <CorrectionFormModal v-if="showCorrectionModal" @close="showCorrectionModal = false" />
  </div>
</template>
