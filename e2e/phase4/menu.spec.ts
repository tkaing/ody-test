import { test, expect } from "@playwright/test";

const API = "http://localhost:8787";

test.describe("Phase 4 — Menu", () => {
  test("créer une catégorie → apparaît dans la liste", async ({ page, request }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    const catName = `Catégorie Test ${Date.now()}`;
    await page.getByRole("button", { name: "Nouvelle catégorie" }).click();
    await page.getByPlaceholder("ex : Entrées, Plats, Desserts…").fill(catName);
    await page.getByRole("button", { name: "Créer" }).click();

    await expect(page.getByText(catName)).toBeVisible({ timeout: 5000 });

    // cleanup
    const cats = await request.get(`${API}/menu-categories`).then((r) => r.json()) as { id: number; name: string }[];
    const cat = cats.find((c) => c.name === catName);
    if (cat) await request.delete(`${API}/menu-categories/${cat.id}`);
  });

  test("créer un article → apparaît dans la catégorie", async ({ page, request }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    const itemName = `Article Test ${Date.now()}`;
    await page.getByRole("button", { name: "Ajouter un article" }).first().click();
    await page.getByPlaceholder("ex : Salade César").fill(itemName);
    await page.getByPlaceholder("9.90").fill("12.50");
    await page.getByRole("button", { name: "Créer" }).click();

    await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });

    // cleanup
    const items = await request.get(`${API}/menu-items`).then((r) => r.json()) as { id: number; name: string }[];
    const item = items.find((i) => i.name === itemName);
    if (item) await request.delete(`${API}/menu-items/${item.id}`);
  });

  test("éditer un article → modifications persistées", async ({ page, request }) => {
    await page.goto("/menu");
    await page.waitForSelector("text=Ajouter un article", { timeout: 15000 });

    // Récupérer le nom d'origine avant édition pour pouvoir le restaurer
    const items = await request.get(`${API}/menu-items`).then((r) => r.json()) as { id: number; name: string }[];
    const originalItem = items[0];

    await page.locator('[data-testid="edit-item"]').first().click();

    const updatedName = `Article Modifié ${Date.now()}`;
    const nameInput = page.getByPlaceholder("ex : Salade César");
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 });

    // cleanup — restaurer le nom d'origine
    if (originalItem) {
      await request.patch(`${API}/menu-items/${originalItem.id}`, {
        data: { name: originalItem.name },
        headers: { "Content-Type": "application/json" },
      });
    }
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
