import { describe, it, expect } from "vitest"

describe("medication integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00007_medications.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("medications")
    expect(c).toContain("family_members")
  })

  it("medication page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/medication/page.tsx"))).toBe(true)
  })
})
