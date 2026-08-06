import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertProduct,
  InsertProductImage,
  InsertOrder,
  InsertOrderItem,
  InsertUser,
  products,
  productImages,
  orders,
  orderItems,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== FILE-BASED PERSISTENCE FOR IN-MEMORY STORE ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Store data at project root .data/ (outside server/ to avoid tsx watch restart loops)
const PROJECT_ROOT = join(__dirname, "..");
const DATA_DIR = join(PROJECT_ROOT, ".data");
const STORE_PATH = join(DATA_DIR, "store.json");

interface StoreData {
  nextProductId: number;
  nextImageId: number;
  nextOrderId: number;
  nextOrderItemId: number;
  nextUserId: number;
  users: any[];
  products: any[];
  productImages: any[];
  orders: any[];
  orderItems: any[];
}

const DEFAULT_USERS: any[] = [
  {
    id: 1,
    openId: "admin_debangshumondal7",
    name: "Debangshu Mondal",
    email: "debangshumondal7@gmail.com",
    role: "admin",
    loginMethod: "email",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: any[] = [
  {
    id: 1,
    name: "Acid Wash Oversized Heavyweight Tee",
    slug: "acid-wash-oversized-heavyweight-tee",
    description: "240 GSM 100% combed cotton, drop shoulder boxy fit with subtle distressed finish.",
    category: "tops",
    price: 1499,
    stock: 25,
    active: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Y2K Cyberpunk Parachute Cargo Pants",
    slug: "y2k-cyberpunk-parachute-cargo-pants",
    description: "Relaxed baggy fit with 6 utility pockets, adjustable drawstring cuffs, and matte hardware.",
    category: "bottoms",
    price: 2899,
    stock: 12,
    active: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Vintage Distressed Leather Biker Jacket",
    slug: "vintage-distressed-leather-biker-jacket",
    description: "Premium vegan leather with antiqued bronze zippers, satin inner lining, and structured shoulders.",
    category: "outerwear",
    price: 4999,
    stock: 4,
    active: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Industrial Cubano Chain Necklace",
    slug: "industrial-cubano-chain-necklace",
    description: "316L stainless steel, hypoallergenic, 8mm thickness with heavy lobster clasp.",
    category: "accessories",
    price: 999,
    stock: 30,
    active: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Minimalist Linen Utility Co-ord Set",
    slug: "minimalist-linen-utility-co-ord-set",
    description: "Breathable linen-cotton blend short sleeve button shirt with relaxed tailored shorts.",
    category: "co-ords",
    price: 3499,
    stock: 8,
    active: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_IMAGES: any[] = [
  { id: 1, productId: 1, imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60", imageKey: "prod_1_img", sortOrder: 0 },
  { id: 2, productId: 2, imageUrl: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=60", imageKey: "prod_2_img", sortOrder: 0 },
  { id: 3, productId: 3, imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60", imageKey: "prod_3_img", sortOrder: 0 },
  { id: 4, productId: 4, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=60", imageKey: "prod_4_img", sortOrder: 0 },
  { id: 5, productId: 5, imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60", imageKey: "prod_5_img", sortOrder: 0 },
];

function loadStore(): StoreData {
  try {
    if (existsSync(STORE_PATH)) {
      const raw = readFileSync(STORE_PATH, "utf-8");
      const data = JSON.parse(raw) as StoreData;
      console.log(`[Store] Loaded persistent store from ${STORE_PATH} (${data.products.length} products, ${data.orders.length} orders)`);
      return data;
    }
  } catch (err) {
    console.warn("[Store] Failed to load store file, using defaults:", err);
  }
  return {
    nextProductId: 100,
    nextImageId: 100,
    nextOrderId: 100,
    nextOrderItemId: 100,
    nextUserId: 100,
    users: DEFAULT_USERS,
    products: DEFAULT_PRODUCTS,
    productImages: DEFAULT_IMAGES,
    orders: [],
    orderItems: [],
  };
}

function saveStore(): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: StoreData = {
      nextProductId,
      nextImageId,
      nextOrderId,
      nextOrderItemId,
      nextUserId,
      users: memUsers,
      products: memProducts,
      productImages: memProductImages,
      orders: memOrders,
      orderItems: memOrderItems,
    };
    writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Store] Failed to save store:", err);
  }
}

// Load persisted data on startup
const _store = loadStore();
let nextProductId = _store.nextProductId;
let nextImageId = _store.nextImageId;
let nextOrderId = _store.nextOrderId;
let nextOrderItemId = _store.nextOrderItemId;
let nextUserId = _store.nextUserId;
const memUsers: any[] = _store.users;
const memProducts: any[] = _store.products;
const memProductImages: any[] = _store.productImages;
const memOrders: any[] = _store.orders;
const memOrderItems: any[] = _store.orderItems;

// ==================== USER QUERIES ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    const existingIndex = memUsers.findIndex(u => u.openId === user.openId);
    const now = new Date();
    if (existingIndex >= 0) {
      memUsers[existingIndex] = {
        ...memUsers[existingIndex],
        ...user,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn || now,
      };
    } else {
      memUsers.push({
        id: nextUserId++,
        openId: user.openId,
        name: user.name || "User",
        email: user.email || null,
        loginMethod: user.loginMethod || "email",
        role: user.role || (user.openId === "admin_debangshumondal7" ? "admin" : "user"),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn || now,
      });
    }
    saveStore();
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId || user.openId === "admin_debangshumondal7") { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return memUsers.find(u => u.openId === openId);
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== PRODUCT QUERIES ====================

export async function getAllActiveProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const db = await getDb();
  if (!db) {
    return memProducts.filter(p => {
      if (p.active !== 1) return false;
      if (filters?.category && filters.category !== "all" && p.category !== filters.category) return false;
      if (filters?.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters?.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      return true;
    });
  }

  const conditions: any[] = [eq(products.active, 1)];
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

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) {
    return memProducts.find(p => p.id === id);
  }
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    return memProducts.find(p => p.slug === slug);
  }
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(input: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) {
    const id = nextProductId++;
    const newProduct = {
      id,
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category: input.category,
      price: input.price,
      stock: input.stock,
      active: input.active ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memProducts.unshift(newProduct);
    saveStore();
    return id;
  }
  const result = await db.insert(products).values(input);
  return result[0].insertId;
}

export async function updateProduct(id: number, input: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) {
    const product = memProducts.find(p => p.id === id);
    if (product) {
      Object.assign(product, input, { updatedAt: new Date() });
    }
    saveStore();
    return;
  }
  await db.update(products).set(input as any).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) {
    const index = memProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      memProducts.splice(index, 1);
    }
    saveStore();
    return;
  }
  await db.delete(products).where(eq(products.id, id));
}

// ==================== PRODUCT IMAGE QUERIES ====================

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) {
    return memProductImages.filter(img => img.productId === productId).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.sortOrder);
}

