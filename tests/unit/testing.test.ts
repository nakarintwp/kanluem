import { describe, it, expect } from "vitest"

describe("testing suite", () => {
  it("coverage report exists", async () => {
    const fs = await import("fs")
    const path = await import("path")
    expect(fs.existsSync(path.resolve("docs/testing/coverage.md"))).toBe(true)
  })

  it("e2e checklist exists", async () => {
    const { e2eChecklist } = await import("@/features/testing/checklist")
    expect(e2eChecklist.length).toBeGreaterThan(5)
    expect(e2eChecklist).toContain("login")
  })
})
