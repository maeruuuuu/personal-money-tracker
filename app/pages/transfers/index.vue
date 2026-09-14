<script setup lang="ts">
const transfersStore = useTransfersStore()
const walletsStore = useWalletsStore()

await Promise.all([transfersStore.fetch(), walletsStore.fetch()])

const showModal = ref(false)

async function remove(id: number) {
  if (!confirm('Hapus transfer ini?')) return
  await transfersStore.remove(id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black uppercase">Transfer Antar Wallet</h1>
      <BrutalButton :disabled="walletsStore.items.length < 2" @click="showModal = true">+ Transfer</BrutalButton>
    </div>

    <p v-if="walletsStore.items.length < 2" class="text-sm">Minimal butuh 2 wallet untuk transfer.</p>

    <div class="space-y-2">
      <BrutalCard v-for="t in transfersStore.items" :key="t.id" class="flex items-center justify-between">
        <div>
          <p class="font-bold">{{ t.fromWalletName }} → {{ t.toWalletName }}</p>
          <p class="text-xs">{{ formatDate(t.date) }} · {{ t.note || '-' }}</p>
        </div>
        <div class="text-right">
          <p class="font-black">{{ formatCurrency(t.amount) }}</p>
          <button class="text-xs font-bold uppercase underline mt-1" @click="remove(t.id)">Hapus</button>
        </div>
      </BrutalCard>
      <p v-if="!transfersStore.items.length" class="text-sm">Belum ada transfer.</p>
    </div>

    <TransferFormModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
