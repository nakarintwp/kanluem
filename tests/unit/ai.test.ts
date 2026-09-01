import { describe, it, expect } from "vitest"

describe("ai provider", () => {
  it("parses thai smart reminder", async () => {
    const { parseSmartReminder } = await import("@/features/ai/parser")
    const r = parseSmartReminder("พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง")
    expect(r.category).toBe("vehicle")
    expect(r.vehicle).toBe("Civic")
    expect(r.time).toBe("08:00")
    expect(r.task).toContain("เปลี่ยนน้ำมันเครื่อง")
  })

  it("provider abstraction exists", async () => {
    const { AIProvider } = await import("@/features/ai/provider")
    const provider = new AIProvider("mock")
    const res = await provider.parse("test")
    expect(res.raw).toBe("test")
  })
})
