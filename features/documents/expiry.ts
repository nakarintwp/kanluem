export function expiryOffsets(expiryDate: string): { daysBefore: number; date: string }[] {
  const offsets = [60, 30, 7, 1]
  return offsets.map((daysBefore) => {
    const d = new Date(expiryDate)
    d.setDate(d.getDate() - daysBefore)
    return { daysBefore, date: d.toISOString().slice(0, 10) }
  })
}

export function isExpiringSoon(expiryDate: string, withinDays: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diff = (expiry.getTime() - today.getTime()) / 86400000
  return diff >= 0 && diff <= withinDays
}
