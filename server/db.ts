import { eq, and, sql, desc, inArray, lt, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertProduct,
  InsertProductImage,
  InsertOrder,
  InsertOrderItem,
  InsertUser,
  InsertDesignRound,
  InsertCommunityDesign,
  InsertSuggestion,
  InsertContactMessage,
  ContactMessage,
  products,
  productImages,
  orders,
  orderItems,
  users,
  designRounds,
  communityDesigns,
  designLikes,
  suggestions,
  suggestionUpvotes,
  contactMessages,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _schemaEnsured = false;

export async function ensureDbSchema() {
  if (_schemaEnsured) return;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;
  try {
    const client = postgres(connectionString, { prepare: false });
    // Product columns
    await client`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes json DEFAULT '["XS","S","M","L","XL","XXL"]'::json;`;
    await client`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors json DEFAULT '[]'::json;`;
    await client`ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_url text;`;

    // Order items columns
    await client`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color varchar(64);`;

    // Orders table columns & fields
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id varchar(255);`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id varchar(255);`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier varchar(64) DEFAULT 'Delhivery';`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill varchar(64);`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url varchar(512);`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delhivery_status varchar(128);`;
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamp with time zone;`;

    // Ensure order_status enum has 'cancelled'
    try {
      await client`ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'cancelled';`;
    } catch {
      // ignore if already present or not supported in transaction
    }

    // Ensure contact_messages table exists
    await client`CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(320) NOT NULL,
      order_number VARCHAR(64),
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'unread' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );`;

    await client.end();
    _schemaEnsured = true;
    console.log("[DB] Schema updated: all table columns and schemas verified.");
  } catch (err) {
    console.warn("[DB] ensureDbSchema warning:", err);
  }
}

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required. Set it in your .env file with your Supabase connection string.");
    }
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client);
    ensureDbSchema().catch(() => {});
  }
  return _db;
}

// ==================== USER QUERIES ====================

export async function upsertUser(user: Partial<InsertUser> & { authId: string }): Promise<void> {
  if (!user.authId) throw new Error("User authId is required for upsert");
  const db = getDb();
  const now = new Date();

  const values: InsertUser = {
    authId: user.authId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? "email",
    role: user.role ?? "user",
    lastSignedIn: user.lastSignedIn ?? now,
  };

  const updateSet: Record<string, unknown> = {
    updatedAt: now,
    lastSignedIn: user.lastSignedIn ?? now,
  };
  if (user.name !== undefined) updateSet.name = user.name;
  if (user.email !== undefined) updateSet.email = user.email;
  if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
  if (user.role !== undefined) updateSet.role = user.role;

  await db.insert(users).values(values).onConflictDoUpdate({
    target: users.authId,
    set: updateSet,
  });
}

export async function getUserByAuthId(authId: string) {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.authId, authId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== PRODUCT QUERIES ====================

export async function getAllActiveProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const db = getDb();
  const conditions: any[] = [eq(products.active, true)];
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(products.category, filters.category as any));
  }
  if (filters?.minPrice !== undefined) {
    conditions.push(sql`${products.price} >= ${filters.minPrice}`);
  }
  if (filters?.maxPrice !== undefined) {
    conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
  }

  return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
}

export async function getAllProducts() {
  const db = getDb();
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = getDb();
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = getDb();
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(input: InsertProduct): Promise<number> {
  const db = getDb();
  const result = await db.insert(products).values(input).returning({ id: products.id });
  return result[0].id;
}

export async function updateProduct(id: number, input: Partial<InsertProduct>) {
  const db = getDb();
  await db.update(products).set({ ...input, updatedAt: new Date() } as any).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = getDb();
  // Delete associated images first
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(products).where(eq(products.id, id));
}

// ==================== PRODUCT IMAGE QUERIES ====================

export async function getProductImages(productId: number) {
  const db = getDb();
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.sortOrder);
}

/**
 * Batch-fetch images for multiple products in a single query.
 * Returns a Map of productId → images[], avoiding N+1 queries.
 */
export async function getProductImagesByProductIds(productIds: number[]) {
  if (productIds.length === 0) return new Map<number, typeof productImages.$inferSelect[]>();
  const db = getDb();
  const allImages = await db.select().from(productImages)
    .where(sql`${productImages.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(productImages.sortOrder);
  const imageMap = new Map<number, typeof productImages.$inferSelect[]>();
  for (const img of allImages) {
    const existing = imageMap.get(img.productId) || [];
    existing.push(img);
    imageMap.set(img.productId, existing);
  }
  return imageMap;
}

export async function createProductImage(input: InsertProductImage): Promise<number> {
  const db = getDb();
  const result = await db.insert(productImages).values(input).returning({ id: productImages.id });
  return result[0].id;
}

export async function deleteProductImage(id: number) {
  const db = getDb();
  await db.delete(productImages).where(eq(productImages.id, id));
}

// ==================== ORDER QUERIES ====================

export async function createOrder(input: InsertOrder): Promise<number> {
  const db = getDb();
  const result = await db.insert(orders).values(input).returning({ id: orders.id });
  return result[0].id;
}

export async function createOrderItem(input: InsertOrderItem): Promise<number> {
  const db = getDb();
  const result = await db.insert(orderItems).values(input).returning({ id: orderItems.id });
  return result[0].id;
}

export async function getOrderByOrderNumber(orderNumber: string) {
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderById(id: number) {
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string) {
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderRazorpayId(orderId: number, razorpayOrderId: string) {
  const db = getDb();
  await db.update(orders).set({ razorpayOrderId, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function updateOrderPayment(orderId: number, razorpayPaymentId: string, status: "processing" | "cancelled") {
  const db = getDb();
  await db.update(orders).set({ razorpayPaymentId, status, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function getOrdersByUserId(userId: number) {
  const db = getDb();
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = getDb();
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = getDb();
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  await db.delete(orders).where(eq(orders.id, id));
}

export async function updateOrderShipment(
  id: number,
  shipment: {
    waybill: string;
    shippingCourier?: string;
    shippingLabelUrl?: string;
    delhiveryStatus?: string;
    estimatedDeliveryDate?: Date;
    status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  },
) {
  const db = getDb();
  const updateData: any = {
    waybill: shipment.waybill,
    updatedAt: new Date(),
  };
  if (shipment.shippingCourier) updateData.shippingCourier = shipment.shippingCourier;
  if (shipment.shippingLabelUrl) updateData.shippingLabelUrl = shipment.shippingLabelUrl;
  if (shipment.delhiveryStatus) updateData.delhiveryStatus = shipment.delhiveryStatus;
  if (shipment.estimatedDeliveryDate) updateData.estimatedDeliveryDate = shipment.estimatedDeliveryDate;
  if (shipment.status) updateData.status = shipment.status;

  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

export async function getOrderByWaybill(waybill: string) {
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.waybill, waybill)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAdminDashboardStats() {
  const db = getDb();

  const [totalRevenueResult, totalOrdersResult, totalProductsResult, lowStockResult, recentOrdersResult] = await Promise.all([
    db.select({ total: sql`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders),
    db.select({ count: sql`COUNT(*)` }).from(orders),
    db.select({ count: sql`COUNT(*)` }).from(products).where(eq(products.active, true)),
    db.select().from(products).where(and(eq(products.active, true), sql`${products.stock} <= 5`)).limit(10),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  return {
    totalRevenue: Number(totalRevenueResult[0]?.total || 0),
    totalOrders: Number(totalOrdersResult[0]?.count || 0),
    totalProducts: Number(totalProductsResult[0]?.count || 0),
    lowStockProducts: lowStockResult,
    recentOrders: recentOrdersResult,
  };
}

export async function generateOrderNumber(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const MAX_ATTEMPTS = 10;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let result = "ARU-";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await getOrderByOrderNumber(result);
    if (!existing) {
      return result;
    }
  }
  return `ARU-${Date.now().toString(36).toUpperCase()}`;
}

// ==================== COMMUNITY DESIGN ROUND QUERIES ====================

export async function createDesignRound(input: InsertDesignRound): Promise<number> {
  const db = getDb();
  const result = await db.insert(designRounds).values(input).returning({ id: designRounds.id });
  return result[0].id;
}

export async function updateDesignRound(id: number, input: Partial<InsertDesignRound>) {
  const db = getDb();
  await db.update(designRounds).set({ ...input, updatedAt: new Date() } as any).where(eq(designRounds.id, id));
}

export async function getDesignRoundById(id: number) {
  const db = getDb();
  const result = await db.select().from(designRounds).where(eq(designRounds.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveDesignRound() {
  const db = getDb();
  // Auto-close any expired rounds first
  await checkAndCloseExpiredRounds();
  const result = await db.select().from(designRounds)
    .where(eq(designRounds.status, "active"))
    .orderBy(desc(designRounds.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDesignRounds() {
  const db = getDb();
  return db.select().from(designRounds).orderBy(desc(designRounds.createdAt));
}

export async function checkAndCloseExpiredRounds() {
  const db = getDb();
  const now = new Date();
  // Find active rounds whose deadline has passed
  const expired = await db.select().from(designRounds)
    .where(and(eq(designRounds.status, "active"), lt(designRounds.endsAt, now)));

  for (const round of expired) {
    // Find the top-liked design for this round
    const topDesign = await getTopDesignForRound(round.id);
    await db.update(designRounds).set({
      status: "closed",
      winnerDesignId: topDesign?.id ?? null,
      updatedAt: now,
    } as any).where(eq(designRounds.id, round.id));

    // Mark the winner as featured
    if (topDesign) {
      await db.update(communityDesigns).set({ featured: true }).where(eq(communityDesigns.id, topDesign.id));
    }
  }
}

export async function closeDesignRound(roundId: number, winnerDesignId?: number) {
  const db = getDb();
  const now = new Date();

  let winnerId = winnerDesignId;
  if (!winnerId) {
    const topDesign = await getTopDesignForRound(roundId);
    winnerId = topDesign?.id;
  }

  await db.update(designRounds).set({
    status: "closed",
    winnerDesignId: winnerId ?? null,
    updatedAt: now,
  } as any).where(eq(designRounds.id, roundId));

  // Mark the winner as featured
  if (winnerId) {
    // Un-feature any previous featured designs in this round
    await db.update(communityDesigns).set({ featured: false })
      .where(and(eq(communityDesigns.roundId, roundId), eq(communityDesigns.featured, true)));
    await db.update(communityDesigns).set({ featured: true }).where(eq(communityDesigns.id, winnerId));
  }
}

// ==================== COMMUNITY DESIGN QUERIES ====================

export async function createCommunityDesign(input: InsertCommunityDesign): Promise<number> {
  const db = getDb();
  const result = await db.insert(communityDesigns).values(input).returning({ id: communityDesigns.id });
  return result[0].id;
}

export async function getDesignsByRoundId(roundId: number) {
  const db = getDb();
  return db.select().from(communityDesigns)
    .where(eq(communityDesigns.roundId, roundId))
    .orderBy(desc(communityDesigns.likeCount));
}

export async function getCommunityDesignById(id: number) {
  const db = getDb();
  const result = await db.select().from(communityDesigns).where(eq(communityDesigns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTopDesignForRound(roundId: number) {
  const db = getDb();
  const result = await db.select().from(communityDesigns)
    .where(eq(communityDesigns.roundId, roundId))
    .orderBy(desc(communityDesigns.likeCount))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDesignsByUserId(userId: number) {
  const db = getDb();
  return db.select().from(communityDesigns)
    .where(eq(communityDesigns.userId, userId))
    .orderBy(desc(communityDesigns.createdAt));
}

export async function deleteCommunityDesign(id: number) {
  const db = getDb();
  await db.delete(designLikes).where(eq(designLikes.designId, id));
  await db.delete(communityDesigns).where(eq(communityDesigns.id, id));
}

export async function getDesignSubmitter(designId: number) {
  const db = getDb();
  const design = await getCommunityDesignById(designId);
  if (!design) return undefined;
  return getUserById(design.userId);
}

export async function getFeaturedWinners() {
  const db = getDb();
  return db.select().from(communityDesigns)
    .where(eq(communityDesigns.featured, true))
    .orderBy(desc(communityDesigns.createdAt));
}

// ==================== DESIGN LIKE QUERIES ====================

export async function addDesignLike(designId: number, userId: number): Promise<boolean> {
  const db = getDb();
  try {
    await db.insert(designLikes).values({ designId, userId });
    // Increment denormalized count
    await db.update(communityDesigns)
      .set({ likeCount: sql`${communityDesigns.likeCount} + 1` })
      .where(eq(communityDesigns.id, designId));
    return true;
  } catch (e: any) {
    // Unique constraint violation — user already liked
    if (e?.code === "23505") return false;
    throw e;
  }
}

export async function removeDesignLike(designId: number, userId: number): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(designLikes)
    .where(and(eq(designLikes.designId, designId), eq(designLikes.userId, userId)))
    .returning({ id: designLikes.id });

  if (result.length > 0) {
    // Decrement denormalized count
    await db.update(communityDesigns)
      .set({ likeCount: sql`GREATEST(${communityDesigns.likeCount} - 1, 0)` })
      .where(eq(communityDesigns.id, designId));
    return true;
  }
  return false;
}

export async function getUserLikesForRound(userId: number, roundId: number): Promise<number[]> {
  const db = getDb();
  // Get all design IDs in this round that the user has liked
  const designs = await db.select({ id: communityDesigns.id }).from(communityDesigns)
    .where(eq(communityDesigns.roundId, roundId));

  if (designs.length === 0) return [];

  const designIds = designs.map(d => d.id);
  const likes = await db.select({ designId: designLikes.designId }).from(designLikes)
    .where(and(
      eq(designLikes.userId, userId),
      inArray(designLikes.designId, designIds),
    ));
  return likes.map(l => l.designId);
}

export async function getUserDesignSubmitterNames(designIds: number[]): Promise<Map<number, string>> {
  if (designIds.length === 0) return new Map();
  const db = getDb();
  const designs = await db.select({
    designId: communityDesigns.id,
    userId: communityDesigns.userId,
  }).from(communityDesigns)
    .where(inArray(communityDesigns.id, designIds));

  const userIds = Array.from(new Set(designs.map(d => d.userId)));
  if (userIds.length === 0) return new Map();

  const userRows = await db.select({ id: users.id, name: users.name }).from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map<number, string>();
  for (const u of userRows) {
    userMap.set(u.id, u.name ?? "Anonymous");
  }

  const result = new Map<number, string>();
  for (const d of designs) {
    result.set(d.designId, userMap.get(d.userId) ?? "Anonymous");
  }
  return result;
}

// ==================== SUGGESTION QUERIES ====================

export async function createSuggestion(input: InsertSuggestion): Promise<number> {
  const db = getDb();
  const result = await db.insert(suggestions).values(input).returning({ id: suggestions.id });
  return result[0].id;
}

export async function getSuggestionById(id: number) {
  const db = getDb();
  const result = await db.select().from(suggestions).where(eq(suggestions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSuggestions(filters?: {
  type?: string;
  status?: string;
  sortBy?: "upvotes" | "newest";
}) {
  const db = getDb();
  const conditions: any[] = [];
  if (filters?.type && filters.type !== "all") {
    conditions.push(eq(suggestions.type, filters.type as any));
  }
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(suggestions.status, filters.status as any));
  }

  const orderCol = filters?.sortBy === "newest"
    ? desc(suggestions.createdAt)
    : desc(suggestions.upvoteCount);

  if (conditions.length > 0) {
    return db.select().from(suggestions).where(and(...conditions)).orderBy(orderCol);
  }
  return db.select().from(suggestions).orderBy(orderCol);
}

export async function getSuggestionsByUserId(userId: number) {
  const db = getDb();
  return db.select().from(suggestions)
    .where(eq(suggestions.userId, userId))
    .orderBy(desc(suggestions.createdAt));
}

export async function updateSuggestionStatus(id: number, status: "open" | "reviewed" | "planned" | "done") {
  const db = getDb();
  await db.update(suggestions).set({ status }).where(eq(suggestions.id, id));
}

export async function addSuggestionAdminNote(id: number, note: string) {
  const db = getDb();
  await db.update(suggestions).set({ adminNote: note }).where(eq(suggestions.id, id));
}

export async function deleteSuggestion(id: number) {
  const db = getDb();
  await db.delete(suggestionUpvotes).where(eq(suggestionUpvotes.suggestionId, id));
  await db.delete(suggestions).where(eq(suggestions.id, id));
}

// ==================== SUGGESTION UPVOTE QUERIES ====================

export async function addSuggestionUpvote(suggestionId: number, userId: number): Promise<boolean> {
  const db = getDb();
  try {
    await db.insert(suggestionUpvotes).values({ suggestionId, userId });
    await db.update(suggestions)
      .set({ upvoteCount: sql`${suggestions.upvoteCount} + 1` })
      .where(eq(suggestions.id, suggestionId));
    return true;
  } catch (e: any) {
    if (e?.code === "23505") return false;
    throw e;
  }
}

export async function removeSuggestionUpvote(suggestionId: number, userId: number): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(suggestionUpvotes)
    .where(and(eq(suggestionUpvotes.suggestionId, suggestionId), eq(suggestionUpvotes.userId, userId)))
    .returning({ id: suggestionUpvotes.id });

  if (result.length > 0) {
    await db.update(suggestions)
      .set({ upvoteCount: sql`GREATEST(${suggestions.upvoteCount} - 1, 0)` })
      .where(eq(suggestions.id, suggestionId));
    return true;
  }
  return false;
}

export async function getUserUpvotesForSuggestions(userId: number): Promise<number[]> {
  const db = getDb();
  const upvotes = await db.select({ suggestionId: suggestionUpvotes.suggestionId })
    .from(suggestionUpvotes)
    .where(eq(suggestionUpvotes.userId, userId));
  return upvotes.map(u => u.suggestionId);
}

export async function getSuggestionSubmitterNames(suggestionIds: number[]): Promise<Map<number, string>> {
  if (suggestionIds.length === 0) return new Map();
  const db = getDb();
  const rows = await db.select({
    suggestionId: suggestions.id,
    userId: suggestions.userId,
  }).from(suggestions)
    .where(inArray(suggestions.id, suggestionIds));

  const userIds = Array.from(new Set(rows.map(r => r.userId)));
  if (userIds.length === 0) return new Map();

  const userRows = await db.select({ id: users.id, name: users.name }).from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map<number, string>();
  for (const u of userRows) {
    userMap.set(u.id, u.name ?? "Anonymous");
  }

  const result = new Map<number, string>();
  for (const r of rows) {
    result.set(r.suggestionId, userMap.get(r.userId) ?? "Anonymous");
  }
  return result;
}

// ==================== CONTACT MESSAGES ====================

export async function createContactMessage(data: InsertContactMessage): Promise<number> {
  const db = getDb();
  const [result] = await db.insert(contactMessages).values(data).returning({ id: contactMessages.id });
  return result.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const db = getDb();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function updateContactMessageStatus(id: number, status: string): Promise<void> {
  const db = getDb();
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

