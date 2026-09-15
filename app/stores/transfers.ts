export interface Transfer {
  id: number
  fromWalletId: number
  toWalletId: number
  amount: number
  note: string
  date: string
  createdAt: string
  fromWalletName: string
  toWalletName: string
}

interface PaginatedResponse {
  items: Transfer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PageFilters {
  walletId?: number
  month?: string
}

export const useTransfersStore = defineStore('transfers', {
  state: () => ({
    items: [] as Transfer[],
    loading: false,
    pageItems: [] as Transfer[],
    pageNumber: 1,
    pageSize: 20,
    pageTotal: 0,
    pageTotalPages: 1,
    pageLoading: false,
    paginationActive: false,
    pageFilters: {} as PageFilters
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.items = await useApi()<Transfer[]>('/api/transfers')
      } finally {
        this.loading = false
      }
    },
    async fetchPage(page = this.pageNumber, pageSize = this.pageSize, filters?: PageFilters) {
      if (filters) this.pageFilters = filters
      this.paginationActive = true
      this.pageLoading = true
      try {
        const res = await useApi()<PaginatedResponse>('/api/transfers', {
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
    async refresh() {
      const tasks: Promise<unknown>[] = [useWalletsStore().fetch()]
      if (this.paginationActive) tasks.push(this.fetchPage())
      else tasks.push(this.fetch())
      await Promise.all(tasks)
    },
    async create(payload: { fromWalletId: number; toWalletId: number; amount: number; note: string; date: string }) {
      await useApi()('/api/transfers', { method: 'POST', body: payload })
      await this.refresh()
    },
    async createBulk(
      items: { fromWalletId: number; toWalletId: number; amount: number; note: string; date: string }[]
    ) {
      const res = await useApi()<{ inserted: number }>('/api/transfers/bulk', { method: 'POST', body: { items } })
      await this.refresh()
      return res.inserted
    },
    async update(
      id: number,
      payload: Partial<{ fromWalletId: number; toWalletId: number; amount: number; note: string; date: string }>
    ) {
      await useApi()(`/api/transfers/${id}`, { method: 'PATCH', body: payload })
      await this.refresh()
    },
    async remove(id: number) {
      await useApi()(`/api/transfers/${id}`, { method: 'DELETE' })
      await this.refresh()
    }
  }
})
