import { describe, it, expect } from "vitest"

describe("reminderSchema", () => {
  it("rejects empty title", async () => {
    const { reminderSchema } = await import("@/features/reminders/schemas")
    const r = reminderSchema.safeParse({ title: "", due_at: new Date().toISOString() })
    expect(r.success).toBe(false)
  })

  it("accepts valid", async () => {
    const { reminderSchema } = await import("@/features/reminders/schemas")
    const r = reminderSchema.safeParse({
      title: "ต่อภาษี",
      due_at: new Date(Date.now() + 86400000).toISOString(),
      category: "vehicle",
      priority: "high",
    })
    expect(r.success).toBe(true)
  })

  it("rejects invalid due_at", async () => {
    const { reminderSchema } = await import("@/features/reminders/schemas")
    const r = reminderSchema.safeParse({ title: "test", due_at: "invalid" })
    expect(r.success).toBe(false)
  })
})
