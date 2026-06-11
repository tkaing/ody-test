import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

async function createCategory(name = "Plats") {
  const res = await testApp.request("/menu-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return (await res.json()) as { id: number };
}

describe("Phase 1 — menu_items", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET liste", async () => {
    const res = await testApp.request("/menu-items");
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it("POST création", async () => {
    const cat = await createCategory();
    const res = await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Steak frites", price: 1800 }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Steak frites");
    expect(data.price).toBe(1800);
    expect(data.available).toBe(true);
  });

  it("PATCH disponibilité", async () => {
    const cat = await createCategory();
    const item = await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Salade", price: 900 }),
    });
    const { id } = await item.json();
    const res = await testApp.request(`/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: false }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).available).toBe(false);
  });

  it("GET filtre par categoryId", async () => {
    const cat1 = await createCategory("Entrées");
    const cat2 = await createCategory("Desserts");
    await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat1.id, name: "Soupe", price: 700 }),
    });
    await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat2.id, name: "Tarte", price: 600 }),
    });
    const res = await testApp.request(`/menu-items?categoryId=${cat1.id}`);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe("Soupe");
  });

  it("GET filtre par available", async () => {
    const cat = await createCategory();
    await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1400, available: true }),
    });
    await testApp.request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Pizza", price: 1200, available: false }),
    });
    const res = await testApp.request("/menu-items?available=false");
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe("Pizza");
  });
});
