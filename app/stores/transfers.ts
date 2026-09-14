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

export const useTransfersStore = defineStore('transfers', {
  state: () => ({
    items: [] as Transfer[],
    loading: false
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
    async create(payload: { fromWalletId: number; toWalletId: number; amount: number; note: string; date: string }) {
      await useApi()('/api/transfers', { method: 'POST', body: payload })
      await Promise.all([this.fetch(), useWalletsStore().fetch()])
    },
    async remove(id: number) {
      await useApi()(`/api/transfers/${id}`, { method: 'DELETE' })
      await Promise.all([this.fetch(), useWalletsStore().fetch()])
    }
  }
})
