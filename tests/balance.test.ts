import { describe, it, expect } from 'vitest'
import { computeWalletBalance } from '../server/utils/balance'

describe('computeWalletBalance', () => {
  it('starts from initial balance when there is no activity', () => {
    expect(computeWalletBalance({ id: 1, initialBalance: 500000 }, [], [])).toBe(500000)
  })

  it('adds income and subtracts expense for the matching wallet only', () => {
    const balance = computeWalletBalance(
      { id: 1, initialBalance: 100000 },
      [
        { walletId: 1, type: 'income', amount: 50000 },
        { walletId: 1, type: 'expense', amount: 20000 },
        { walletId: 2, type: 'income', amount: 999999 }
      ],
      []
    )
    expect(balance).toBe(130000)
  })

  it('subtracts outgoing transfers and adds incoming transfers', () => {
    const balance = computeWalletBalance(
      { id: 1, initialBalance: 200000 },
      [],
      [
        { fromWalletId: 1, toWalletId: 2, amount: 50000 },
        { fromWalletId: 2, toWalletId: 1, amount: 30000 }
      ]
    )
    expect(balance).toBe(180000)
  })

  it('combines transactions and transfers together', () => {
    const balance = computeWalletBalance(
      { id: 1, initialBalance: 0 },
      [
        { walletId: 1, type: 'income', amount: 1000000 },
        { walletId: 1, type: 'expense', amount: 250000 }
      ],
      [{ fromWalletId: 1, toWalletId: 2, amount: 100000 }]
    )
    expect(balance).toBe(650000)
  })

  it('applies a correction as a signed delta, positive or negative', () => {
    const higher = computeWalletBalance(
      { id: 1, initialBalance: 100000 },
      [{ walletId: 1, type: 'correction', amount: 5000 }],
      []
    )
    expect(higher).toBe(105000)

    const lower = computeWalletBalance(
      { id: 1, initialBalance: 100000 },
      [{ walletId: 1, type: 'correction', amount: -20000 }],
      []
    )
    expect(lower).toBe(80000)
  })

  it('subtracts idol expenses paid from this wallet, ignoring other wallets and point-paid ones', () => {
    const balance = computeWalletBalance(
      { id: 1, initialBalance: 100000 },
      [],
      [],
      [
        { walletId: 1, amount: 15000 },
        { walletId: 2, amount: 999999 },
        { walletId: null, amount: 5000 }
      ]
    )
    expect(balance).toBe(85000)
  })
})
