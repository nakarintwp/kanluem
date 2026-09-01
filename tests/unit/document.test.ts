import { describe, it, expect } from "vitest"

describe("document schemas", () => {
  it("validates document", async () => {
    const { documentSchema } = await import("@/features/documents/schemas")
    expect(documentSchema.safeParse({ name: "สำเนาทะเบียนรถ", category: "vehicle" }).success).toBe(true)
    expect(documentSchema.safeParse({ name: "" }).success).toBe(false)
  })
})
