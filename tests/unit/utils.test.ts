import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn merges tailwind", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
  it("handles conditional", () => {
    expect(cn("a", false && "b", "c")).toBe("a c")
  })
})
