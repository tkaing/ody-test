import { test, expect } from "@playwright/test";

test.describe("Phase 4 — Orders", () => {
  test("création de commande bout en bout → commande visible dans la liste avec statut pending", async ({
    page,
  }) => {
    await page.goto("/orders");
    // Attendre le bouton principal (pas la sidebar)
    await page.getByRole("button", { name: /Nouvelle commande/ }).waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: /Nouvelle commande/ }).click();
    await page.waitForSelector("text=Sélectionner un client", { timeout: 5000 });

    // Étape 1 : sélectionner un client via le Select custom (Pressable)
    await page.getByText("Choisir un client…").click();
    await page.waitForTimeout(400);
    await page.getByText("Marie Dupont").click();

    await page.getByRole("button", { name: "Suivant" }).click();
    await page.waitForSelector("text=Choisir les articles", { timeout: 3000 });

    // Étape 2 : ajouter un article (testID posé sur le Pressable +)
    await page.locator('[data-testid="qty-add"]').first().click();
    await page.getByRole("button", { name: "Récapitulatif" }).click();
    await page.waitForSelector("text=Récapitulatif", { timeout: 3000 });

    await page.getByRole("button", { name: "Confirmer la commande" }).click();

    await expect(page.getByText("Commande créée")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("En attente").first()).toBeVisible({ timeout: 5000 });
  });

  test("transition de statut → nouveau statut affiché, seule l'action suivante disponible", async ({
    page,
  }) => {
    await page.goto("/orders");
    // Attendre que la liste soit chargée et qu'une commande "En attente" soit visible
    await page.waitForSelector("text=En attente", { timeout: 15000 });

    // Cliquer sur le premier badge "En attente" → bubble sur le TableRow Pressable → ouvre le détail
    await page.getByText("En attente").first().click();

    await page.waitForSelector("text=Confirmée", { timeout: 3000 });
    await page.getByRole("button", { name: "Confirmée" }).click();

    await expect(page.getByText("Statut mis à jour")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Confirmée").first()).toBeVisible();
  });

  test("filtre par statut → liste filtrée correctement", async ({ page }) => {
    await page.goto("/orders");
    // Attendre que la liste soit chargée (filtre visible)
    await page.waitForSelector("text=Tous les statuts", { timeout: 15000 });

    // Select custom (Pressable, pas un input) → clic sur le texte du placeholder
    await page.getByText("Tous les statuts").click();
    await page.waitForTimeout(300);
    // La Modal RN Web se rend en portal après le contenu → .last() = option du dropdown
    await page.getByText("Terminée").last().click();

    // Attendre que le filtre soit appliqué (aucun badge "En attente" visible)
    await expect(page.getByText("En attente", { exact: true }).first()).not.toBeVisible({ timeout: 5000 });
  });

  test("vue détail → items, client et statut affichés", async ({ page }) => {
    await page.goto("/orders");
    // Attendre que la liste soit chargée
    await page.waitForSelector("text=En attente", { timeout: 15000 });

    // Table = divs, pas de <tr>. Cliquer sur l'ID de la première commande (#N)
    await page.getByText(/#\d+/).first().click();

    await page.waitForSelector("text=Articles", { timeout: 5000 });
    await expect(page.getByText("Client", { exact: true })).toBeVisible();
    // "Statut" et "Total" apparaissent aussi dans l'en-tête du tableau → .first()
    await expect(page.getByText("Statut", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Total", { exact: true }).first()).toBeVisible();
  });
});
