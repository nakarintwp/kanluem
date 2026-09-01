import { describe, it, expect } from "vitest"

describe("security", () => {
  it("validates input sanitization", async () => {
    const { sanitize } = await import("@/features/security/utils")
    expect(sanitize("<script>alert(1)</script>")).toBe("alert(1)")
    expect(sanitize("  hello  ")).toBe("hello")
  })

  it("rate limit check", async () => {
    const { RateLimiter } = await import("@/features/security/utils")
    const limiter = new RateLimiter(2, 60000)
    expect(limiter.allow("user1")).toBe(true)
    expect(limiter.allow("user1")).toBe(true)
    expect(limiter.allow("user1")).toBe(false)
    expect(limiter.allow("user2")).toBe(true)
  })
})
