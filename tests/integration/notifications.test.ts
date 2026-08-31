import { describe, it, expect } from "vitest"

describe("notifications integration", () => {
  it("migration exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const p = path.resolve("supabase/migrations/00005_notifications.sql")
    expect(fs.existsSync(p)).toBe(true)
    const c = fs.readFileSync(p, "utf-8")
    expect(c).toContain("notifications")
    expect(c).toContain("notification_preferences")
  })

  it("notification center page exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("app/(protected)/notifications/page.tsx"))).toBe(true)
  })

  it("utils exist", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("features/notifications/utils.ts"))).toBe(true)
  })
})
