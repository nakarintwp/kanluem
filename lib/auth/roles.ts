export type Role = "owner" | "admin" | "member" | "viewer"

export function hasRole(memberRole: string, allowed: string[]): boolean {
  return allowed.includes(memberRole)
}

export function isOwnerOrAdmin(role: string): boolean {
  return hasRole(role, ["owner", "admin"])
}
