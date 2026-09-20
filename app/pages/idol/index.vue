<script setup lang="ts">
import type { IdolExpense, IdolTopup } from '~/stores/idol'

const idolStore = useIdolStore()
const walletsStore = useWalletsStore()

const PAGE_SIZE = 20

await Promise.all([
  idolStore.fetchPointBalance(),
  idolStore.fetchSummary(),
  idolStore.fetchPage(1, PAGE_SIZE),
  idolStore.fetchTopupPage(1, PAGE_SIZE),
  walletsStore.fetch()
])

const activeTab = ref<'transaksi' | 'topup'>('transaksi')

const showTopupModal = ref(false)
const editingTopup = ref<IdolTopup | null>(null)
const showExpenseModal = ref(false)
const editingExpense = ref<IdolExpense | null>(null)

const categoryColors: Record<string, string> = {
  '2S': '#ff6b9d',
  MnG: '#4d96ff',
  VC: '#6bcf7f',
  Rulet: '#ffd93d',
  Theater: '#b592ff'
}

function openCreateTopup() {
  editingTopup.value = null
  showTopupModal.value = true
}

function openEditTopup(topup: IdolTopup) {
  editingTopup.value = topup
  showTopupModal.value = true
}

function openCreateExpense() {
  editingExpense.value = null
  showExpenseModal.value = true
}

function openEditExpense(expense: IdolExpense) {
  editingExpense.value = expense
  showExpenseModal.value = true
}

async function remove(id: number) {
  if (!confirm('Hapus transaksi idol ini?')) return
  await idolStore.removeExpense(id)
  if (!idolStore.pageItems.length && idolStore.pageNumber > 1) {
    await idolStore.fetchPage(idolStore.pageNumber - 1, PAGE_SIZE)
  }
}

async function removeTopup(id: number) {
  if (!confirm('Hapus topup ini? Saldo JKT48 Point akan berkurang.')) return
  await idolStore.removeTopup(id)
  if (!idolStore.topupItems.length && idolStore.topupPageNumber > 1) {
    await idolStore.fetchTopupPage(idolStore.topupPageNumber - 1, PAGE_SIZE)
  }
}

function goToPage(page: number) {
  if (page < 1 || page > idolStore.pageTotalPages) return
  idolStore.fetchPage(page, PAGE_SIZE)
}

function goToTopupPage(page: number) {
  if (page < 1 || page > idolStore.topupTotalPages) return
  idolStore.fetchTopupPage(page, PAGE_SIZE)
}
</script>

