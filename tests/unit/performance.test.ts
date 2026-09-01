import { describe, it, expect } from "vitest"

describe("performance", () => {
  it("query cost estimator", async () => {
    const { estimateQueryCost } = await import("@/features/performance/cost")
    expect(estimateQueryCost({ table: "reminders", rows: 100 })).toBe(100)
    expect(estimateQueryCost({ table: "reminders", rows: 1000 })).toBe(1000)
  })

  it("AI cost control", async () => {
    const { AICostLimiter } = await import("@/features/performance/cost")
    const limiter = new AICostLimiter(100)
    expect(limiter.canAfford(50)).toBe(true)
    limiter.spend(60)
    expect(limiter.canAfford(50)).toBe(false)
    expect(limiter.remaining()).toBe(40)
  })
})
