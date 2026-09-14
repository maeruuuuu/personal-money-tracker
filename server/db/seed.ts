import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.ts'

const client = createClient({ url: process.env.DATABASE_URL || 'file:./data/db.sqlite' })
const db = drizzle(client, { schema })

async function seed() {
  await db.insert(schema.wallets).values([
    { name: 'Dompet Tunai', type: 'cash', initialBalance: 500000, color: '#6bcf7f' },
    { name: 'BCA', type: 'bank', initialBalance: 2000000, color: '#4d96ff' },
    { name: 'GoPay', type: 'ewallet', initialBalance: 150000, color: '#00aaff' }
  ])

  await db.insert(schema.categories).values([
    { name: 'Gaji', type: 'income', color: '#6bcf7f' },
    { name: 'Bonus', type: 'income', color: '#ffd93d' },
    { name: 'Makanan', type: 'expense', color: '#ff6b9d' },
    { name: 'Transportasi', type: 'expense', color: '#4d96ff' },
    { name: 'Hiburan', type: 'expense', color: '#b592ff' },
    { name: 'Tagihan', type: 'expense', color: '#ff5c5c' }
  ])

  console.log('Seed selesai.')
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
