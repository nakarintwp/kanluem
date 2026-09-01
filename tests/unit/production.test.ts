import { describe, it, expect } from "vitest"

describe("production readiness", () => {
  it("checklist exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("docs/production/checklist.md"))).toBe(true)
    const c = fs.readFileSync(path.resolve("docs/production/checklist.md"), "utf-8")
    expect(c).toContain("Backup")
    expect(c).toContain("Monitoring")
  })

  it("env example has required vars", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const c = fs.readFileSync(path.resolve(".env.example"), "utf-8")
    expect(c).toContain("NEXT_PUBLIC_SUPABASE_URL")
    expect(c).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  })
})
