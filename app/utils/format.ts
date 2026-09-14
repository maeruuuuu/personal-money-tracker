export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

export function todayInputDate() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonthInput() {
  return new Date().toISOString().slice(0, 7)
}
