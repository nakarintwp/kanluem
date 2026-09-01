import { describe, it, expect } from "vitest"

describe("document integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00011_documents.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("documents")
    expect(c).toContain("private")
  })

  it("documents page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/documents/page.tsx"))).toBe(true)
  })
})
