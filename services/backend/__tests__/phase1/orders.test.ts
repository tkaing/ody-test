import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

async function setupCustomer() {
  return testApp
    .request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Client" }),
    })
    .then((r) => r.json()) as Promise<{ id: number }>;
}

async function setupCategoryAndItem(available = true) {
  const cat = await testApp
    .request("/menu-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Plats" }),
    })
    .then((r) => r.json()) as { id: number };

  const item = await testApp
    .request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1200, available }),
    })
    .then((r) => r.json()) as { id: number; price: number };

  return item;
}

describe("Phase 1 — orders", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("POST création valide (total correct)", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price * 2,
        items: [{ menuItemId: item.id, quantity: 2 }],
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe("pending");
    expect(data.total).toBe(item.price * 2);
  });

  it("rejet payload invalide", async () => {
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: 1000 }), // items manquants
    });
    expect(res.status).toBe(400);
  });

  it("rejet item indisponible", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(false), setupCustomer()]);
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price,
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/disponible/i);
  });

  it("rejet items en double (même menuItemId)", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price * 3,
        items: [
          { menuItemId: item.id, quantity: 1 },
          { menuItemId: item.id, quantity: 2 },
        ],
      }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/double/i);
  });

  it("vérification total server-side", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: 999, // total intentionnellement faux
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/total/i);
  });

  it("rejet création si resto fermé", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    await testApp.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: false }),
    });
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price,
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/fermé/i);
  });

  it("auto-accept → statut initial confirmed", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    await testApp.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoAccept: true }),
    });
    const res = await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price,
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe("confirmed");
  });

  it("GET liste des commandes", async () => {
    const res = await testApp.request("/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it("GET filtre par statut", async () => {
    const [item, customer] = await Promise.all([setupCategoryAndItem(), setupCustomer()]);
    await testApp.request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id, total: item.price, items: [{ menuItemId: item.id, quantity: 1 }] }),
    });
    const resPending = await testApp.request("/orders?status=pending");
    const pending = await resPending.json();
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((o: any) => o.status === "pending")).toBe(true);

    // A filter for a different status must return an empty list (not all orders)
    const resCompleted = await testApp.request("/orders?status=completed");
    const completed = await resCompleted.json();
    expect(completed).toHaveLength(0);
  });
});
