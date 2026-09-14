<script setup lang="ts">
const props = defineProps<{ walletId?: number }>()

const walletsStore = useWalletsStore()
const transfersStore = useTransfersStore()

const emit = defineEmits<{ close: [] }>()

const error = ref('')

const activeWallets = computed(() => walletsStore.items.filter((w) => w.status === 'active'))
const walletOptions = computed(() => activeWallets.value.map((w) => ({ label: w.name, value: w.id })))

const initialFromWalletId = props.walletId ?? activeWallets.value[0]?.id ?? 0

const form = reactive({
  fromWalletId: initialFromWalletId,
  toWalletId:
    activeWallets.value.find((w) => w.id !== initialFromWalletId)?.id ?? activeWallets.value[0]?.id ?? 0,
  amount: 0,
  note: '',
  date: todayInputDate()
})

async function submit() {
  error.value = ''
  if (form.fromWalletId === form.toWalletId) {
    error.value = 'Wallet asal dan tujuan tidak boleh sama.'
    return
  }
  await transfersStore.create({ ...form, amount: Number(form.amount) })
  emit('close')
}
</script>

<template>
  <BrutalModal title="Transfer Antar Wallet" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalSelect v-model="form.fromWalletId" label="Dari Wallet" :options="walletOptions" required />
      <BrutalSelect v-model="form.toWalletId" label="Ke Wallet" :options="walletOptions" required />
      <BrutalInput v-model="form.amount" type="number" label="Jumlah (Rp)" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <p v-if="error" class="text-sm font-bold text-brutal-red">{{ error }}</p>
      <BrutalButton type="submit" class="w-full">Transfer</BrutalButton>
    </form>
  </BrutalModal>
</template>
