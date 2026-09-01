import { describe, it, expect } from "vitest"

describe("offline", () => {
  it("cache set/get", async () => {
    const { OfflineCache } = await import("@/features/offline/cache")
    const cache = new OfflineCache()
    cache.set("reminders", [{ id: "1" }])
    expect(cache.get("reminders")).toEqual([{ id: "1" }])
    expect(cache.has("reminders")).toBe(true)
  })

  it("queue enqueue and retry", async () => {
    const { MutationQueue } = await import("@/features/offline/queue")
    const q = new MutationQueue()
    q.enqueue({ type: "create", table: "reminders", payload: { title: "A" } })
    q.enqueue({ type: "update", table: "reminders", payload: { id: "1", title: "B" } })
    expect(q.count()).toBe(2)
    const first = q.dequeue()
    expect(first?.type).toBe("create")
    expect(q.count()).toBe(1)
  })
})
