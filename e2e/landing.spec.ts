import { expect, test } from "@playwright/test";

test("landing page explains the product and pricing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Good work starts with clear scope/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "#pricing");
  await expect(page.getByText("No paid plan or payment integration is currently offered.")).toBeVisible();
  await page.getByRole("link", { name: "Make your first brief" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("sign-in page exposes labeled fields and account creation", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Good to see you." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/signup");
});

test("mobile landing page stays within the viewport and keeps the signup path available", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Make your first brief" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  await page.getByRole("link", { name: "Make your first brief" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("signup form exposes required labeled controls and inline password guidance", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your space." })).toBeVisible();
  for (const label of ["Your name", "Email address", "Password"]) {
    await expect(page.getByLabel(label)).toHaveAttribute("required", "");
  }
  await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
});
