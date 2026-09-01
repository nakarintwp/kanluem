import { describe, it, expect } from "vitest"

describe("document expiry", () => {
  it("computes expiry offsets", async () => {
    const { expiryOffsets } = await import("@/features/documents/expiry")
    expect(expiryOffsets("2026-12-15")).toEqual([
      { daysBefore: 60, date: "2026-10-16" },
      { daysBefore: 30, date: "2026-11-15" },
      { daysBefore: 7, date: "2026-12-08" },
      { daysBefore: 1, date: "2026-12-14" },
    ])
  })

  it("isExpiringSoon detects", async () => {
    const { isExpiringSoon } = await import("@/features/documents/expiry")
    const today = new Date().toISOString().slice(0, 10)
    const soon = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
    const far = new Date(Date.now() + 100 * 86400000).toISOString().slice(0, 10)
    expect(isExpiringSoon(soon, 7)).toBe(true)
    expect(isExpiringSoon(far, 7)).toBe(false)
    expect(isExpiringSoon(today, 0)).toBe(true)
  })
})
