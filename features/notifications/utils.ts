export type NotificationStatus = "scheduled" | "sent" | "delivered" | "read" | "failed" | "snoozed" | "dismissed"

export function getNotificationStatus(n: { sent_at: string | null; read_at: string | null; status?: string }): NotificationStatus {
  if (n.status) return n.status as NotificationStatus
  if (n.read_at) return "read"
  if (n.sent_at) return "sent"
  return "scheduled"
}

export function groupByStatus(list: { status: string }[]): Record<string, typeof list> {
  const grouped: Record<string, typeof list> = {}
  for (const item of list) {
    if (!grouped[item.status]) grouped[item.status] = []
    grouped[item.status].push(item)
  }
  return grouped
}
