import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

async function seedOrderWithStatus(status: string) {
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

  const order = await testApp
    .request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id, total: item.price, items: [{ menuItemId: item.id, quantity: 1 }] }),
    })
    .then((r) => r.json()) as { id: number };

  const transitions: Record<string, string[]> = {
    completed: ["confirmed", "preparing", "ready", "completed"],
    confirmed: ["confirmed"],
    pending: [],
  };

  for (const s of transitions[status] ?? []) {
    await testApp.request(`/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
  }

  return { orderId: order.id, itemPrice: item.price };
}

describe("Phase 1 — home/summary", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET KPIs", async () => {
    const res = await testApp.request("/home/summary");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("totalOrders");
    expect(data).toHaveProperty("revenue");
    expect(data).toHaveProperty("pendingCount");
    expect(data).toHaveProperty("popularItems");
    expect(Array.isArray(data.popularItems)).toBe(true);
  });

  it("totalOrders compte toutes les commandes", async () => {
    await seedOrderWithStatus("pending");
    await seedOrderWithStatus("pending");
    const data = await testApp.request("/home/summary").then((r) => r.json());
    expect(data.totalOrders).toBe(2);
  });

  it("revenue ne compte que les commandes completed", async () => {
    const { itemPrice } = await seedOrderWithStatus("completed");
    await seedOrderWithStatus("confirmed");
    const data = await testApp.request("/home/summary").then((r) => r.json());
    expect(data.revenue).toBe(itemPrice);
  });

  it("pendingCount ne compte que les commandes pending", async () => {
    await seedOrderWithStatus("pending");
    await seedOrderWithStatus("completed");
    const data = await testApp.request("/home/summary").then((r) => r.json());
    expect(data.pendingCount).toBe(1);
  });
});
