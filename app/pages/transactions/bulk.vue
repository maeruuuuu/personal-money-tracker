<script setup lang="ts">
interface BulkRow {
  type: 'expense' | 'income' | 'transfer'
  walletId: number
  categoryId: number | null
  toWalletId: number
  amount: number | string
  date: string
  note: string
}

const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const transfersStore = useTransfersStore()

await Promise.all([walletsStore.fetch(), categoriesStore.fetch()])

const activeWallets = computed(() => walletsStore.items.filter((w) => w.status === 'active'))
const walletOptions = computed(() => activeWallets.value.map((w) => ({ label: w.name, value: w.id })))

function categoryOptionsFor(type: 'income' | 'expense') {
  const list = (type === 'income' ? categoriesStore.income : categoriesStore.expense).filter(
    (c) => c.status === 'active'
  )
  return list.map((c) => ({ label: c.name, value: c.id }))
}

const typeOptions = [
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Transfer', value: 'transfer' }
]

function blankRow(base?: Partial<BulkRow>): BulkRow {
  const walletId = base?.walletId ?? activeWallets.value[0]?.id ?? 0
  return {
    type: 'expense',
    walletId,
    categoryId: categoryOptionsFor('expense')[0]?.value ?? null,
    toWalletId: activeWallets.value.find((w) => w.id !== walletId)?.id ?? walletId,
    amount: '',
    date: base?.date ?? todayInputDate(),
    note: ''
  }
}

const rows = ref<BulkRow[]>([blankRow(), blankRow(), blankRow()])
const errors = ref<Record<number, string>>({})
const submitting = ref(false)
const result = ref<{ transactions: number; transfers: number } | null>(null)

function addRow() {
  const last = rows.value[rows.value.length - 1]
  rows.value.push(blankRow(last ? { walletId: last.walletId, date: last.date } : undefined))
}

function removeRow(index: number) {
  if (rows.value.length <= 1) return
  rows.value.splice(index, 1)
}

function onTypeChange(row: BulkRow) {
  if (row.type === 'transfer') {
    row.categoryId = null
    if (row.toWalletId === row.walletId) {
      row.toWalletId = activeWallets.value.find((w) => w.id !== row.walletId)?.id ?? row.walletId
    }
  } else {
    row.categoryId = categoryOptionsFor(row.type)[0]?.value ?? null
  }
}

function validate(): boolean {
  const nextErrors: Record<number, string> = {}

  rows.value.forEach((row, i) => {
    const amount = Number(row.amount)
    if (!row.walletId) {
      nextErrors[i] = 'Wallet wajib dipilih'
    } else if (!amount || amount <= 0) {
      nextErrors[i] = 'Jumlah harus lebih dari 0'
    } else if (row.type === 'transfer') {
      if (!row.toWalletId) nextErrors[i] = 'Wallet tujuan wajib dipilih'
      else if (row.toWalletId === row.walletId) nextErrors[i] = 'Wallet asal dan tujuan tidak boleh sama'
    } else if (!row.categoryId) {
      nextErrors[i] = 'Kategori wajib dipilih'
    }
  })

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

async function submit() {
  result.value = null
  if (!validate()) return

  submitting.value = true
  try {
    const transactionItems = rows.value
      .filter((r) => r.type !== 'transfer')
      .map((r) => ({
        walletId: r.walletId,
        categoryId: r.categoryId,
        type: r.type as 'income' | 'expense',
        amount: Number(r.amount),
        note: r.note,
        date: r.date
      }))
    const transferItems = rows.value
      .filter((r) => r.type === 'transfer')
      .map((r) => ({
        fromWalletId: r.walletId,
        toWalletId: r.toWalletId,
        amount: Number(r.amount),
        note: r.note,
        date: r.date
      }))

    const [txCount, trCount] = await Promise.all([
      transactionItems.length ? transactionsStore.createBulk(transactionItems) : Promise.resolve(0),
      transferItems.length ? transfersStore.createBulk(transferItems) : Promise.resolve(0)
    ])

    result.value = { transactions: txCount, transfers: trCount }
    rows.value = [blankRow(), blankRow(), blankRow()]
    errors.value = {}
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Bulk Insert</h1>
      <NuxtLink to="/transactions" class="text-xs font-bold uppercase underline">← Kembali ke Transaksi</NuxtLink>
    </div>

    <p v-if="!activeWallets.length" class="text-sm">Buat wallet dulu sebelum mencatat transaksi.</p>

    <BrutalCard v-if="result" class="bg-brutal-green">
      <p class="font-bold">
        Tersimpan: {{ result.transactions }} transaksi, {{ result.transfers }} transfer.
      </p>
    </BrutalCard>

    <div v-if="activeWallets.length" class="space-y-2">
      <BrutalCard v-for="(row, i) in rows" :key="i" class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase">Baris {{ i + 1 }}</p>
          <button
            type="button"
            class="text-xs font-bold uppercase underline disabled:opacity-30"
            :disabled="rows.length <= 1"
            @click="removeRow(i)"
          >
            Hapus
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <BrutalSelect v-model="row.type" label="Tipe" :options="typeOptions" @change="onTypeChange(row)" />
          <BrutalSelect v-model="row.walletId" label="Wallet" :options="walletOptions" />
          <BrutalSelect
            v-if="row.type !== 'transfer'"
            v-model="row.categoryId"
            label="Kategori"
            :options="categoryOptionsFor(row.type)"
          />
          <BrutalSelect v-else v-model="row.toWalletId" label="Ke Wallet" :options="walletOptions" />
          <BrutalInput v-model="row.amount" type="number" label="Jumlah (Rp)" min="1" />
          <BrutalInput v-model="row.date" type="date" label="Tanggal" />
          <BrutalInput v-model="row.note" label="Catatan (opsional)" />
        </div>

        <p v-if="errors[i]" class="text-xs font-bold text-brutal-red">{{ errors[i] }}</p>
      </BrutalCard>
    </div>

    <div v-if="activeWallets.length" class="flex flex-wrap gap-3">
      <BrutalButton variant="ghost" @click="addRow">+ Tambah Baris</BrutalButton>
      <BrutalButton :disabled="submitting" @click="submit">
        {{ submitting ? 'Menyimpan...' : 'Simpan Semua' }}
      </BrutalButton>
    </div>
  </div>
</template>
