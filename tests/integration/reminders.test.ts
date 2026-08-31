import { describe, it, expect } from "vitest"

describe("reminders RLS", () => {
  it("migration exists and has RLS", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00004_reminders.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("family_members")
    expect(c).toContain("auth.uid()")
    expect(c).toContain("reminders")
  })

  it("reminder page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/reminders/page.tsx"))).toBe(true)
  })
})
