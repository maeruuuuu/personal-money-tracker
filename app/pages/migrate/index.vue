<script setup lang="ts">
interface MigratePreview {
  files: string[]
  newWalletsCount: number
  newWallets: string[]
  newCategoriesCount: number
  newCategories: { name: string; type: 'income' | 'expense' }[]
  transactionCount: number
  transferCount: number
  totals: { income: number; expense: number; transferAmount: number }
  dateRange: [string, string] | null
}

interface MigrateResult {
  walletsCreated: number
  categoriesCreated: number
  transactionsInserted: number
  transfersInserted: number
}

const preview = ref<MigratePreview | null>(null)
const loading = ref(false)
const importing = ref(false)
const error = ref('')
const result = ref<MigrateResult | null>(null)

async function loadPreview() {
  loading.value = true
  error.value = ''
  try {
    preview.value = await useApi()<MigratePreview>('/api/migrate/preview')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Gagal membaca CSV'
  } finally {
    loading.value = false
  }
}

async function runImport() {
  if (!preview.value) return
  const confirmed = confirm(
    `Import ${preview.value.transactionCount} transaksi dan ${preview.value.transferCount} transfer? Tindakan ini tidak bisa dibatalkan otomatis.`
  )
  if (!confirmed) return

  importing.value = true
  error.value = ''
  try {
    result.value = await useApi()<MigrateResult>('/api/migrate/import', { method: 'POST' })
    await loadPreview()
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Gagal menjalankan import'
  } finally {
    importing.value = false
  }
}

await loadPreview()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Migrate</h1>
      <BrutalButton variant="ghost" :disabled="loading" @click="loadPreview">Refresh</BrutalButton>
    </div>

    <BrutalCard v-if="error" class="bg-brutal-red text-white">
      <p class="font-bold">{{ error }}</p>
    </BrutalCard>

    <BrutalCard v-if="result" class="bg-brutal-green">
      <p class="font-black uppercase mb-2">Import selesai</p>
      <ul class="text-sm space-y-1">
        <li>{{ result.walletsCreated }} wallet baru dibuat</li>
        <li>{{ result.categoriesCreated }} kategori baru dibuat</li>
        <li>{{ result.transactionsInserted }} transaksi diimport</li>
        <li>{{ result.transfersInserted }} transfer diimport</li>
      </ul>
    </BrutalCard>

    <template v-if="preview">
      <BrutalCard v-if="preview.files.length === 0">
        <p class="text-sm">Tidak ada file CSV ditemukan di folder <code>migrate/</code>.</p>
      </BrutalCard>

      <template v-else>
        <BrutalCard>
          <p class="text-xs font-bold uppercase mb-2">File ditemukan</p>
          <ul class="text-sm list-disc list-inside">
            <li v-for="f in preview.files" :key="f">{{ f }}</li>
          </ul>
        </BrutalCard>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Wallet Baru</p>
            <p class="text-2xl font-black mt-1">{{ preview.newWalletsCount }}</p>
          </BrutalCard>
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Kategori Baru</p>
            <p class="text-2xl font-black mt-1">{{ preview.newCategoriesCount }}</p>
          </BrutalCard>
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Transaksi</p>
            <p class="text-2xl font-black mt-1">{{ preview.transactionCount }}</p>
          </BrutalCard>
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Transfer</p>
            <p class="text-2xl font-black mt-1">{{ preview.transferCount }}</p>
          </BrutalCard>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Total Income</p>
            <p class="text-lg font-black mt-1">{{ formatCurrency(preview.totals.income) }}</p>
          </BrutalCard>
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Total Expense</p>
            <p class="text-lg font-black mt-1">{{ formatCurrency(preview.totals.expense) }}</p>
          </BrutalCard>
          <BrutalCard>
            <p class="text-xs font-bold uppercase">Total Transfer</p>
            <p class="text-lg font-black mt-1">{{ formatCurrency(preview.totals.transferAmount) }}</p>
          </BrutalCard>
        </div>

        <BrutalCard v-if="preview.dateRange">
          <p class="text-xs font-bold uppercase">Rentang Tanggal</p>
          <p class="text-sm mt-1">{{ preview.dateRange[0] }} &mdash; {{ preview.dateRange[1] }}</p>
        </BrutalCard>

        <div v-if="preview.newWallets.length > 0 || preview.newCategories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BrutalCard v-if="preview.newWallets.length > 0">
            <p class="text-xs font-bold uppercase mb-2">Wallet yang akan dibuat</p>
            <ul class="text-sm list-disc list-inside max-h-48 overflow-y-auto">
              <li v-for="w in preview.newWallets" :key="w">{{ w }}</li>
            </ul>
          </BrutalCard>
          <BrutalCard v-if="preview.newCategories.length > 0">
            <p class="text-xs font-bold uppercase mb-2">Kategori yang akan dibuat</p>
            <ul class="text-sm list-disc list-inside max-h-48 overflow-y-auto">
              <li v-for="c in preview.newCategories" :key="`${c.name}-${c.type}`">
                {{ c.name }} <span class="text-xs opacity-60">({{ c.type }})</span>
              </li>
            </ul>
          </BrutalCard>
        </div>

        <BrutalButton :disabled="importing || preview.transactionCount + preview.transferCount === 0" @click="runImport">
          {{ importing ? 'Mengimport...' : 'Jalankan Import' }}
        </BrutalButton>
      </template>
    </template>
  </div>
</template>
