import { expect, test } from "@playwright/test";

test("home page exposes main CTA and pricing link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "CreateYourQR",
  );
  await expect(page.getByRole("link", { name: "Create free QR" })).toBeVisible();
  await page.getByRole("link", { name: "View pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
});
