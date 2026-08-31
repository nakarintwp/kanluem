import { describe, it, expect } from "vitest"

describe("calendar page", () => {
  it("calendar components exist", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("features/calendar/utils.ts"))).toBe(true)
    expect(fs.existsSync(path.resolve("app/(protected)/calendar/page.tsx"))).toBe(true)
    expect(fs.existsSync(path.resolve("features/calendar/components/MonthGrid.tsx"))).toBe(true)
  })

  it("dashboard links to calendar", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const bottom = fs.readFileSync(path.resolve("components/layout/BottomNav.tsx"), "utf-8")
    expect(bottom).toContain("/calendar")
  })
})
