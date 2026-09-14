<script setup lang="ts">
import type { Transaction } from '~/stores/transactions'

const props = defineProps<{ transaction?: Transaction | null }>()
const emit = defineEmits<{ close: [] }>()

const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const isEditing = computed(() => Boolean(props.transaction))

const form = reactive({
  type: props.transaction?.type ?? ('expense' as 'income' | 'expense'),
  walletId: props.transaction?.walletId ?? walletsStore.items[0]?.id ?? 0,
  categoryId: props.transaction?.categoryId ?? categoriesStore.expense[0]?.id ?? 0,
  amount: props.transaction?.amount ?? 0,
  note: props.transaction?.note ?? '',
  date: props.transaction?.date ?? todayInputDate()
})

const walletOptions = computed(() => walletsStore.items.map((w) => ({ label: w.name, value: w.id })))
const categoryOptions = computed(() =>
  (form.type === 'income' ? categoriesStore.income : categoriesStore.expense).map((c) => ({
    label: c.name,
    value: c.id
  }))
)

watch(
  () => form.type,
  () => {
    if (!categoryOptions.value.some((c) => c.value === form.categoryId)) {
      form.categoryId = categoryOptions.value[0]?.value ?? 0
    }
  }
)

async function submit() {
  const payload = { ...form, amount: Number(form.amount) }
  if (isEditing.value && props.transaction) {
    await transactionsStore.update(props.transaction.id, payload)
  } else {
    await transactionsStore.create(payload)
  }
  emit('close')
}
</script>

<template>
  <BrutalModal :title="isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalSelect
        v-model="form.type"
        label="Tipe"
        :options="[
          { label: 'Pengeluaran', value: 'expense' },
          { label: 'Pemasukan', value: 'income' }
        ]"
      />
      <BrutalSelect v-model="form.walletId" label="Wallet" :options="walletOptions" required />
      <BrutalSelect v-model="form.categoryId" label="Kategori" :options="categoryOptions" required />
      <BrutalInput v-model="form.amount" type="number" label="Jumlah (Rp)" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <BrutalButton type="submit" class="w-full">{{ isEditing ? 'Simpan' : 'Tambah' }}</BrutalButton>
    </form>
  </BrutalModal>
</template>
