import { describe, it, expect } from "vitest"

describe("home schemas", () => {
  it("validates home item", async () => {
    const { homeItemSchema } = await import("@/features/home/schemas")
    expect(homeItemSchema.safeParse({ title: "ค่าไฟ", category: "utility" }).success).toBe(true)
    expect(homeItemSchema.safeParse({ title: "" }).success).toBe(false)
  })
})
