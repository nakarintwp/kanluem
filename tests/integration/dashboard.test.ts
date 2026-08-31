import { describe, it, expect } from "vitest"

describe("dashboard", () => {
  it("TodaySection exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("features/dashboard/components/TodaySection.tsx"))).toBe(true)
  })

  it("QuickActions exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("features/dashboard/components/QuickActions.tsx"))).toBe(true)
  })

  it("BottomNav exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("components/layout/BottomNav.tsx"))).toBe(true)
  })

  it("dashboard page imports TodaySection", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const c = fs.readFileSync(path.resolve("app/(protected)/dashboard/page.tsx"), "utf-8")
    expect(c).toContain("TodaySection")
    expect(c).toContain("QuickActions")
    expect(c).toContain("BottomNav")
  })
})
