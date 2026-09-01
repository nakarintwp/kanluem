import { describe, it, expect } from "vitest"

describe("finance integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00010_finance.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("finance_items")
  })

  it("finance page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/finance/page.tsx"))).toBe(true)
  })
})
