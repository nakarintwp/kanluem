import { describe, it, expect } from "vitest"

describe("calendar utils", () => {
  it("getMonthMatrix generates correct grid", async () => {
    const { getMonthMatrix } = await import("@/features/calendar/utils")
    const matrix = getMonthMatrix(2026, 8) // Sep 2026 (0-indexed 8)
    expect(matrix.length).toBeGreaterThan(0)
    // Sep 2026 has 30 days, matrix should contain 30 + leading/trailing
    const flat = matrix.flat().filter(Boolean)
    expect(flat.length).toBe(30)
  })

  it("group reminders by date", async () => {
    const { groupByDate } = await import("@/features/calendar/utils")
    const reminders = [
      { id: "1", title: "A", due_at: "2026-09-01T08:00:00+07:00" },
      { id: "2", title: "B", due_at: "2026-09-01T10:00:00+07:00" },
      { id: "3", title: "C", due_at: "2026-09-02T08:00:00+07:00" },
    ]
    const grouped = groupByDate(reminders)
    expect(grouped["2026-09-01"].length).toBe(2)
    expect(grouped["2026-09-02"].length).toBe(1)
  })
})
