export type IdolCategory = '2S' | 'MnG' | 'VC' | 'Rulet' | 'Theater'

export interface IdolExpense {
  id: number
  category: IdolCategory
  amount: number
  note: string
  date: string
  paymentMethod: 'point' | 'wallet'
  walletId: number | null
  createdAt: string
  walletName: string | null
}

export interface IdolTopup {
  id: number
  amount: number
  note: string
  date: string
  createdAt: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const useIdolStore = defineStore('idol', {
  state: () => ({
    pointBalance: 0,
    totalExpense: 0,
    pageItems: [] as IdolExpense[],
    pageNumber: 1,
    pageSize: 20,
    pageTotal: 0,
    pageTotalPages: 1,
    pageLoading: false,
    paginationActive: false,
    topupItems: [] as IdolTopup[],
    topupPageNumber: 1,
    topupPageSize: 20,
    topupTotal: 0,
    topupTotalPages: 1,
    topupPaginationActive: false
  }),
  actions: {
    async fetchPointBalance() {
      const res = await useApi()<{ balance: number }>('/api/idol/point-balance')
      this.pointBalance = res.balance
    },
    async fetchSummary() {
      const res = await useApi()<{ totalExpense: number }>('/api/idol/summary')
      this.totalExpense = res.totalExpense
    },
    async fetchPage(page = this.pageNumber, pageSize = this.pageSize) {
      this.paginationActive = true
      this.pageLoading = true
      try {
        const res = await useApi()<PaginatedResponse<IdolExpense>>('/api/idol/expenses', {
          query: { page, pageSize }
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
    async fetchTopupPage(page = this.topupPageNumber, pageSize = this.topupPageSize) {
      this.topupPaginationActive = true
      const res = await useApi()<PaginatedResponse<IdolTopup>>('/api/idol/topups', {
        query: { page, pageSize }
      })
      this.topupItems = res.items
      this.topupPageNumber = res.page
      this.topupPageSize = res.pageSize
      this.topupTotal = res.total
      this.topupTotalPages = res.totalPages
    },
    async refresh() {
      const tasks: Promise<unknown>[] = [this.fetchPointBalance(), this.fetchSummary(), useWalletsStore().fetch()]
      if (this.paginationActive) tasks.push(this.fetchPage())
      if (this.topupPaginationActive) tasks.push(this.fetchTopupPage())
      await Promise.all(tasks)
    },
    async createExpense(payload: {
      category: IdolCategory
      amount: number
      note: string
      date: string
      paymentMethod: 'point' | 'wallet'
      walletId: number | null
    }) {
      await useApi()('/api/idol/expenses', { method: 'POST', body: payload })
      await this.refresh()
    },
    async updateExpense(
      id: number,
      payload: Partial<{
        category: IdolCategory
        amount: number
        note: string
        date: string
        paymentMethod: 'point' | 'wallet'
        walletId: number | null
      }>
    ) {
      await useApi()(`/api/idol/expenses/${id}`, { method: 'PATCH', body: payload })
      await this.refresh()
    },
    async removeExpense(id: number) {
      await useApi()(`/api/idol/expenses/${id}`, { method: 'DELETE' })
      await this.refresh()
    },
    async createTopup(payload: { amount: number; note: string; date: string }) {
      await useApi()('/api/idol/topups', { method: 'POST', body: payload })
      await this.refresh()
    },
    async updateTopup(id: number, payload: Partial<{ amount: number; note: string; date: string }>) {
      await useApi()(`/api/idol/topups/${id}`, { method: 'PATCH', body: payload })
      await this.refresh()
    },
    async removeTopup(id: number) {
      await useApi()(`/api/idol/topups/${id}`, { method: 'DELETE' })
      await this.refresh()
    }
  }
})
