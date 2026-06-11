import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

async function createOrder() {
  const [cat, customer] = await Promise.all([
    testApp
      .request("/menu-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Plats" }),
      })
      .then((r) => r.json()) as Promise<{ id: number }>,
    testApp
      .request("/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Client" }),
      })
      .then((r) => r.json()) as Promise<{ id: number }>,
  ]);

  const item = await testApp
    .request("/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1200 }),
    })
    .then((r) => r.json()) as { id: number; price: number };

  return testApp
    .request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price,
        items: [{ menuItemId: item.id, quantity: 1 }],
      }),
    })
    .then((r) => r.json()) as Promise<{ id: number; status: string }>;
}

describe("Phase 1 — orders/:id/status", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("transition valide acceptée", async () => {
    const order = await createOrder();
    const res = await testApp.request(`/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("confirmed");
  });

  it("transition invalide rejetée", async () => {
    const order = await createOrder();
    const res = await testApp.request(`/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }), // pending → completed invalide
    });
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/transition invalide/i);
  });

  it("enchaînement complet de statuts valides", async () => {
    const order = await createOrder();
    const transitions = ["confirmed", "preparing", "ready", "completed"] as const;
    for (const status of transitions) {
      const res = await testApp.request(`/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      expect(res.status).toBe(200);
      expect((await res.json()).status).toBe(status);
    }
  });

  it("retourne 404 si commande inexistante", async () => {
    const res = await testApp.request("/orders/9999/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    expect(res.status).toBe(404);
  });
});
