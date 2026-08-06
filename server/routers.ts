import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { sendOrderNotificationEmail } from "./email";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    loginWithEmail: publicProcedure.input(z.object({
      email: z.string().email("Please enter a valid email address"),
      name: z.string().optional(),
      password: z.string().optional(),
      isAdminPortal: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const ADMIN_EMAIL = "debangshumondal7@gmail.com";
      const expectedAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

      const isAdminEmail = normalizedEmail === ADMIN_EMAIL.toLowerCase();

      if (input.isAdminPortal) {
        if (!isAdminEmail) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access Denied: Only debangshumondal7@gmail.com is authorized as Admin.",
          });
        }
        if (!input.password || input.password !== expectedAdminPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Admin Password.",
          });
        }
      }

      const role = (isAdminEmail && (input.password === expectedAdminPassword || !input.isAdminPortal)) ? "admin" : "user";
      const openId = isAdminEmail ? "admin_debangshumondal7" : `user_${Buffer.from(normalizedEmail).toString("hex").slice(0, 32)}`;
      const userName = input.name?.trim() || (isAdminEmail ? "Debangshu Mondal" : normalizedEmail.split("@")[0]);

      try {
        await db.upsertUser({
          openId,
          name: userName,
          email: normalizedEmail,
          loginMethod: "email",
          role,
          lastSignedIn: new Date(),
        });
      } catch (err) {
        console.warn("[Auth] DB upsert user failed:", err);
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return {
        success: true,
        user: {
          openId,
          name: userName,
          email: normalizedEmail,
          role,
        },
      };
    }),
  }),

  // ==================== PUBLIC PRODUCT ROUTES ====================
  products: router({
    list: publicProcedure.input(z.object({
      category: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      const products = await db.getAllActiveProducts(input);
      // Attach first image to each product
      const productsWithImages = await Promise.all(products.map(async (p) => {
        const images = await db.getProductImages(p.id);
        return { ...p, images };
      }));
      return productsWithImages;
    }),

    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      const images = await db.getProductImages(product.id);
      return { ...product, images };
    }),

    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const product = await db.getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      const images = await db.getProductImages(product.id);
      return { ...product, images };
    }),
  }),

  // ==================== ORDER ROUTES (CUSTOMER) ====================
  orders: router({
    create: protectedProcedure.input(z.object({
      items: z.array(z.object({
        productId: z.number(),
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
        quantity: z.number().min(1),
      })),
      shippingName: z.string().min(1),
      shippingEmail: z.string().email(),
      shippingPhone: z.string().min(1),
      shippingAddress: z.string().min(1),
      shippingCity: z.string().min(1),
      shippingState: z.string().min(1),
      shippingZipCode: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const orderNumber = await db.generateOrderNumber();
      let totalAmount = 0;

      // Validate stock and calculate total
      const orderItems = [];
      for (const item of input.items) {
        const product = await db.getProductById(item.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: `Product ${item.productId} not found` });
        if (product.stock < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${product.name}` });
        }
        totalAmount += product.price * item.quantity;
        orderItems.push({ product, ...item });
      }

      // Create order
      const orderId = await db.createOrder({
        userId: user.id,
        orderNumber,
        totalAmount,
        shippingName: input.shippingName,
        shippingEmail: input.shippingEmail,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingZipCode: input.shippingZipCode,
      });

      // Create order items and reduce stock
      const notificationItems: Array<{ productName: string; size: string; quantity: number; unitPrice: number }> = [];
      for (const item of orderItems) {
        await db.createOrderItem({
          orderId,
          productId: item.productId,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.product.price,
        });
        await db.updateProduct(item.productId, { stock: item.product.stock - item.quantity });
        notificationItems.push({
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.product.price,
        });
      }

      // Send email notification to admin asynchronously (non-blocking for customer experience)
      sendOrderNotificationEmail({
        orderNumber,
        shippingName: input.shippingName,
        shippingEmail: input.shippingEmail,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingZipCode: input.shippingZipCode,
        totalAmount,
        items: notificationItems,
      }).catch((err) => console.error("[Order] Email notification error:", err));

      return { orderNumber };
    }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const userOrders = await db.getOrdersByUserId(ctx.user.id);
      const ordersWithItems = await Promise.all(userOrders.map(async (o) => {
        const items = await db.getOrderItems(o.id);
        return { ...o, items };
      }));
      return ordersWithItems;
    }),

    byOrderNumber: protectedProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ input }) => {
      const order = await db.getOrderByOrderNumber(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),
  }),

  // ==================== ADMIN PRODUCT ROUTES ====================
  adminProducts: router({
    list: adminProcedure.query(async () => {
      const allProducts = await db.getAllActiveProducts();
      const productsWithImages = await Promise.all(allProducts.map(async (p) => {
        const images = await db.getProductImages(p.id);
        return { ...p, images };
      }));
      return productsWithImages;
    }),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const product = await db.getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      const images = await db.getProductImages(product.id);
      return { ...product, images };
    }),

    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["tops", "bottoms", "outerwear", "accessories", "co-ords"]),
      price: z.number().min(0),
      stock: z.number().min(0),
      images: z.array(z.object({
        url: z.string(),
        key: z.string(),
      })).optional(),
    })).mutation(async ({ input }) => {
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const productId = await db.createProduct({
        name: input.name,
        slug,
        description: input.description || null,
        category: input.category,
        price: input.price,
        stock: input.stock,
        active: 1,
      });

      // Save images
      if (input.images && input.images.length > 0) {
        for (let i = 0; i < input.images.length; i++) {
          await db.createProductImage({
            productId,
            imageUrl: input.images[i].url,
            imageKey: input.images[i].key,
            sortOrder: i,
          });
        }
      }

      return { id: productId };
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["tops", "bottoms", "outerwear", "accessories", "co-ords"]),
      price: z.number().min(0),
      stock: z.number().min(0),
      active: z.number().optional(),
      images: z.array(z.object({
        url: z.string(),
        key: z.string(),
      })).optional(),
    })).mutation(async ({ input }) => {
      const { images, ...productData } = input;
      const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await db.updateProduct(productData.id, { ...productData, slug });

      // Update images: delete old, add new
      const existingImages = await db.getProductImages(productData.id);
      for (const img of existingImages) {
        await db.deleteProductImage(img.id);
      }
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await db.createProductImage({
            productId: productData.id,
            imageUrl: images[i].url,
            imageKey: images[i].key,
            sortOrder: i,
          });
        }
      }

      return { success: true };
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteProduct(input.id);
      return { success: true };
    }),

    uploadImage: adminProcedure.input(z.object({
      file: z.string(), // base64 encoded image
      filename: z.string(),
    })).mutation(async ({ input }) => {
      const fileBuffer = Buffer.from(input.file, "base64");
      const ext = input.filename.split(".").pop() || "png";
      const { key, url } = await storagePut(
        `products/${Date.now()}.${ext}`,
        fileBuffer,
        `image/${ext === "jpg" ? "jpeg" : ext}`
      );
      return { key, url };
    }),
  }),

  // ==================== ADMIN ORDER ROUTES ====================
  adminOrders: router({
    list: adminProcedure.query(async () => {
      const allOrders = await db.getAllOrders();
      const ordersWithItems = await Promise.all(allOrders.map(async (o) => {
        const items = await db.getOrderItems(o.id);
        return { ...o, items };
      }));
      return ordersWithItems;
    }),

    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "shipped", "delivered"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
  }),

  // ==================== ADMIN DASHBOARD ====================
  adminDashboard: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
