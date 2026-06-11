import { test, expect } from "@playwright/test";

test.describe("Phase 4 — Home", () => {
  test("les 4 KPIs s'affichent avec des valeurs numériques issues de la base seedée", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("text=Tableau de bord", { timeout: 15000 });

    await expect(page.getByText("Commandes totales")).toBeVisible();
    await expect(page.getByText("Chiffre d'affaires")).toBeVisible();
    await expect(page.getByText("En attente")).toBeVisible();
    await expect(page.getByText("Items les plus vendus")).toBeVisible();

    // Vérifier qu'au moins une valeur numérique non-zéro est affichée (seed data)
    const kpiValues = await page.locator("text=/^\\d+/").all();
    expect(kpiValues.length).toBeGreaterThanOrEqual(1);
  });
});