<template>
  <div class="space-y-6">
    <BrutalCard class="bg-brutal-pink">
      <p class="text-xs font-bold uppercase mb-1">JKT48 Point</p>
      <p class="text-3xl font-black">{{ idolStore.pointBalance.toLocaleString('id-ID') }}</p>
    </BrutalCard>

    <div class="flex flex-wrap items-center gap-3">
      <BrutalButton @click="openCreateTopup">+ Topup</BrutalButton>
      <BrutalCard class="px-4 py-2">
        <p class="text-xs font-bold uppercase">Total Expense</p>
        <p class="font-black">{{ formatCurrency(idolStore.totalExpense) }}</p>
      </BrutalCard>
    </div>

    <div class="flex gap-2">
      <button
        class="brutal-border brutal-shadow-sm brutal-press px-4 py-2 text-sm font-bold uppercase"
        :class="activeTab === 'transaksi' ? 'bg-brutal-yellow' : 'bg-brutal-surface'"
        @click="activeTab = 'transaksi'"
      >
        Transaksi
      </button>
      <button
        class="brutal-border brutal-shadow-sm brutal-press px-4 py-2 text-sm font-bold uppercase"
        :class="activeTab === 'topup' ? 'bg-brutal-yellow' : 'bg-brutal-surface'"
        @click="activeTab = 'topup'"
      >
        Topup
      </button>
    </div>

    <template v-if="activeTab === 'transaksi'">
      <div class="flex items-center justify-between">
        <h2 class="font-black uppercase">Transaksi</h2>
        <BrutalButton @click="openCreateExpense">+ Tambah Transaksi</BrutalButton>
      </div>

      <div class="space-y-2">
        <BrutalCard v-for="e in idolStore.pageItems" :key="e.id" class="flex items-center justify-between">
          <div>
            <BrutalBadge :color="categoryColors[e.category]">{{ e.category }}</BrutalBadge>
            <p class="mt-1 text-xs">
              {{ e.paymentMethod === 'point' ? 'JKT48 Point' : e.walletName }} · {{ formatDate(e.date) }}
            </p>
            <p v-if="e.note" class="text-xs">{{ e.note }}</p>
          </div>
          <div class="text-right">
            <p class="font-black text-brutal-red">-{{ formatCurrency(e.amount) }}</p>
            <div class="flex gap-3 justify-end mt-1">
              <button class="text-xs font-bold uppercase underline" @click="openEditExpense(e)">Edit</button>
              <button class="text-xs font-bold uppercase underline" @click="remove(e.id)">Hapus</button>
            </div>
          </div>
        </BrutalCard>
        <p v-if="!idolStore.pageItems.length" class="text-sm">Belum ada transaksi idol.</p>
      </div>

      <div v-if="idolStore.pageTotalPages > 1" class="flex items-center justify-between gap-3">
        <BrutalButton
          variant="ghost"
          :disabled="idolStore.pageNumber <= 1"
          @click="goToPage(idolStore.pageNumber - 1)"
        >
          ← Sebelumnya
        </BrutalButton>
        <p class="text-xs font-bold uppercase">
          Halaman {{ idolStore.pageNumber }} dari {{ idolStore.pageTotalPages }} ({{ idolStore.pageTotal }} transaksi)
        </p>
        <BrutalButton
          variant="ghost"
          :disabled="idolStore.pageNumber >= idolStore.pageTotalPages"
          @click="goToPage(idolStore.pageNumber + 1)"
        >
          Berikutnya →
        </BrutalButton>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="font-black uppercase">Riwayat Topup</h2>
      </div>

      <div class="space-y-2">
        <BrutalCard v-for="t in idolStore.topupItems" :key="t.id" class="flex items-center justify-between">
          <div>
            <p class="font-bold text-sm">Topup</p>
            <p class="text-xs mt-1">{{ formatDate(t.date) }} · {{ t.note || '-' }}</p>
          </div>
          <div class="text-right">
            <p class="font-black text-green-700">+{{ t.amount.toLocaleString('id-ID') }}</p>
            <div class="flex gap-3 justify-end mt-1">
              <button class="text-xs font-bold uppercase underline" @click="openEditTopup(t)">Edit</button>
              <button class="text-xs font-bold uppercase underline" @click="removeTopup(t.id)">Hapus</button>
            </div>
          </div>
        </BrutalCard>
        <p v-if="!idolStore.topupItems.length" class="text-sm">Belum ada topup.</p>
      </div>

      <div v-if="idolStore.topupTotalPages > 1" class="flex items-center justify-between gap-3">
        <BrutalButton
          variant="ghost"
          :disabled="idolStore.topupPageNumber <= 1"
          @click="goToTopupPage(idolStore.topupPageNumber - 1)"
        >
          ← Sebelumnya
        </BrutalButton>
        <p class="text-xs font-bold uppercase">
          Halaman {{ idolStore.topupPageNumber }} dari {{ idolStore.topupTotalPages }} ({{ idolStore.topupTotal }}
          topup)
        </p>
        <BrutalButton
          variant="ghost"
          :disabled="idolStore.topupPageNumber >= idolStore.topupTotalPages"
          @click="goToTopupPage(idolStore.topupPageNumber + 1)"
        >
          Berikutnya →
        </BrutalButton>
      </div>
    </template>

    <IdolTopupFormModal v-if="showTopupModal" :topup="editingTopup" @close="showTopupModal = false" />
    <IdolExpenseFormModal v-if="showExpenseModal" :expense="editingExpense" @close="showExpenseModal = false" />
  </div>
</template>
