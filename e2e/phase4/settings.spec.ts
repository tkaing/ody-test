import { test, expect } from "@playwright/test";

test.describe("Phase 4 — Settings", () => {
  test("modifier un champ · sauvegarder · recharger → valeur persistée", async ({
    page,
  }) => {
    await page.goto("/settings");
    // Attendre que le formulaire soit chargé (pas la sidebar)
    const nameInput = page.getByPlaceholder("Mon Restaurant");
    await nameInput.waitFor({ timeout: 15000 });

    await nameInput.clear();
    const newName = `Restaurant Test ${Date.now()}`;
    await nameInput.fill(newName);

    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Paramètres enregistrés")).toBeVisible({
      timeout: 5000,
    });

    await page.reload();
    // Attendre que le formulaire soit rechargé depuis l'API
    await page.getByPlaceholder("Mon Restaurant").waitFor({ timeout: 15000 });
    await expect(page.getByPlaceholder("Mon Restaurant")).toHaveValue(newName);
  });
});
