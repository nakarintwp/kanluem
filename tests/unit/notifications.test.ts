import { describe, it, expect } from "vitest"

describe("notifications", () => {
  it("getNotificationStatus works", async () => {
    const { getNotificationStatus } = await import("@/features/notifications/utils")
    expect(getNotificationStatus({ sent_at: null, read_at: null } as never)).toBe("scheduled")
    expect(getNotificationStatus({ sent_at: "2026-09-01T08:00:00Z", read_at: null } as never)).toBe("sent")
    expect(getNotificationStatus({ sent_at: "2026-09-01T08:00:00Z", read_at: "2026-09-01T08:05:00Z" } as never)).toBe("read")
  })

  it("groupByStatus groups", async () => {
    const { groupByStatus } = await import("@/features/notifications/utils")
    const list = [
      { status: "sent" },
      { status: "read" },
      { status: "sent" },
    ] as never[]
    const grouped = groupByStatus(list)
    expect(grouped.sent.length).toBe(2)
    expect(grouped.read.length).toBe(1)
  })
})
