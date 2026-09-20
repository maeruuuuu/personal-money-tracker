<script setup lang="ts">
import type { IdolTopup } from '~/stores/idol'

const props = defineProps<{ topup?: IdolTopup | null }>()
const emit = defineEmits<{ close: [] }>()

const idolStore = useIdolStore()

const isEditing = computed(() => Boolean(props.topup))
const submitting = ref(false)

const form = reactive({
  amount: props.topup?.amount ?? 0,
  note: props.topup?.note ?? '',
  date: props.topup?.date ?? todayInputDate()
})

async function submit() {
  submitting.value = true
  try {
    const payload = { ...form, amount: Number(form.amount) }
    if (isEditing.value && props.topup) {
      await idolStore.updateTopup(props.topup.id, payload)
    } else {
      await idolStore.createTopup(payload)
    }
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BrutalModal :title="isEditing ? 'Edit Topup' : 'Topup JKT48 Point'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <BrutalInput v-model="form.amount" type="number" label="Jumlah Point" min="1" required />
      <BrutalInput v-model="form.date" type="date" label="Tanggal" required />
      <BrutalInput v-model="form.note" label="Catatan (opsional)" />
      <BrutalButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Topup' }}
      </BrutalButton>
    </form>
  </BrutalModal>
</template>
