import { describe, it, expect } from "vitest"

describe("invite", () => {
  it("generateCode creates KAN-XXXX format", async () => {
    const { generateCode } = await import("@/features/family/invite")
    const code = generateCode()
    expect(code).toMatch(/^KAN-[A-Z0-9]{4}$/)
    // QR payload is code only, not PII
    expect(code).not.toContain("@")
  })

  it("getExpiry handles all options", async () => {
    const { getExpiry } = await import("@/features/family/invite")
    expect(getExpiry("1h")).toBeInstanceOf(Date)
    expect(getExpiry("1d")).toBeInstanceOf(Date)
    expect(getExpiry("7d")).toBeInstanceOf(Date)
    expect(getExpiry("never")).toBeNull()
  })

  it("migration exists and checks max_uses + status", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00003_invitations.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("max_uses")
    expect(c).toContain("used_count")
    expect(c).toContain("status")
    expect(c).toContain("revoked")
  })

  it("validates invite expiry logic", async () => {
    const { isInviteValid } = await import("@/features/family/invite")
    const future = new Date(Date.now() + 86400000).toISOString()
    const past = new Date(Date.now() - 1000).toISOString()
    expect(isInviteValid({ status: "active", expires_at: future, max_uses: 5, used_count: 1 })).toBe(true)
    expect(isInviteValid({ status: "active", expires_at: past, max_uses: 5, used_count: 1 })).toBe(false)
    expect(isInviteValid({ status: "revoked", expires_at: future, max_uses: 5, used_count: 1 })).toBe(false)
    expect(isInviteValid({ status: "active", expires_at: future, max_uses: 1, used_count: 1 })).toBe(false)
  })

  it("invite page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/family/invite/page.tsx"))).toBe(true)
  })
})
