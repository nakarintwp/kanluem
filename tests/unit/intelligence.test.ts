import { describe, it, expect } from "vitest"

describe("intelligence", () => {
  it("detects repeated events", async () => {
    const { detectRepeated } = await import("@/features/intelligence/utils")
    const reminders = [
      { title: "จ่ายค่าไฟ", due_at: "2026-08-01" },
      { title: "จ่ายค่าไฟ", due_at: "2026-09-01" },
      { title: "จ่ายค่าไฟ", due_at: "2026-10-01" },
    ]
    const repeated = detectRepeated(reminders as never[])
    expect(repeated.length).toBe(1)
    expect(repeated[0].title).toBe("จ่ายค่าไฟ")
  })

  it("detects upcoming expiry", async () => {
    const { upcomingExpiries } = await import("@/features/intelligence/utils")
    const far = new Date(Date.now() + 100 * 86400000).toISOString().slice(0, 10)
    const soon = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
    const docs = [
      { name: "ไกล", expiry_date: far },
      { name: "ใกล้", expiry_date: soon },
    ]
    const res = upcomingExpiries(docs as never[], 30)
    expect(res.length).toBe(1)
    expect(res[0].name).toBe("ใกล้")
  })
})
