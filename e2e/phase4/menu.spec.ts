import { test, expect } from "@playwright/test";

test.describe("Phase 4 — Menu", () => {
  test("créer une catégorie → apparaît dans la liste", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    const catName = `Catégorie Test ${Date.now()}`;
    await page.getByRole("button", { name: "Nouvelle catégorie" }).click();
    await page.getByPlaceholder("ex : Entrées, Plats, Desserts…").fill(catName);
    await page.getByRole("button", { name: "Créer" }).click();

    await expect(page.getByText(catName)).toBeVisible({ timeout: 5000 });
  });

  test("créer un article → apparaît dans la catégorie", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    const itemName = `Article Test ${Date.now()}`;
    await page.getByRole("button", { name: "Ajouter un article" }).first().click();
    await page.getByPlaceholder("ex : Salade César").fill(itemName);
    await page.getByPlaceholder("9.90").fill("12.50");
    await page.getByRole("button", { name: "Créer" }).click();

    await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });
  });

  test("éditer un article → modifications persistées", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    // Cliquer sur le premier bouton "edit" d'un article (testID posé sur Button)
    await page.locator('[data-testid="edit-item"]').first().click();

    const updatedName = `Article Modifié ${Date.now()}`;
    const nameInput = page.getByPlaceholder("ex : Salade César");
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 });
  });

  test("toggle disponibilité → état mis à jour", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    // RN Web rend role="switch" mais pas aria-checked — vérifier via le toast de mutation
    const firstToggle = page.getByRole("switch").first();
    await firstToggle.waitFor({ timeout: 5000 });
    await firstToggle.click();

    await expect(page.getByText("Article mis à jour")).toBeVisible({ timeout: 5000 });
  });
});
