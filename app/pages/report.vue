<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const transactionsStore = useTransactionsStore()
await transactionsStore.fetch()

const selectedMonth = ref(currentMonthInput())

const filteredTransactions = computed(() =>
  transactionsStore.items.filter((tx) => tx.date.slice(0, 7) === selectedMonth.value)
)

function groupByCategory(type: 'income' | 'expense') {
  const map = new Map<string, { total: number; color: string }>()
  for (const tx of filteredTransactions.value) {
    if (tx.type !== type) continue
    const entry = map.get(tx.categoryName) ?? { total: 0, color: tx.categoryColor }
    entry.total += tx.amount
    map.set(tx.categoryName, entry)
  }
  return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total)
}

const expenseByCategory = computed(() => groupByCategory('expense'))
const incomeByCategory = computed(() => groupByCategory('income'))

const chartData = computed(() => ({
  labels: expenseByCategory.value.map((e) => e.name),
  datasets: [
    {
      data: expenseByCategory.value.map((e) => e.total),
      backgroundColor: expenseByCategory.value.map((e) => e.color),
      borderColor: '#111111',
      borderWidth: 3
    }
  ]
}))

const chartOptions = { plugins: { legend: { position: 'bottom' as const } } }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-black uppercase">Laporan</h1>
      <BrutalInput v-model="selectedMonth" type="month" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BrutalCard>
        <h2 class="font-black uppercase mb-3">Pengeluaran per Kategori</h2>
        <div v-if="expenseByCategory.length" class="max-w-xs mx-auto">
          <Doughnut :data="chartData" :options="chartOptions" />
        </div>
        <p v-else class="text-sm">Belum ada transaksi pengeluaran bulan ini.</p>
      </BrutalCard>

      <BrutalCard>
        <h2 class="font-black uppercase mb-3">Rincian Pengeluaran</h2>
        <ul v-if="expenseByCategory.length" class="space-y-2">
          <li
            v-for="c in expenseByCategory"
            :key="c.name"
            class="brutal-border px-3 py-2 flex items-center justify-between text-sm"
          >
            <BrutalBadge :color="c.color">{{ c.name }}</BrutalBadge>
            <span class="font-bold text-brutal-red">{{ formatCurrency(c.total) }}</span>
          </li>
        </ul>
        <p v-else class="text-sm">Belum ada transaksi pengeluaran bulan ini.</p>
      </BrutalCard>

      <BrutalCard>
        <h2 class="font-black uppercase mb-3">Rincian Pemasukan</h2>
        <ul v-if="incomeByCategory.length" class="space-y-2">
          <li
            v-for="c in incomeByCategory"
            :key="c.name"
            class="brutal-border px-3 py-2 flex items-center justify-between text-sm"
          >
            <BrutalBadge :color="c.color">{{ c.name }}</BrutalBadge>
            <span class="font-bold text-green-700">{{ formatCurrency(c.total) }}</span>
          </li>
        </ul>
        <p v-else class="text-sm">Belum ada transaksi pemasukan bulan ini.</p>
      </BrutalCard>
    </div>
  </div>
</template>
