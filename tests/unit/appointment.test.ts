import { describe, it, expect } from "vitest"

describe("appointment schemas", () => {
  it("validates appointment", async () => {
    const { appointmentSchema } = await import("@/features/appointments/schemas")
    expect(appointmentSchema.safeParse({ title: "หมอนัด", date: "2026-09-10", time: "09:30", location: "รพ.รามา" }).success).toBe(true)
    expect(appointmentSchema.safeParse({ title: "", date: "2026-09-10" }).success).toBe(false)
  })

  it("formats appointment datetime", async () => {
    const { toDateTime } = await import("@/features/appointments/utils")
    expect(toDateTime("2026-09-10", "09:30")).toBe("2026-09-10T09:30:00+07:00")
  })
})
