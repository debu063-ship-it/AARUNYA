import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table — clothing items for the store.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: mysqlEnum("category", [
    "tops",
    "bottoms",
    "outerwear",
    "accessories",
    "co-ords",
  ]).notNull(),
  price: int("price").notNull(), // stored in smallest currency unit (paise/cents)
  stock: int("stock").default(0).notNull(),
  active: int("active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product images — multiple images per product via S3.
 */
export const productImages = mysqlTable("productImages", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

/**
 * Orders table — customer purchases.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered"])
    .default("pending")
    .notNull(),
  totalAmount: int("totalAmount").notNull(), // in smallest currency unit
  shippingName: varchar("shippingName", { length: 255 }).notNull(),
  shippingEmail: varchar("shippingEmail", { length: 320 }).notNull(),
  shippingPhone: varchar("shippingPhone", { length: 32 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  shippingCity: varchar("shippingCity", { length: 128 }).notNull(),
  shippingState: varchar("shippingState", { length: 128 }).notNull(),
  shippingZipCode: varchar("shippingZipCode", { length: 16 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items — line items within an order.
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  size: mysqlEnum("size", ["XS", "S", "M", "L", "XL", "XXL"]).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
