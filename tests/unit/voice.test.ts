import { describe, it, expect } from "vitest"

describe("voice utils", () => {
  it("parses thai intent stub", async () => {
    const { parseVoiceInput } = await import("@/features/voice/utils")
    const r = parseVoiceInput("พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง")
    expect(r.category).toBe("vehicle")
    expect(r.time).toBe("08:00")
  })

  it("handles empty", async () => {
    const { parseVoiceInput } = await import("@/features/voice/utils")
    const r = parseVoiceInput("")
    expect(r.category).toBe("other")
  })
})
