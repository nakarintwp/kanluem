import { test, expect } from "@playwright/test"

test("dashboard shows today/upcoming/overdue and quick actions", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page.getByText(/วันนี้/)).toBeVisible()
  await expect(page.getByText(/เกินกำหนด/)).toBeVisible()
  await expect(page.getByText(/Quick Actions/)).toBeVisible()
  await expect(page.getByText("➕")).toBeVisible()
})

test("dashboard bottom nav has 6 tabs", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page.getByText("Today")).toBeVisible()
  await expect(page.getByText("Calendar")).toBeVisible()
  await expect(page.getByText("Reminders")).toBeVisible()
})
