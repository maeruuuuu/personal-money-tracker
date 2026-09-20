<script setup lang="ts">
const idolStore = useIdolStore()

const emit = defineEmits<{ close: [] }>()

const submitting = ref(false)

const form = reactive({
  amount: 0,
  note: '',
  date: todayInputDate()
})

async function submit() {
  submitting.value = true
  try {
    await idolStore.createTopup({ ...form, amount: Number(form.amount) })
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BrutalModal title="Topup JKT48 Point" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalInput v-model="form.amount" type="number" label="Jumlah Point" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <BrutalButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Topup' }}
      </BrutalButton>
    </form>
  </BrutalModal>
</template>