export async function createProductImage(input: InsertProductImage): Promise<number> {
  const db = await getDb();
  if (!db) {
    const id = nextImageId++;
    const newImg = {
      id,
      productId: input.productId,
      imageUrl: input.imageUrl,
      imageKey: input.imageKey,
      sortOrder: input.sortOrder ?? 0,
    };
    memProductImages.push(newImg);
    saveStore();
    return id;
  }
  const result = await db.insert(productImages).values(input);
  return result[0].insertId;
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) {
    const index = memProductImages.findIndex(img => img.id === id);
    if (index >= 0) {
      memProductImages.splice(index, 1);
    }
    saveStore();
    return;
  }
  await db.delete(productImages).where(eq(productImages.id, id));
}

// ==================== ORDER QUERIES ====================

export async function createOrder(input: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) {
    const id = nextOrderId++;
    const newOrder = {
      id,
      orderNumber: input.orderNumber,
      userId: input.userId,
      totalAmount: input.totalAmount,
      status: input.status || "pending",
      shippingName: input.shippingName,
      shippingEmail: input.shippingEmail,
      shippingPhone: input.shippingPhone,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingState: input.shippingState,
      shippingZipCode: input.shippingZipCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memOrders.unshift(newOrder);
    saveStore();
    return id;
  }
  const result = await db.insert(orders).values(input);
  return result[0].insertId;
}

export async function createOrderItem(input: InsertOrderItem): Promise<number> {
  const db = await getDb();
  if (!db) {
    const id = nextOrderItemId++;
    const newItem = {
      id,
      orderId: input.orderId,
      productId: input.productId,
      productName: input.productName,
      size: input.size,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    };
    memOrderItems.push(newItem);
    saveStore();
    return id;
  }
  const result = await db.insert(orderItems).values(input);
  return result[0].insertId;
}

export async function getOrderByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) {
    return memOrders.find(o => o.orderNumber === orderNumber);
  }
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) {
    return memOrderItems.filter(item => item.orderId === orderId);
  }
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return memOrders.filter(o => o.userId === userId);
  }
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) {
    return memOrders;
  }
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered") {
  const db = await getDb();
  if (!db) {
    const order = memOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
    saveStore();
    return;
  }
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) {
    const totalRevenue = memOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = memOrders.length;
    const activeProducts = memProducts.filter(p => p.active === 1);
    const totalProducts = activeProducts.length;
    const lowStockProducts = activeProducts.filter(p => p.stock <= 5).slice(0, 10);
    const recentOrders = memOrders.slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
    };
  }

  const [totalRevenueResult, totalOrdersResult, totalProductsResult, lowStockResult, recentOrdersResult] = await Promise.all([
    db.select({ total: sql`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders),
    db.select({ count: sql`COUNT(*)` }).from(orders),
    db.select({ count: sql`COUNT(*)` }).from(products).where(eq(products.active, 1)),
    db.select({ products: products }).from(products).where(and(eq(products.active, 1), sql`${products.stock} <= 5`)).limit(10),
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
  let result = "ARU-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
