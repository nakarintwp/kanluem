import { describe, it, expect } from "vitest"

describe("vehicle schemas", () => {
  it("validates vehicle", async () => {
    const { vehicleSchema } = await import("@/features/vehicles/schemas")
    expect(vehicleSchema.safeParse({ brand: "Toyota", model: "Civic", registration: "กข1234", year: 2020 }).success).toBe(true)
    expect(vehicleSchema.safeParse({ brand: "", model: "Civic", registration: "กข1234" }).success).toBe(false)
  })

  it("computes next service", async () => {
    const { nextServiceDate } = await import("@/features/vehicles/utils")
    const d = nextServiceDate("2026-01-01", 90)
    expect(d).toBe("2026-04-01")
  })
})
