export interface Transaction {
  id: number
  walletId: number
  categoryId: number | null
  type: 'income' | 'expense' | 'correction'
  amount: number
  note: string
  date: string
  createdAt: string
  walletName: string
  categoryName: string | null
  categoryColor: string | null
}

interface PaginatedResponse {
  items: Transaction[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Summary {
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  net: number
}

interface PageFilters {
  walletId?: number
  categoryId?: number
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    items: [] as Transaction[],
    loading: false,
    pageItems: [] as Transaction[],
    pageNumber: 1,
    pageSize: 20,
    pageTotal: 0,
    pageTotalPages: 1,
    pageLoading: false,
    paginationActive: false,
    pageFilters: {} as PageFilters,
    summary: { totalIncome: 0, totalExpense: 0, totalBalance: 0 } as Summary,
    monthlySummary: { totalIncome: 0, totalExpense: 0, net: 0 } as MonthlySummary
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.items = await useApi()<Transaction[]>('/api/transactions')
      } finally {
        this.loading = false
      }
    },
    async fetchPage(page = this.pageNumber, pageSize = this.pageSize, filters?: PageFilters) {
      if (filters) this.pageFilters = filters
      this.paginationActive = true
      this.pageLoading = true
      try {
        const res = await useApi()<PaginatedResponse>('/api/transactions', {
          query: { page, pageSize, ...this.pageFilters }
        })
        this.pageItems = res.items
        this.pageNumber = res.page
        this.pageSize = res.pageSize
        this.pageTotal = res.total
        this.pageTotalPages = res.totalPages
      } finally {
        this.pageLoading = false
      }
    },
    async fetchSummary() {
      this.summary = await useApi()<Summary>('/api/summary')
    },
    async fetchMonthlySummary(month: string) {
      this.monthlySummary = await useApi()<MonthlySummary>('/api/summary/monthly', { query: { month } })
    },
    async refresh() {
      const tasks: Promise<unknown>[] = [
        this.fetchSummary(),
        this.fetchMonthlySummary(currentMonthInput()),
        useWalletsStore().fetch()
      ]
      if (this.paginationActive) tasks.push(this.fetchPage())
      await Promise.all(tasks)
    },
    async create(payload: {
      walletId: number
      categoryId: number | null
      type: 'income' | 'expense' | 'correction'
      amount: number
      note: string
      date: string
    }) {
      await useApi()('/api/transactions', { method: 'POST', body: payload })
      await this.refresh()
    },
    async createBulk(
      items: {
        walletId: number
        categoryId: number | null
        type: 'income' | 'expense' | 'correction'
        amount: number
        note: string
        date: string
      }[]
    ) {
      const res = await useApi()<{ inserted: number }>('/api/transactions/bulk', {
        method: 'POST',
        body: { items }
      })
      await this.refresh()
      return res.inserted
    },
    async update(
      id: number,
      payload: Partial<{
        walletId: number
        categoryId: number | null
        type: 'income' | 'expense' | 'correction'
        amount: number
        note: string
        date: string
      }>
    ) {
      await useApi()(`/api/transactions/${id}`, { method: 'PATCH', body: payload })
      await this.refresh()
    },
    async remove(id: number) {
      await useApi()(`/api/transactions/${id}`, { method: 'DELETE' })
      await this.refresh()
    }
  }
})
