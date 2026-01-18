import { expect, test } from "@playwright/test";

test("should login with mock login", async ({ page }) => {
  await page.goto("/");

  const mockLoginButton = page.getByTestId("mock-login-button");
  await expect(mockLoginButton).toBeVisible();

  await mockLoginButton.click();

  const userMenu = page.getByRole("button", { name: /avatar|test user/i });
  await expect(userMenu).toBeVisible();
});

test("should show feed after login", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("mock-login-button").click();

  await page.getByRole("link", { name: /feed/i }).click();

  await expect(page).toHaveURL(/\/feed/);
});
