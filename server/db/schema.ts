import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const wallets = sqliteTable('wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['cash', 'bank', 'ewallet', 'other'] }).notNull().default('cash'),
  initialBalance: integer('initial_balance').notNull().default(0),
  color: text('color').notNull().default('#4d96ff'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull().default('#ffd93d'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletId: integer('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: integer('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const transfers = sqliteTable('transfers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromWalletId: integer('from_wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  toWalletId: integer('to_wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})
