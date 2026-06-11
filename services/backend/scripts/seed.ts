import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql as drizzleSql } from "drizzle-orm";
import { menuCategories, menuItems, customers, orders, orderItems } from "../src/db/schema";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://ody:ody_secret@localhost:5432/ody_db";
const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Nettoyage des tables...");
  await db.execute(drizzleSql`TRUNCATE menu_categories, menu_items, customers, orders, order_items CASCADE`);

  // --- Catégories ---
  console.log("📂 Insertion des catégories...");
  const [entrees, plats, desserts, boissons] = await db
    .insert(menuCategories)
    .values([
      { name: "Entrées" },
      { name: "Plats" },
      { name: "Desserts" },
      { name: "Boissons" },
    ])
    .returning();

  // --- Items de menu ---
  console.log("🍽️  Insertion des items de menu...");
  const insertedItems = await db
    .insert(menuItems)
    .values([
      // Entrées
      { categoryId: entrees!.id, name: "Soupe à l'oignon", price: 890, available: true },
      { categoryId: entrees!.id, name: "Salade César", price: 1090, available: true },
      { categoryId: entrees!.id, name: "Carpaccio de bœuf", price: 1290, available: true },
      // Plats
      { categoryId: plats!.id, name: "Steak-frites", price: 1890, available: true },
      { categoryId: plats!.id, name: "Confit de canard", price: 2190, available: true },
      { categoryId: plats!.id, name: "Saumon grillé", price: 2090, available: true },
      { categoryId: plats!.id, name: "Risotto champignons", price: 1690, available: true },
      { categoryId: plats!.id, name: "Burger maison", price: 1590, available: false },
      // Desserts
      { categoryId: desserts!.id, name: "Crème brûlée", price: 790, available: true },
      { categoryId: desserts!.id, name: "Tarte tatin", price: 890, available: true },
      { categoryId: desserts!.id, name: "Fondant chocolat", price: 890, available: true },
      { categoryId: desserts!.id, name: "Île flottante", price: 690, available: false },
      // Boissons
      { categoryId: boissons!.id, name: "Eau minérale", price: 290, available: true },
      { categoryId: boissons!.id, name: "Jus d'orange", price: 390, available: true },
      { categoryId: boissons!.id, name: "Café", price: 250, available: true },
      { categoryId: boissons!.id, name: "Vin rouge (verre)", price: 550, available: true },
      { categoryId: boissons!.id, name: "Bière pression", price: 480, available: true },
      { categoryId: boissons!.id, name: "Limonade", price: 350, available: true },
    ])
    .returning();

  const item = (name: string) => insertedItems.find((i) => i.name === name)!;

  // --- Clients ---
  console.log("👤 Insertion des clients...");
  const insertedCustomers = await db
    .insert(customers)
    .values([
      { name: "Marie Dupont", email: "marie.dupont@email.fr", phone: "06 12 34 56 78" },
      { name: "Jean Martin", email: "jean.martin@email.fr", phone: "06 23 45 67 89" },
      { name: "Sophie Bernard", email: "sophie.bernard@email.fr", phone: "07 34 56 78 90" },
      { name: "Thomas Petit", email: "thomas.petit@email.fr", phone: "06 45 67 89 01" },
      { name: "Isabelle Moreau", email: "isabelle.moreau@email.fr", phone: "07 56 78 90 12" },
      { name: "Nicolas Laurent", email: "nicolas.laurent@email.fr", phone: "06 67 89 01 23" },
      { name: "Camille Simon", email: "camille.simon@email.fr", phone: "07 78 90 12 34" },
      { name: "Pierre Lefebvre", email: "pierre.lefebvre@email.fr", phone: "06 89 01 23 45" },
      { name: "Lucie Roux", email: "lucie.roux@email.fr", phone: "07 90 12 34 56" },
      { name: "Antoine Girard", email: "antoine.girard@email.fr", phone: "06 01 23 45 67" },
    ])
    .returning();

  const customer = (name: string) => insertedCustomers.find((c) => c.name === name)!;

  // --- Commandes ---
  console.log("📦 Insertion des commandes...");

  type OrderLine = { menuItemId: number; quantity: number; unitPrice: number };

  const createOrder = async (
    status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled",
    customerId: number,
    lines: OrderLine[]
  ) => {
    const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const [order] = await db.insert(orders).values({ customerId, status, total }).returning();
    await db.insert(orderItems).values(
      lines.map((l) => ({ orderId: order!.id, menuItemId: l.menuItemId, quantity: l.quantity, unitPrice: l.unitPrice }))
    );
    return order!;
  };

  // pending ×4
  await createOrder("pending", customer("Marie Dupont").id, [
    { menuItemId: item("Steak-frites").id, quantity: 2, unitPrice: item("Steak-frites").price },
    { menuItemId: item("Eau minérale").id, quantity: 2, unitPrice: item("Eau minérale").price },
  ]);
  await createOrder("pending", customer("Jean Martin").id, [
    { menuItemId: item("Salade César").id, quantity: 1, unitPrice: item("Salade César").price },
    { menuItemId: item("Saumon grillé").id, quantity: 1, unitPrice: item("Saumon grillé").price },
    { menuItemId: item("Vin rouge (verre)").id, quantity: 1, unitPrice: item("Vin rouge (verre)").price },
  ]);
  await createOrder("pending", customer("Lucie Roux").id, [
    { menuItemId: item("Soupe à l'oignon").id, quantity: 2, unitPrice: item("Soupe à l'oignon").price },
    { menuItemId: item("Confit de canard").id, quantity: 2, unitPrice: item("Confit de canard").price },
  ]);
  await createOrder("pending", customer("Sophie Bernard").id, [
    { menuItemId: item("Crème brûlée").id, quantity: 3, unitPrice: item("Crème brûlée").price },
    { menuItemId: item("Café").id, quantity: 3, unitPrice: item("Café").price },
  ]);

  // confirmed ×3
  await createOrder("confirmed", customer("Thomas Petit").id, [
    { menuItemId: item("Carpaccio de bœuf").id, quantity: 1, unitPrice: item("Carpaccio de bœuf").price },
    { menuItemId: item("Risotto champignons").id, quantity: 2, unitPrice: item("Risotto champignons").price },
  ]);
  await createOrder("confirmed", customer("Isabelle Moreau").id, [
    { menuItemId: item("Steak-frites").id, quantity: 1, unitPrice: item("Steak-frites").price },
    { menuItemId: item("Tarte tatin").id, quantity: 1, unitPrice: item("Tarte tatin").price },
    { menuItemId: item("Bière pression").id, quantity: 2, unitPrice: item("Bière pression").price },
  ]);
  await createOrder("confirmed", customer("Antoine Girard").id, [
    { menuItemId: item("Saumon grillé").id, quantity: 2, unitPrice: item("Saumon grillé").price },
    { menuItemId: item("Limonade").id, quantity: 2, unitPrice: item("Limonade").price },
  ]);

  // preparing ×3
  await createOrder("preparing", customer("Nicolas Laurent").id, [
    { menuItemId: item("Salade César").id, quantity: 2, unitPrice: item("Salade César").price },
    { menuItemId: item("Confit de canard").id, quantity: 2, unitPrice: item("Confit de canard").price },
    { menuItemId: item("Fondant chocolat").id, quantity: 2, unitPrice: item("Fondant chocolat").price },
  ]);
  await createOrder("preparing", customer("Camille Simon").id, [
    { menuItemId: item("Soupe à l'oignon").id, quantity: 1, unitPrice: item("Soupe à l'oignon").price },
    { menuItemId: item("Steak-frites").id, quantity: 1, unitPrice: item("Steak-frites").price },
    { menuItemId: item("Île flottante").id, quantity: 1, unitPrice: item("Île flottante").price },
  ]);
  await createOrder("preparing", customer("Pierre Lefebvre").id, [
    { menuItemId: item("Risotto champignons").id, quantity: 3, unitPrice: item("Risotto champignons").price },
    { menuItemId: item("Vin rouge (verre)").id, quantity: 3, unitPrice: item("Vin rouge (verre)").price },
  ]);

  // ready ×2
  await createOrder("ready", customer("Lucie Roux").id, [
    { menuItemId: item("Carpaccio de bœuf").id, quantity: 2, unitPrice: item("Carpaccio de bœuf").price },
    { menuItemId: item("Saumon grillé").id, quantity: 2, unitPrice: item("Saumon grillé").price },
    { menuItemId: item("Crème brûlée").id, quantity: 2, unitPrice: item("Crème brûlée").price },
  ]);
  await createOrder("ready", customer("Antoine Girard").id, [
    { menuItemId: item("Steak-frites").id, quantity: 2, unitPrice: item("Steak-frites").price },
    { menuItemId: item("Bière pression").id, quantity: 2, unitPrice: item("Bière pression").price },
  ]);

  // completed ×4
  await createOrder("completed", customer("Marie Dupont").id, [
    { menuItemId: item("Salade César").id, quantity: 1, unitPrice: item("Salade César").price },
    { menuItemId: item("Confit de canard").id, quantity: 1, unitPrice: item("Confit de canard").price },
    { menuItemId: item("Tarte tatin").id, quantity: 1, unitPrice: item("Tarte tatin").price },
    { menuItemId: item("Vin rouge (verre)").id, quantity: 2, unitPrice: item("Vin rouge (verre)").price },
  ]);
  await createOrder("completed", customer("Jean Martin").id, [
    { menuItemId: item("Steak-frites").id, quantity: 2, unitPrice: item("Steak-frites").price },
    { menuItemId: item("Fondant chocolat").id, quantity: 2, unitPrice: item("Fondant chocolat").price },
  ]);
  await createOrder("completed", customer("Thomas Petit").id, [
    { menuItemId: item("Risotto champignons").id, quantity: 1, unitPrice: item("Risotto champignons").price },
    { menuItemId: item("Café").id, quantity: 2, unitPrice: item("Café").price },
  ]);
  await createOrder("completed", customer("Nicolas Laurent").id, [
    { menuItemId: item("Carpaccio de bœuf").id, quantity: 1, unitPrice: item("Carpaccio de bœuf").price },
    { menuItemId: item("Saumon grillé").id, quantity: 1, unitPrice: item("Saumon grillé").price },
    { menuItemId: item("Eau minérale").id, quantity: 2, unitPrice: item("Eau minérale").price },
  ]);

  // cancelled ×2
  await createOrder("cancelled", customer("Isabelle Moreau").id, [
    { menuItemId: item("Steak-frites").id, quantity: 1, unitPrice: item("Steak-frites").price },
  ]);
  await createOrder("cancelled", customer("Camille Simon").id, [
    { menuItemId: item("Crème brûlée").id, quantity: 2, unitPrice: item("Crème brûlée").price },
    { menuItemId: item("Jus d'orange").id, quantity: 2, unitPrice: item("Jus d'orange").price },
  ]);

  console.log("✅ Seed terminé !");
  console.log(`   ${insertedItems.length} items · ${insertedCustomers.length} clients · 18 commandes`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed échoué :", err);
    process.exit(1);
  })
  .finally(() => sql.end());
