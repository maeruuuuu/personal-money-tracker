export interface Wallet {
  id: number
  name: string
  type: 'cash' | 'bank' | 'ewallet' | 'other'
  initialBalance: number
  color: string
  status: 'active' | 'inactive'
  createdAt: string
  balance: number
}

export const useWalletsStore = defineStore('wallets', {
  state: () => ({
    items: [] as Wallet[],
    loading: false
  }),
  getters: {
    totalBalance: (state) => state.items.reduce((sum, w) => sum + w.balance, 0)
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.items = await useApi()<Wallet[]>('/api/wallets')
      } finally {
        this.loading = false
      }
    },
    async create(payload: { name: string; type: string; initialBalance: number; color: string; status: string }) {
      await useApi()('/api/wallets', { method: 'POST', body: payload })
      await this.fetch()
    },
    async update(
      id: number,
      payload: Partial<{ name: string; type: string; initialBalance: number; color: string; status: string }>
    ) {
      await useApi()(`/api/wallets/${id}`, { method: 'PATCH', body: payload })
      await this.fetch()
    },
    async remove(id: number) {
      await useApi()(`/api/wallets/${id}`, { method: 'DELETE' })
      await this.fetch()
    }
  }
})
