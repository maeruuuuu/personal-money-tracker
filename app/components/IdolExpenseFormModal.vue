<script setup lang="ts">
import type { IdolExpense } from '~/stores/idol'

const props = defineProps<{ expense?: IdolExpense | null }>()
const emit = defineEmits<{ close: [] }>()

const walletsStore = useWalletsStore()
const idolStore = useIdolStore()

const isEditing = computed(() => Boolean(props.expense))
const submitting = ref(false)

const categoryOptions = [
  { label: '2S', value: '2S' },
  { label: 'MnG', value: 'MnG' },
  { label: 'VC', value: 'VC' },
  { label: 'Rulet', value: 'Rulet' },
  { label: 'Theater', value: 'Theater' }
]

const paymentMethodOptions = [
  { label: 'JKT48 Point', value: 'point' },
  { label: 'Wallet', value: 'wallet' }
]

const activeWallets = computed(() => walletsStore.items.filter((w) => w.status === 'active'))
const walletOptions = computed(() => {
  const current = walletsStore.items.find((w) => w.id === props.expense?.walletId)
  const list = current && current.status === 'inactive' ? [...activeWallets.value, current] : activeWallets.value
  return list.map((w) => ({ label: w.name, value: w.id }))
})

const form = reactive({
  category: props.expense?.category ?? '2S',
  paymentMethod: props.expense?.paymentMethod ?? 'point',
  walletId: props.expense?.walletId ?? activeWallets.value[0]?.id ?? 0,
  amount: props.expense?.amount ?? 0,
  note: props.expense?.note ?? '',
  date: props.expense?.date ?? todayInputDate()
})

async function submit() {
  submitting.value = true
  try {
    const payload = {
      category: form.category as IdolExpense['category'],
      paymentMethod: form.paymentMethod as 'point' | 'wallet',
      walletId: form.paymentMethod === 'wallet' ? form.walletId : null,
      amount: Number(form.amount),
      note: form.note,
      date: form.date
    }
    if (isEditing.value && props.expense) {
      await idolStore.updateExpense(props.expense.id, payload)
    } else {
      await idolStore.createExpense(payload)
    }
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BrutalModal :title="isEditing ? 'Edit Transaksi Idol' : 'Tambah Transaksi Idol'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalSelect v-model="form.category" label="Kategori" :options="categoryOptions" required />
      <BrutalSelect v-model="form.paymentMethod" label="Metode Pembayaran" :options="paymentMethodOptions" />
      <BrutalSelect
        v-if="form.paymentMethod === 'wallet'"
        v-model="form.walletId"
        label="Wallet"
        :options="walletOptions"
        required
      />
      <BrutalInput v-model="form.amount" type="number" label="Jumlah (Rp)" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <BrutalButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah' }}
      </BrutalButton>
    </form>
  </BrutalModal>
</template>
