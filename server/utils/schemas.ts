import { z } from 'zod'

export const transactionBodySchema = z
  .object({
    walletId: z.number().int(),
    categoryId: z.number().int().nullable().optional(),
    type: z.enum(['income', 'expense', 'correction']),
    amount: z.number(),
    note: z.string().max(200).default(''),
    date: z.string().min(1)
  })
  .refine((data) => data.type === 'correction' || data.amount > 0, {
    message: 'Jumlah harus lebih dari 0'
  })
  .refine((data) => data.type !== 'correction' || data.amount !== 0, {
    message: 'Selisih koreksi tidak boleh 0'
  })
  .refine((data) => (data.type === 'correction') === (data.categoryId == null), {
    message: 'Kategori wajib diisi untuk income/expense, dan tidak boleh diisi untuk koreksi'
  })

export const transferBodySchema = z
  .object({
    fromWalletId: z.number().int(),
    toWalletId: z.number().int(),
    amount: z.number().positive(),
    note: z.string().max(200).default(''),
    date: z.string().min(1)
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Wallet asal dan tujuan tidak boleh sama'
  })

export const idolExpenseBodySchema = z
  .object({
    category: z.enum(['2S', 'MnG', 'VC', 'Rulet', 'Theater']),
    amount: z.number().positive(),
    note: z.string().max(200).default(''),
    date: z.string().min(1),
    paymentMethod: z.enum(['point', 'wallet']),
    walletId: z.number().int().nullable().optional()
  })
  .refine((data) => (data.paymentMethod === 'wallet') === (data.walletId != null), {
    message: 'Wallet wajib diisi untuk metode wallet, dan tidak boleh diisi untuk metode point'
  })
