export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
  createdAt: string
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    items: [] as Category[],
    loading: false
  }),
  getters: {
    income: (state) => state.items.filter((c) => c.type === 'income'),
    expense: (state) => state.items.filter((c) => c.type === 'expense')
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.items = await useApi()<Category[]>('/api/categories')
      } finally {
        this.loading = false
      }
    },
    async create(payload: { name: string; type: 'income' | 'expense'; color: string }) {
      await useApi()('/api/categories', { method: 'POST', body: payload })
      await this.fetch()
    },
    async update(id: number, payload: Partial<{ name: string; type: 'income' | 'expense'; color: string }>) {
      await useApi()(`/api/categories/${id}`, { method: 'PATCH', body: payload })
      await this.fetch()
    },
    async remove(id: number) {
      await useApi()(`/api/categories/${id}`, { method: 'DELETE' })
      await this.fetch()
    }
  }
})
