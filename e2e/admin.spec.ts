import { expect, test } from "@playwright/test";

test.use({ baseURL: "http://localhost:5174" });

test("should show login page and allow login", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();

  await page.getByPlaceholder(/username/i).fill("admin");
  await page.getByPlaceholder(/password/i).fill("admin");

  await page.getByRole("button", { name: /login/i }).click();

  await expect(page).toHaveURL(/change-password|dashboard|users/);
});
