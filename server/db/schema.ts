import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const wallets = sqliteTable('wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['cash', 'bank', 'ewallet', 'other'] }).notNull().default('cash'),
  initialBalance: real('initial_balance').notNull().default(0),
  color: text('color').notNull().default('#4d96ff'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull().default('#ffd93d'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletId: integer('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'restrict' }),
  type: text('type', { enum: ['income', 'expense', 'correction'] }).notNull(),
  amount: real('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const transfers = sqliteTable('transfers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromWalletId: integer('from_wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  toWalletId: integer('to_wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const idolExpenses = sqliteTable('idol_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category', { enum: ['2S', 'MnG', 'VC', 'Rulet', 'Theater'] }).notNull(),
  amount: real('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  paymentMethod: text('payment_method', { enum: ['point', 'wallet'] }).notNull(),
  walletId: integer('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export const idolTopups = sqliteTable('idol_topups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})
