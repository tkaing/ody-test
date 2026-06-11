import { test, expect } from "@playwright/test";

const API = "http://localhost:8787";
const DEFAULT_RESTAURANT_NAME = "Mon Restaurant";

test.describe("Phase 4 — Settings", () => {
  test("modifier un champ · sauvegarder · recharger → valeur persistée", async ({
    page,
    request,
  }) => {
    await page.goto("/settings");
    const nameInput = page.getByPlaceholder("Mon Restaurant");
    await nameInput.waitFor({ timeout: 15000 });

    // Sauvegarder le nom actuel pour le restaurer après le test
    const originalName = await nameInput.inputValue();

    await nameInput.clear();
    const newName = `Restaurant Test ${Date.now()}`;
    await nameInput.fill(newName);

    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Paramètres enregistrés")).toBeVisible({
      timeout: 5000,
    });

    await page.reload();
    await page.getByPlaceholder("Mon Restaurant").waitFor({ timeout: 15000 });
    await expect(page.getByPlaceholder("Mon Restaurant")).toHaveValue(newName);

    // cleanup — restaurer le nom d'origine
    await request.patch(`${API}/settings`, {
      data: { restaurantName: originalName || DEFAULT_RESTAURANT_NAME },
      headers: { "Content-Type": "application/json" },
    });
  });
});
