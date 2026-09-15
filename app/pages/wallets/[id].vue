<script setup lang="ts">
import type { Transfer } from '~/stores/transfers'

const route = useRoute()
const walletId = Number(route.params.id)

const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const transfersStore = useTransfersStore()

const PAGE_SIZE = 20

await Promise.all([
  walletsStore.fetch(),
  categoriesStore.fetch(),
  transactionsStore.fetchPage(1, PAGE_SIZE, { walletId }),
  transfersStore.fetchPage(1, PAGE_SIZE, { walletId })
])

const wallet = computed(() => walletsStore.items.find((w) => w.id === walletId))

const showTransactionModal = ref(false)
const showTransferModal = ref(false)
const editingTransfer = ref<Transfer | null>(null)
const activeWalletCount = computed(() => walletsStore.items.filter((w) => w.status === 'active').length)

function openCreateTransfer() {
  editingTransfer.value = null
  showTransferModal.value = true
}

function openEditTransfer(t: Transfer) {
  editingTransfer.value = t
  showTransferModal.value = true
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

async function removeTransfer(id: number) {
  if (!confirm('Hapus transfer ini?')) return
  await transfersStore.remove(id)
  if (!transfersStore.pageItems.length && transfersStore.pageNumber > 1) {
    await transfersStore.fetchPage(transfersStore.pageNumber - 1, PAGE_SIZE)
  }
}

function goToTransferPage(page: number) {
  if (page < 1 || page > transfersStore.pageTotalPages) return
  transfersStore.fetchPage(page, PAGE_SIZE)
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/wallets" class="text-xs font-bold uppercase underline">← Kembali ke Wallets</NuxtLink>

    <div v-if="wallet" class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black uppercase">{{ wallet.name }}</h1>
        <p class="text-xs font-bold uppercase mt-1">{{ wallet.type }} · {{ wallet.status }}</p>
      </div>
      <p class="text-2xl font-black">{{ formatCurrency(wallet.balance) }}</p>
    </div>
    <p v-else class="text-sm">Wallet tidak ditemukan.</p>

    <div v-if="wallet" class="flex flex-wrap gap-3">
      <BrutalButton :disabled="!categoriesStore.items.length" @click="showTransactionModal = true">
        + Tambah Transaksi
      </BrutalButton>
      <BrutalButton :disabled="activeWalletCount < 2" @click="openCreateTransfer">+ Transfer</BrutalButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-3">
        <h2 class="font-black uppercase">Riwayat Transaksi</h2>
        <div class="space-y-2">
          <BrutalCard v-for="tx in transactionsStore.pageItems" :key="tx.id" class="flex items-center justify-between">
            <div>
              <BrutalBadge v-if="tx.type === 'correction'" color="#b592ff">Koreksi</BrutalBadge>
              <BrutalBadge v-else :color="tx.categoryColor">{{ tx.categoryName }}</BrutalBadge>
              <p class="text-xs mt-1">{{ formatDate(tx.date) }} · {{ tx.note || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="font-black" :class="tx.amount >= 0 && tx.type !== 'expense' ? 'text-green-700' : 'text-brutal-red'">
                {{ tx.type === 'expense' || tx.amount < 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(tx.amount)) }}
              </p>
              <button class="text-xs font-bold uppercase underline mt-1" @click="remove(tx.id)">Hapus</button>
            </div>
          </BrutalCard>
          <p v-if="!transactionsStore.pageItems.length" class="text-sm">Belum ada transaksi untuk wallet ini.</p>
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

      <div class="space-y-3">
        <h2 class="font-black uppercase">Riwayat Transfer</h2>
        <div class="space-y-2">
          <BrutalCard v-for="t in transfersStore.pageItems" :key="t.id" class="flex items-center justify-between">
            <div>
              <p class="font-bold text-sm">
                {{ t.fromWalletId === walletId ? `→ ${t.toWalletName}` : `${t.fromWalletName} →` }}
              </p>
              <p class="text-xs mt-1">{{ formatDate(t.date) }} · {{ t.note || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="font-black" :class="t.toWalletId === walletId ? 'text-green-700' : 'text-brutal-red'">
                {{ t.toWalletId === walletId ? '+' : '-' }}{{ formatCurrency(t.amount) }}
              </p>
              <div class="flex gap-3 justify-end mt-1">
                <button class="text-xs font-bold uppercase underline" @click="openEditTransfer(t)">Edit</button>
                <button class="text-xs font-bold uppercase underline" @click="removeTransfer(t.id)">Hapus</button>
              </div>
            </div>
          </BrutalCard>
          <p v-if="!transfersStore.pageItems.length" class="text-sm">Belum ada transfer untuk wallet ini.</p>
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
            ({{ transfersStore.pageTotal }} transfer)
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

    <TransactionFormModal v-if="showTransactionModal" :wallet-id="walletId" @close="showTransactionModal = false" />
    <TransferFormModal
      v-if="showTransferModal"
      :wallet-id="walletId"
      :transfer="editingTransfer"
      @close="showTransferModal = false"
    />
  </div>
</template>
