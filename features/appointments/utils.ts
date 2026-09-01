export function toDateTime(date: string, time?: string | null): string {
  if (!time) return `${date}T00:00:00+07:00`
  return `${date}T${time}:00+07:00`
}
