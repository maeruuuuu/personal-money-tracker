<script setup lang="ts">
const props = defineProps<{ walletId?: number }>()

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()

const emit = defineEmits<{ close: [] }>()

const error = ref('')
const submitting = ref(false)

const activeWallets = computed(() => walletsStore.items.filter((w) => w.status === 'active'))
const walletOptions = computed(() => {
  const current = walletsStore.items.find((w) => w.id === props.walletId)
  const list = current && current.status === 'inactive' ? [...activeWallets.value, current] : activeWallets.value
  return list.map((w) => ({ label: w.name, value: w.id }))
})

const initialWalletId = props.walletId ?? activeWallets.value[0]?.id ?? 0

const form = reactive({
  walletId: initialWalletId,
  actualBalance: walletsStore.items.find((w) => w.id === initialWalletId)?.balance ?? 0,
  note: '',
  date: todayInputDate()
})

const currentBalance = computed(() => walletsStore.items.find((w) => w.id === form.walletId)?.balance ?? 0)
const difference = computed(() => Number(form.actualBalance) - currentBalance.value)

watch(
  () => form.walletId,
  () => {
    form.actualBalance = currentBalance.value
  }
)

async function submit() {
  error.value = ''
  if (difference.value === 0) {
    error.value = 'Saldo sudah sesuai, tidak ada selisih.'
    return
  }

  submitting.value = true
  try {
    await transactionsStore.create({
      walletId: form.walletId,
      categoryId: null,
      type: 'correction',
      amount: difference.value,
      note: form.note,
      date: form.date
    })
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BrutalModal title="Koreksi Saldo Wallet" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalSelect v-model="form.walletId" label="Wallet" :options="walletOptions" required />

      <div class="brutal-border px-3 py-2 bg-brutal-bg">
        <p class="text-xs font-bold uppercase">Saldo Tercatat</p>
        <p class="text-lg font-black">{{ formatCurrency(currentBalance) }}</p>
      </div>

      <BrutalInput v-model="form.actualBalance" type="number" label="Saldo Real" required />

      <div class="brutal-border px-3 py-2 bg-brutal-bg">
        <p class="text-xs font-bold uppercase">Selisih</p>
        <p class="text-lg font-black" :class="difference >= 0 ? 'text-green-700' : 'text-brutal-red'">
          {{ difference >= 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(difference)) }}
        </p>
      </div>

      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <p v-if="error" class="text-sm font-bold text-brutal-red">{{ error }}</p>
      <BrutalButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Simpan Koreksi' }}
      </BrutalButton>
    </form>
  </BrutalModal>
</template>
