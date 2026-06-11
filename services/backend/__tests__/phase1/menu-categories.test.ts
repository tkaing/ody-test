import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

describe("Phase 1 — menu_categories", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET liste", async () => {
    const res = await testApp.request("/menu-categories");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST création", async () => {
    const res = await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Entrées" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Entrées");
    expect(data.id).toBeTypeOf("number");
  });

  it("GET liste retourne les catégories créées", async () => {
    await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Plats" }),
    });
    const res = await testApp.request("/menu-categories");
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe("Plats");
  });

  it("PATCH met à jour le nom", async () => {
    const created = await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Boissons" }),
    });
    const { id } = await created.json();
    const res = await testApp.request(`/menu-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Boissons chaudes" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Boissons chaudes");
  });

  it("DELETE supprime une catégorie existante", async () => {
    const created = await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Desserts" }),
    });
    const { id } = await created.json();
    const res = await testApp.request(`/menu-categories/${id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
  });

  it("DELETE retourne 404 si inexistant", async () => {
    const res = await testApp.request("/menu-categories/9999", { method: "DELETE" });
    expect(res.status).toBe(404);
  });

  it("DELETE bloque si la catégorie contient des items actifs", async () => {
    const cat = await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Plats" }),
    }).then((r) => r.json()) as { id: number };
    await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1200, available: true }),
    });
    const res = await testApp.request(`/menu-categories/${cat.id}`, { method: "DELETE" });
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/actif/i);
  });

  it("DELETE réussit si tous les items de la catégorie sont désactivés", async () => {
    const cat = await testApp.request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Plats" }),
    }).then((r) => r.json()) as { id: number };
    const item = await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1200, available: true }),
    }).then((r) => r.json()) as { id: number };
    await testApp.request(`/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: false }),
    });
    const res = await testApp.request(`/menu-categories/${cat.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
  });
});
