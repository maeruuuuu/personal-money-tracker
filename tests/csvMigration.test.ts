import { describe, it, expect } from 'vitest'
import { parseCsv, parseDateTime, transformRows, roundAmount } from '../server/utils/csvMigration'

describe('parseCsv', () => {
  it('parses simple quoted rows', () => {
    const rows = parseCsv('"a","b","c"\n"1","2","3"\n')
    expect(rows).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('handles commas and escaped quotes inside fields', () => {
    const rows = parseCsv('"Note, with comma","He said ""hi"""\n')
    expect(rows).toEqual([['Note, with comma', 'He said "hi"']])
  })

  it('skips blank lines', () => {
    const rows = parseCsv('"a","b"\n\n"c","d"\n')
    expect(rows).toEqual([['a', 'b'], ['c', 'd']])
  })
})

describe('parseDateTime', () => {
  it('parses a 12-hour timestamp into a date string and sort key', () => {
    const { dateStr, sortKey } = parseDateTime('Dec 03, 2021 3:47 PM')
    expect(dateStr).toBe('2021-12-03')
    const midnight = parseDateTime('Dec 03, 2021 12:00 AM')
    const noon = parseDateTime('Dec 03, 2021 12:00 PM')
    expect(midnight.sortKey).toBeLessThan(noon.sortKey)
    expect(noon.sortKey).toBeLessThan(sortKey)
  })

  it('orders across days and months correctly', () => {
    const a = parseDateTime('Jan 01, 2022 11:59 PM')
    const b = parseDateTime('Jan 02, 2022 12:00 AM')
    expect(a.sortKey).toBeLessThan(b.sortKey)
  })
})

describe('roundAmount', () => {
  it('rounds to 2 decimals', () => {
    expect(roundAmount('49.609999999')).toBeCloseTo(49.61, 2)
    expect(roundAmount('1400000.00')).toBe(1400000)
  })
})

describe('transformRows', () => {
  it('maps expense and income rows to transaction drafts', () => {
    const { transactions, transfers } = transformRows([
      ['Dec 03, 2021 3:47 PM', '(-) Expense', '1400000.00', 'Indekos', '[02] BNI', 'Bayar Kosan'],
      ['Dec 03, 2021 3:48 PM', '(+) Income', '5700000.00', 'Salary', '[02] BNI', 'Dana Awal']
    ])
    expect(transactions).toHaveLength(2)
    expect(transfers).toHaveLength(0)
    expect(transactions[0]).toMatchObject({ type: 'expense', walletName: '[02] BNI', categoryName: 'Indekos', amount: 1400000 })
    expect(transactions[1]).toMatchObject({ type: 'income', categoryName: 'Salary' })
  })

  it('splits transfer accounts and skips the placeholder category', () => {
    const { transactions, transfers } = transformRows([
      ['Dec 18, 2021 1:14 PM', '(*) Transfer', '150000.00', '  -  ', '[02] BNI->[04] Gopay', '']
    ])
    expect(transactions).toHaveLength(0)
    expect(transfers).toHaveLength(1)
    expect(transfers[0]).toMatchObject({ fromWalletName: '[02] BNI', toWalletName: '[04] Gopay', amount: 150000 })
  })
})
