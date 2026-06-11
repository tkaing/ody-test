import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApp, truncateAll, closeDb } from "../helpers/db";

describe("Phase 1 — customers", () => {
  beforeEach(truncateAll);
  afterAll(closeDb);

  it("GET liste", async () => {
    const res = await testApp.request("/customers");
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it("POST création", async () => {
    const res = await testApp.request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice Dupont", email: "alice@example.com", phone: "0612345678" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Alice Dupont");
    expect(data.email).toBe("alice@example.com");
  });

  it("GET liste retourne les clients créés", async () => {
    await testApp.request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob Martin" }),
    });
    const res = await testApp.request("/customers");
    const data = await res.json();
    expect(data.length).toBe(1);
  });

  it("GET search par nom", async () => {
    await testApp.request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Charlie Doe", email: "charlie@example.com" }),
    });
    await testApp.request("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Diana Smith", email: "diana@example.com" }),
    });
    const res = await testApp.request("/customers?q=charlie");
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe("Charlie Doe");
  });
});
