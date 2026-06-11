import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

describe("Phase 1 — settings", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET retourne les paramètres par défaut", async () => {
    const res = await testApp.request("/settings");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({
      id: 1,
      prepTime: 15,
      autoAccept: false,
    });
  });

  it("PATCH met à jour les paramètres", async () => {
    await testApp.request("/settings");
    const res = await testApp.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prepTime: 30, autoAccept: true }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.prepTime).toBe(30);
    expect(data.autoAccept).toBe(true);
  });

  it("PATCH persiste les changements", async () => {
    await testApp.request("/settings");
    await testApp.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantName: "Le Gourmet" }),
    });
    const res = await testApp.request("/settings");
    const data = await res.json();
    expect(data.restaurantName).toBe("Le Gourmet");
  });
});
