export function nextServiceDate(lastDate: string, intervalDays: number): string {
  const d = new Date(lastDate)
  d.setDate(d.getDate() + intervalDays)
  return d.toISOString().slice(0, 10)
}

export function formatMileage(mileage: number | null): string {
  if (mileage === null || mileage === undefined) return "-"
  return mileage.toLocaleString("th-TH") + " กม."
}
