export function detectRepeated(reminders: { title: string; due_at: string }[]): { title: string; count: number }[] {
  const map = new Map<string, number>()
  for (const r of reminders) {
    map.set(r.title, (map.get(r.title) || 0) + 1)
  }
  return Array.from(map.entries())
    .filter(([, count]) => count >= 2)
    .map(([title, count]) => ({ title, count }))
}

export function upcomingExpiries(docs: { name: string; expiry_date: string | null }[], withinDays: number): typeof docs {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return docs.filter((d) => {
    if (!d.expiry_date) return false
    const expiry = new Date(d.expiry_date)
    expiry.setHours(0, 0, 0, 0)
    const diff = (expiry.getTime() - now.getTime()) / 86400000
    return diff >= 0 && diff <= withinDays
  })
}

export function missingReminders(reminders: { title: string }[], expected: string[]): string[] {
  const titles = new Set(reminders.map((r) => r.title))
  return expected.filter((e) => !titles.has(e))
}
