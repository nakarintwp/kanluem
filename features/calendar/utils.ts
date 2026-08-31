export function getMonthMatrix(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay() // 0 Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const matrix: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDay).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      matrix.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    matrix.push(week)
  }
  return matrix
}

export function groupByDate(reminders: { id: string; title: string; due_at: string }[]): Record<string, typeof reminders> {
  const grouped: Record<string, typeof reminders> = {}
  for (const r of reminders) {
    const date = r.due_at.slice(0, 10) // YYYY-MM-DD
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(r)
  }
  return grouped
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" })
}
