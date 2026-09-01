import { describe, it, expect } from "vitest"

describe("home integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00009_home.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("home_items")
  })

  it("home page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/home/page.tsx"))).toBe(true)
  })
})
