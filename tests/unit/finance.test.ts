import { describe, it, expect } from "vitest"

describe("finance schemas", () => {
  it("validates finance item", async () => {
    const { financeItemSchema } = await import("@/features/finance/schemas")
    expect(financeItemSchema.safeParse({ title: "บัตรเครดิต", amount: 5000, due_date: "2026-09-15" }).success).toBe(true)
    expect(financeItemSchema.safeParse({ title: "", amount: 5000 }).success).toBe(false)
  })
})
