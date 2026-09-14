import { eq, sql } from 'drizzle-orm'
import { useDb } from '../db/client'
import { wallets, transactions, transfers } from '../db/schema'

interface WalletLike {
  id: number
  initialBalance: number
}

interface TransactionLike {
  walletId: number
  type: 'income' | 'expense'
  amount: number
}

interface TransferLike {
  fromWalletId: number
  toWalletId: number
  amount: number
}

export function computeWalletBalance(
  wallet: WalletLike,
  allTransactions: TransactionLike[],
  allTransfers: TransferLike[]
) {
  let balance = wallet.initialBalance

  for (const tx of allTransactions) {
    if (tx.walletId !== wallet.id) continue
    balance += tx.type === 'income' ? tx.amount : -tx.amount
  }

  for (const tr of allTransfers) {
    if (tr.fromWalletId === wallet.id) balance -= tr.amount
    if (tr.toWalletId === wallet.id) balance += tr.amount
  }

  return balance
}

export async function getWalletsWithBalance() {
  const db = useDb()

  const [allWallets, allTransactions, allTransfers] = await Promise.all([
    db.select().from(wallets),
    db.select().from(transactions),
    db.select().from(transfers)
  ])

  return allWallets.map((wallet) => ({
    ...wallet,
    balance: computeWalletBalance(wallet, allTransactions, allTransfers)
  }))
}

export async function getWalletBalance(walletId: number) {
  const wallets = await getWalletsWithBalance()
  return wallets.find((w) => w.id === walletId)?.balance ?? 0
}

export async function getSummary() {
  const db = useDb()

  const [[{ totalIncome }], [{ totalExpense }], [{ initialSum }]] = await Promise.all([
    db
      .select({ totalIncome: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, 'income')),
    db
      .select({ totalExpense: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, 'expense')),
    db.select({ initialSum: sql<number>`coalesce(sum(${wallets.initialBalance}), 0)` }).from(wallets)
  ])

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    totalBalance: Number(initialSum) + Number(totalIncome) - Number(totalExpense)
  }
}
