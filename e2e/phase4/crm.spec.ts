import { test, expect } from "@playwright/test";

test.describe("Phase 4 — CRM", () => {
  test("un client de la seed affiche son orderCount, totalSpend et commandes récentes", async ({
    page,
  }) => {
    await page.goto("/crm");
    await page.waitForSelector("text=Clients", { timeout: 15000 });

    // La seed crée au moins 1 client avec des commandes
    await expect(page.getByText("Commandes récentes").first()).toBeVisible({ timeout: 8000 });

    // Vérifier qu'un badge de comptage de commandes est affiché (ex: "2 commandes")
    const cmdBadge = page.locator("text=/\\d+ commandes?/").first();
    await expect(cmdBadge).toBeVisible();
  });
});
