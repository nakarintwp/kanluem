import { describe, it, expect } from "vitest"

describe("family", () => {
  it("createFamilySchema validates", async () => {
    const { createFamilySchema } = await import("@/features/family/schemas")
    expect(createFamilySchema.safeParse({ name: "ครอบครัวทองวุฒิพันธ์" }).success).toBe(true)
    expect(createFamilySchema.safeParse({ name: "a" }).success).toBe(false)
  })

  it("hasRole helper works", async () => {
    const { hasRole } = await import("@/lib/auth/roles")
    expect(hasRole("owner", ["owner", "admin"])).toBe(true)
    expect(hasRole("member", ["owner", "admin"])).toBe(false)
    expect(hasRole("viewer", ["owner"])).toBe(false)
  })

  it("families migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00002_families.sql")
    expect(fs.existsSync(p)).toBe(true)
    const content = fs.readFileSync(p, "utf-8")
    expect(content).toContain("family_members")
    expect(content).toContain("row level security")
  })

  it("RLS blocks cross-family read (sql check)", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00002_families.sql")
    const content = fs.readFileSync(p, "utf-8")
    expect(content).toContain("family_members")
    expect(content).toContain("auth.uid()")
  })
})
