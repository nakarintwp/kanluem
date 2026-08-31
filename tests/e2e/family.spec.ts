import { test, expect } from "@playwright/test"

test("onboarding shows create/join when no family", async ({ page }) => {
  await page.goto("/onboarding")
  await expect(page.getByText(/สร้างครอบครัว/)).toBeVisible()
  await expect(page.getByText(/เข้าร่วมครอบครัว/)).toBeVisible()
})

test("family page requires auth", async ({ page }) => {
  await page.goto("/family")
  await expect(page).toHaveURL(/\/login|\/onboarding|\/family/)
})
