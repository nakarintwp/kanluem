import { describe, it, expect } from "vitest"

describe("ocr utils", () => {
  it("extracts date from text", async () => {
    const { extractDate } = await import("@/features/ocr/utils")
    expect(extractDate("หมดอายุ 15/12/2026")).toBe("2026-12-15")
    expect(extractDate("15-12-2026")).toBe("2026-12-15")
  })

  it("suggests reminder from expiry", async () => {
    const { suggestReminder } = await import("@/features/ocr/utils")
    const r = suggestReminder("2026-12-15", "กรมธรรม์รถ")
    expect(r.title).toContain("กรมธรรม์รถ")
    expect(r.offsets).toEqual([60, 30, 7, 1])
  })
})
