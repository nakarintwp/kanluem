export function refillDate(startDate: string, days: number): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isLowStock(remaining: number | null, threshold = 7): boolean {
  if (remaining === null || remaining === undefined) return false
  return remaining <= threshold
}
