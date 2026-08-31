import { test, expect } from "@playwright/test"

test("login page has Google button", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("button", { name: /Google/ })).toBeVisible()
})

test("dashboard redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login/)
})
