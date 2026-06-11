import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

async function createOrderWithCustomer() {
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
      body: JSON.stringify({ categoryId: cat.id, name: "Burger", price: 1200 }),
    })
    .then((r) => r.json()) as { id: number; price: number };

  const customer = await testApp
    .request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@test.com" }),
    })
    .then((r) => r.json()) as { id: number };

  const order = await testApp
    .request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.id,
        total: item.price * 2,
        items: [{ menuItemId: item.id, quantity: 2 }],
      }),
    })
    .then((r) => r.json()) as { id: number };

  return { orderId: order.id, customerId: customer.id, itemId: item.id };
}

describe("Phase 1 — orders/:id", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET détail (items + client inclus)", async () => {
    const { orderId } = await createOrderWithCustomer();
    const res = await testApp.request(`/orders/${orderId}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(orderId);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBe(1);
    expect(data.items[0].menuItem).toBeDefined();
    expect(data.items[0].menuItem.name).toBe("Burger");
    expect(data.customer).toBeDefined();
    expect(data.customer.name).toBe("Alice");
  });

  it("GET retourne 404 si commande inexistante", async () => {
    const res = await testApp.request("/orders/9999");
    expect(res.status).toBe(404);
  });
});
