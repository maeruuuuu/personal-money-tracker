<script setup lang="ts">
import type { Transfer } from '~/stores/transfers'

const props = defineProps<{ walletId?: number; transfer?: Transfer | null }>()

const walletsStore = useWalletsStore()
const transfersStore = useTransfersStore()

const emit = defineEmits<{ close: [] }>()

const error = ref('')
const isEditing = computed(() => Boolean(props.transfer))

const activeWallets = computed(() => walletsStore.items.filter((w) => w.status === 'active'))
const walletOptions = computed(() => {
  const usedIds = new Set([props.transfer?.fromWalletId, props.transfer?.toWalletId, props.walletId])
  const extras = walletsStore.items.filter((w) => w.status === 'inactive' && usedIds.has(w.id))
  return [...activeWallets.value, ...extras].map((w) => ({ label: w.name, value: w.id }))
})

const initialFromWalletId = props.transfer?.fromWalletId ?? props.walletId ?? activeWallets.value[0]?.id ?? 0

const form = reactive({
  fromWalletId: initialFromWalletId,
  toWalletId:
    props.transfer?.toWalletId ??
    activeWallets.value.find((w) => w.id !== initialFromWalletId)?.id ??
    activeWallets.value[0]?.id ??
    0,
  amount: props.transfer?.amount ?? 0,
  note: props.transfer?.note ?? '',
  date: props.transfer?.date ?? todayInputDate()
})

async function submit() {
  error.value = ''
  if (form.fromWalletId === form.toWalletId) {
    error.value = 'Wallet asal dan tujuan tidak boleh sama.'
    return
  }
  const payload = { ...form, amount: Number(form.amount) }
  if (isEditing.value && props.transfer) {
    await transfersStore.update(props.transfer.id, payload)
  } else {
    await transfersStore.create(payload)
  }
  emit('close')
}
</script>

<template>
  <BrutalModal :title="isEditing ? 'Edit Transfer' : 'Transfer Antar Wallet'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalSelect v-model="form.fromWalletId" label="Dari Wallet" :options="walletOptions" required />
      <BrutalSelect v-model="form.toWalletId" label="Ke Wallet" :options="walletOptions" required />
      <BrutalInput v-model="form.amount" type="number" label="Jumlah (Rp)" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <p v-if="error" class="text-sm font-bold text-brutal-red">{{ error }}</p>
      <BrutalButton type="submit" class="w-full">{{ isEditing ? 'Simpan' : 'Transfer' }}</BrutalButton>
    </form>
  </BrutalModal>
</template>
