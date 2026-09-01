import { describe, it, expect } from "vitest"

describe("notification providers", () => {
  it("abstraction dispatches to correct provider", async () => {
    const { NotificationProvider } = await import("@/features/notifications/providers")
    const p = new NotificationProvider()
    const r1 = await p.send("line", { userId: "u1", title: "Test", body: "Body" })
    expect(r1.channel).toBe("line")
    expect(r1.status).toBe("sent")
    const r2 = await p.send("telegram", { userId: "u1", title: "Test", body: "Body" })
    expect(r2.channel).toBe("telegram")
  })

  it("stores delivery log", async () => {
    const { DeliveryLog } = await import("@/features/notifications/providers")
    const log = new DeliveryLog()
    log.add({ channel: "line", status: "sent", title: "A" })
    log.add({ channel: "web_push", status: "sent", title: "B" })
    expect(log.count()).toBe(2)
    expect(log.byChannel("line").length).toBe(1)
  })
})
