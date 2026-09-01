import { describe, it, expect } from "vitest"

describe("appointment integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00008_appointments.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("appointments")
    expect(c).toContain("family_members")
  })

  it("appointments page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/appointments/page.tsx"))).toBe(true)
  })
})
