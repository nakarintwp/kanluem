export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `KAN-${s}`
}

export function getExpiry(exp: string): Date | null {
  const now = new Date()
  if (exp === "1h") return new Date(now.getTime() + 3600 * 1000)
  if (exp === "1d") return new Date(now.getTime() + 86400 * 1000)
  if (exp === "7d") return new Date(now.getTime() + 7 * 86400 * 1000)
  return null // never
}

export function isInviteValid(invite: {
  status: string
  expires_at: string | null
  max_uses: number | null
  used_count: number
}): boolean {
  if (invite.status !== "active") return false
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return false
  if (invite.max_uses !== null && invite.used_count >= invite.max_uses) return false
  return true
}
