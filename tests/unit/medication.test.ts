import { describe, it, expect } from "vitest"

describe("medication schemas", () => {
  it("validates medication", async () => {
    const { medicationSchema } = await import("@/features/medication/schemas")
    expect(medicationSchema.safeParse({ name: "Lisinopril", dosage: "10mg", frequency: "daily" }).success).toBe(true)
    expect(medicationSchema.safeParse({ name: "", dosage: "10mg" }).success).toBe(false)
  })

  it("calculates refill date", async () => {
    const { refillDate } = await import("@/features/medication/utils")
    expect(refillDate("2026-09-01", 30)).toBe("2026-10-01")
  })
})
