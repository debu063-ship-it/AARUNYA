import { integer, pgEnum, pgTable, serial, text, timestamp, varchar, boolean, json, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Enums
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["tops", "bottoms", "outerwear", "accessories", "co-ords"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered"]);
export const sizeEnum = pgEnum("size", ["XS", "S", "M", "L", "XL", "XXL"]);

/**
 * Core user table — synced from Supabase Auth.
 * `authId` is the Supabase Auth user UUID.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  authId: varchar("auth_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table — clothing items for the store.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  price: integer("price").notNull(), // stored in smallest currency unit (paise/cents)
  stock: integer("stock").default(0).notNull(),
  sizes: json("sizes").$type<string[]>().default(["XS", "S", "M", "L", "XL", "XXL"]),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product images — multiple images per product via Supabase Storage.
 */
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  imageUrl: varchar("image_url", { length: 512 }).notNull(),
  imageKey: varchar("image_key", { length: 512 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

/**
 * Orders table — customer purchases.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: integer("total_amount").notNull(), // in smallest currency unit
  shippingName: varchar("shipping_name", { length: 255 }).notNull(),
  shippingEmail: varchar("shipping_email", { length: 320 }).notNull(),
  shippingPhone: varchar("shipping_phone", { length: 32 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: varchar("shipping_city", { length: 128 }).notNull(),
  shippingState: varchar("shipping_state", { length: 128 }).notNull(),
  shippingZipCode: varchar("shipping_zip_code", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items — line items within an order.
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  size: varchar("size", { length: 32 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Enums — Community Designs
 */
export const designRoundStatusEnum = pgEnum("design_round_status", [
  "active",
  "voting",
  "closed",
  "featured",
]);

/**
 * Design rounds — a contest period for community design submissions.
 */
export const designRounds = pgTable("design_rounds", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: designRoundStatusEnum("status").default("active").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).defaultNow().notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  winnerDesignId: integer("winner_design_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DesignRound = typeof designRounds.$inferSelect;
export type InsertDesignRound = typeof designRounds.$inferInsert;

/**
 * Community designs — user-submitted design entries.
 */
export const communityDesigns = pgTable("community_designs", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }).notNull(),
  imageKey: varchar("image_key", { length: 512 }).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CommunityDesign = typeof communityDesigns.$inferSelect;
export type InsertCommunityDesign = typeof communityDesigns.$inferInsert;

/**
 * Design likes — one row per user per design (prevents double-likes).
 */
export const designLikes = pgTable(
  "design_likes",
  {
    id: serial("id").primaryKey(),
    designId: integer("design_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("design_likes_design_user_idx").on(table.designId, table.userId),
  ],
);

export type DesignLike = typeof designLikes.$inferSelect;
export type InsertDesignLike = typeof designLikes.$inferInsert;

/**
 * Enums — Suggestions
 */
export const suggestionTypeEnum = pgEnum("suggestion_type", [
  "new_design",
  "different_fabric",
  "other",
]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "open",
  "reviewed",
  "planned",
  "done",
]);

/**
 * Suggestions — customer ideas for new products or fabric variants.
 */
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: suggestionTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  productId: integer("product_id"),           // nullable — reference to existing product
  fabricOrMaterial: varchar("fabric_or_material", { length: 255 }),
  upvoteCount: integer("upvote_count").default(0).notNull(),
  status: suggestionStatusEnum("status").default("open").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = typeof suggestions.$inferInsert;

/**
 * Suggestion upvotes — one row per user per suggestion.
 */
export const suggestionUpvotes = pgTable(
  "suggestion_upvotes",
  {
    id: serial("id").primaryKey(),
    suggestionId: integer("suggestion_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("suggestion_upvotes_suggestion_user_idx").on(table.suggestionId, table.userId),
  ],
);

export type SuggestionUpvote = typeof suggestionUpvotes.$inferSelect;
export type InsertSuggestionUpvote = typeof suggestionUpvotes.$inferInsert;
