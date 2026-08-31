import { describe, it, expect } from "vitest"

describe("vehicle integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00006_vehicles.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("vehicles")
    expect(c).toContain("family_members")
  })

  it("vehicles page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/vehicles/page.tsx"))).toBe(true)
  })
})
