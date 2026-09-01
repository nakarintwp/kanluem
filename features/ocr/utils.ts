export function extractDate(text: string): string | null {
  // matches 15/12/2026 or 15-12-2026
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (!m) return null
  const dd = m[1].padStart(2, "0")
  const mm = m[2].padStart(2, "0")
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

export function suggestReminder(expiryDate: string, docName: string): { title: string; due_at: string; offsets: number[] } {
  return {
    title: `${docName} หมดอายุ ${expiryDate}`,
    due_at: expiryDate,
    offsets: [60, 30, 7, 1],
  }
}
