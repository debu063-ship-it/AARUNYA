import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut, communityStoragePut, communityStorageDelete } from "./storage";
import { sendOrderNotificationEmail } from "./email";
import { supabaseAdmin } from "./supabase";
import { ENV } from "./_core/env";
import { createRazorpayOrder, verifyPaymentSignature } from "./razorpay";
import { checkPincodeServiceability, createDelhiveryShipment, trackDelhiveryPackage } from "./delhivery";

export const appRouter = router({
  auth: router({
    /**
     * Returns the current user from our DB, or null if not authenticated.
     */
    me: publicProcedure.query(opts => opts.ctx.user),

    /**
     * After Supabase Auth login on the client, call this to sync the user
     * into our application's `users` table and get back the full user object.
     */
    syncUser: publicProcedure.input(z.object({
      accessToken: z.string(),
    })).mutation(async ({ input }) => {
      // Verify the token and get Supabase user
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(input.accessToken);

      if (error || !supabaseUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid session. Please sign in again.",
        });
      }

      const email = supabaseUser.email ?? "";
      const isAdmin = email.toLowerCase() === ENV.adminEmail.toLowerCase();

      await db.upsertUser({
        authId: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || email.split("@")[0],
        email,
        loginMethod: supabaseUser.app_metadata?.provider ?? "email",
        role: isAdmin ? "admin" : "user",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByAuthId(supabaseUser.id);

      return {
        success: true,
        user: user ?? null,
      };
    }),

    logout: publicProcedure.mutation(() => {
      // Client-side handles Supabase sign-out; server just acknowledges
      return { success: true } as const;
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
      const imageMap = await db.getProductImagesByProductIds(products.map(p => p.id));
      return products.map(p => ({ ...p, images: imageMap.get(p.id) || [] }));
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
        size: z.string().min(1),
        color: z.string().optional(),
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
      let subtotal = 0;

      // Validate stock and calculate subtotal
      const orderItems = [];
      for (const item of input.items) {
        const product = await db.getProductById(item.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: `Product ${item.productId} not found` });
        if (product.stock < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${product.name}` });
        }
        subtotal += product.price * item.quantity;
        orderItems.push({ product, ...item });
      }

      // Calculate shipping cost server-side (free above ₹999, flat ₹59 below)
      const shippingCost = subtotal >= 999 ? 0 : 59;
      const totalAmount = subtotal + shippingCost;

      // Create order in pending state (stock NOT reduced yet)
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

      // Create order items (for record keeping, stock not reduced yet)
      for (const item of orderItems) {
        await db.createOrderItem({
          orderId,
          productId: item.productId,
          productName: item.product.name,
          size: item.size,
          color: item.color || null,
          quantity: item.quantity,
          unitPrice: item.product.price,
        });
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(totalAmount * 100, orderNumber);

      // Store razorpay order ID
      await db.updateOrderRazorpayId(orderId, razorpayOrder.id);

      return {
        orderId,
        orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount * 100, // in paise for Razorpay
        currency: "INR",
        razorpayKeyId: ENV.razorpayKeyId,
      };
    }),

    verifyPayment: protectedProcedure.input(z.object({
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string(),
    })).mutation(async ({ input }) => {
      // Verify signature
      const isValid = verifyPaymentSignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature,
      );

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment verification failed. Invalid signature.",
        });
      }

      // Find the order by razorpay order ID
      const order = await db.getOrderByRazorpayOrderId(input.razorpayOrderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      if (order.status !== "pending") {
        // Already processed — return order number (idempotent)
        return { orderNumber: order.orderNumber };
      }

      // Mark as processing with payment ID
      await db.updateOrderPayment(order.id, input.razorpayPaymentId, "processing");

      // Now reduce stock
      const items = await db.getOrderItems(order.id);
      const notificationItems: Array<{ productName: string; size: string; color?: string | null; quantity: number; unitPrice: number }> = [];
      for (const item of items) {
        const product = await db.getProductById(item.productId);
        if (product) {
          await db.updateProduct(item.productId, { stock: Math.max(0, product.stock - item.quantity) });
        }
        notificationItems.push({
          productName: item.productName,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }

      // Send email notification to admin asynchronously
      sendOrderNotificationEmail({
        orderNumber: order.orderNumber,
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
        shippingPhone: order.shippingPhone,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingZipCode: order.shippingZipCode,
        totalAmount: order.totalAmount,
        items: notificationItems,
      }).catch((err) => console.error("[Order] Email notification error:", err));

      return { orderNumber: order.orderNumber };
    }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const userOrders = await db.getOrdersByUserId(ctx.user.id);
      const ordersWithItems = await Promise.all(userOrders.map(async (o) => {
        const items = await db.getOrderItems(o.id);
        return { ...o, items };
      }));
      return ordersWithItems;
    }),

    byOrderNumber: protectedProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ ctx, input }) => {
      const order = await db.getOrderByOrderNumber(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this order" });
      }
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),

    /**
     * Check pincode delivery serviceability & estimated days via Delhivery Express
     */
    checkPincode: publicProcedure.input(z.object({ pincode: z.string() })).query(async ({ input }) => {
      return checkPincodeServiceability(input.pincode);
    }),

    /**
     * Query real-time Delhivery shipment tracking for an order
     */
    trackOrder: publicProcedure.input(z.object({
      orderNumber: z.string().optional(),
      waybill: z.string().optional(),
    })).query(async ({ input }) => {
      let waybillToTrack = input.waybill;
      if (!waybillToTrack && input.orderNumber) {
        const order = await db.getOrderByOrderNumber(input.orderNumber);
        waybillToTrack = order?.waybill || undefined;
      }

      if (!waybillToTrack) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No tracking waybill found for this order yet.",
        });
      }

      return trackDelhiveryPackage(waybillToTrack);
    }),
  }),

  // ==================== ADMIN PRODUCT ROUTES ====================
  adminProducts: router({
    list: adminProcedure.query(async () => {
      const allProducts = await db.getAllProducts();
      const imageMap = await db.getProductImagesByProductIds(allProducts.map(p => p.id));
      return allProducts.map(p => ({ ...p, images: imageMap.get(p.id) || [] }));
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
      sizes: z.array(z.string()).optional(),
      colors: z.array(z.object({
        name: z.string().min(1),
        hex: z.string().min(1),
      })).optional(),
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
        sizes: input.sizes && input.sizes.length > 0 ? input.sizes : ["XS", "S", "M", "L", "XL", "XXL"],
        colors: input.colors || [],
        active: true,
      });

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
      sizes: z.array(z.string()).optional(),
      colors: z.array(z.object({
        name: z.string().min(1),
        hex: z.string().min(1),
      })).optional(),
      active: z.boolean().optional(),
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
      status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      return { success: true };
    }),

    createDelhiveryShipment: adminProcedure.input(z.object({
      orderId: z.number(),
    })).mutation(async ({ input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const items = await db.getOrderItems(order.id);
      if (items.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Order has no line items" });
      }

      const shipmentResult = await createDelhiveryShipment({
        orderNumber: order.orderNumber,
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
        shippingPhone: order.shippingPhone,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingZipCode: order.shippingZipCode,
        totalAmount: order.totalAmount,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentType: "Prepaid",
      });

      if (!shipmentResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: shipmentResult.message || "Failed to create Delhivery shipment",
        });
      }

      // Update order in database with waybill and mark as shipped
      await db.updateOrderShipment(order.id, {
        waybill: shipmentResult.waybill,
        shippingCourier: shipmentResult.courier,
        shippingLabelUrl: shipmentResult.shippingLabelUrl,
        delhiveryStatus: shipmentResult.status,
        estimatedDeliveryDate: shipmentResult.estimatedDeliveryDate,
        status: "shipped",
      });

      return {
        success: true,
        waybill: shipmentResult.waybill,
        courier: shipmentResult.courier,
        shippingLabelUrl: shipmentResult.shippingLabelUrl,
        status: "shipped",
      };
    }),

    updateTracking: adminProcedure.input(z.object({
      orderId: z.number(),
      waybill: z.string().min(1),
      shippingCourier: z.string().optional(),
      delhiveryStatus: z.string().optional(),
      status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
    })).mutation(async ({ input }) => {
      await db.updateOrderShipment(input.orderId, {
        waybill: input.waybill,
        shippingCourier: input.shippingCourier || "Delhivery",
        delhiveryStatus: input.delhiveryStatus,
        status: input.status,
      });
      return { success: true };
    }),

    trackShipment: adminProcedure.input(z.object({
      waybill: z.string(),
    })).query(async ({ input }) => {
      return trackDelhiveryPackage(input.waybill);
    }),
  }),

  // ==================== ADMIN DASHBOARD ====================
  adminDashboard: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminDashboardStats();
    }),
  }),

  // ==================== COMMUNITY DESIGN ROUTES ====================
  community: router({
    activeRound: publicProcedure.query(async () => {
      const round = await db.getActiveDesignRound();
      if (!round) return null;
      const designs = await db.getDesignsByRoundId(round.id);
      const submitterNames = await db.getUserDesignSubmitterNames(designs.map(d => d.id));
      return {
        ...round,
        designs: designs.map(d => ({
          ...d,
          submitterName: submitterNames.get(d.id) ?? "Anonymous",
        })),
      };
    }),

    roundById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const round = await db.getDesignRoundById(input.id);
      if (!round) throw new TRPCError({ code: "NOT_FOUND", message: "Round not found" });
      const designs = await db.getDesignsByRoundId(round.id);
      const submitterNames = await db.getUserDesignSubmitterNames(designs.map(d => d.id));
      return {
        ...round,
        designs: designs.map(d => ({
          ...d,
          submitterName: submitterNames.get(d.id) ?? "Anonymous",
        })),
      };
    }),

    featuredWinners: publicProcedure.query(async () => {
      const winners = await db.getFeaturedWinners();
      const submitterNames = await db.getUserDesignSubmitterNames(winners.map(d => d.id));
      return winners.map(d => ({
        ...d,
        submitterName: submitterNames.get(d.id) ?? "Anonymous",
      }));
    }),

    submitDesign: protectedProcedure.input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      file: z.string(), // base64 encoded image
      filename: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const round = await db.getActiveDesignRound();
      if (!round) throw new TRPCError({ code: "BAD_REQUEST", message: "No active design round" });

      const fileBuffer = Buffer.from(input.file, "base64");
      const ext = input.filename.split(".").pop() || "png";
      const { key, url } = await communityStoragePut(
        `designs/${Date.now()}.${ext}`,
        fileBuffer,
        `image/${ext === "jpg" ? "jpeg" : ext}`
      );

      const designId = await db.createCommunityDesign({
        roundId: round.id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description || null,
        imageUrl: url,
        imageKey: key,
      });

      return { id: designId };
    }),

    likeDesign: protectedProcedure.input(z.object({
      designId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const added = await db.addDesignLike(input.designId, ctx.user.id);
      return { success: true, added };
    }),

    unlikeDesign: protectedProcedure.input(z.object({
      designId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const removed = await db.removeDesignLike(input.designId, ctx.user.id);
      return { success: true, removed };
    }),

    myLikes: protectedProcedure.input(z.object({
      roundId: z.number(),
    })).query(async ({ ctx, input }) => {
      return db.getUserLikesForRound(ctx.user.id, input.roundId);
    }),

    myDesigns: protectedProcedure.query(async ({ ctx }) => {
      return db.getDesignsByUserId(ctx.user.id);
    }),

    deleteMyDesign: protectedProcedure.input(z.object({
      designId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const design = await db.getCommunityDesignById(input.designId);
      if (!design) throw new TRPCError({ code: "NOT_FOUND", message: "Design not found" });
      if (design.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own designs" });
      }
      // Check round is still active
      const round = await db.getDesignRoundById(design.roundId);
      if (round && round.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete designs after the round has closed" });
      }
      await communityStorageDelete(design.imageKey);
      await db.deleteCommunityDesign(input.designId);
      return { success: true };
    }),

    allRounds: publicProcedure.query(async () => {
      return db.getAllDesignRounds();
    }),
  }),

  // ==================== ADMIN COMMUNITY ROUTES ====================
  adminCommunity: router({
    createRound: adminProcedure.input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      endsAt: z.string(), // ISO date string
    })).mutation(async ({ input }) => {
      const id = await db.createDesignRound({
        title: input.title,
        description: input.description || null,
        endsAt: new Date(input.endsAt),
        status: "active",
      });
      return { id };
    }),

    updateRound: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().max(1000).optional(),
      endsAt: z.string().optional(),
      status: z.enum(["active", "voting", "closed", "featured"]).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.endsAt) updateData.endsAt = new Date(data.endsAt);
      await db.updateDesignRound(id, updateData);
      return { success: true };
    }),

    closeRound: adminProcedure.input(z.object({
      roundId: z.number(),
      winnerDesignId: z.number().optional(),
    })).mutation(async ({ input }) => {
      await db.closeDesignRound(input.roundId, input.winnerDesignId);
      return { success: true };
    }),

    listRounds: adminProcedure.query(async () => {
      const rounds = await db.getAllDesignRounds();
      const roundsWithCounts = await Promise.all(rounds.map(async (r) => {
        const designs = await db.getDesignsByRoundId(r.id);
        return { ...r, designCount: designs.length };
      }));
      return roundsWithCounts;
    }),

    roundDesigns: adminProcedure.input(z.object({ roundId: z.number() })).query(async ({ input }) => {
      const designs = await db.getDesignsByRoundId(input.roundId);
      const submitterNames = await db.getUserDesignSubmitterNames(designs.map(d => d.id));
      return designs.map(d => ({
        ...d,
        submitterName: submitterNames.get(d.id) ?? "Anonymous",
      }));
    }),

    featureDesign: adminProcedure.input(z.object({
      designId: z.number(),
    })).mutation(async ({ input }) => {
      const design = await db.getCommunityDesignById(input.designId);
      if (!design) throw new TRPCError({ code: "NOT_FOUND", message: "Design not found" });
      // Toggle featured status
      const newStatus = !design.featured;
      const { getDb } = await import("./db");
      const dbConn = getDb();
      const { communityDesigns } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await dbConn.update(communityDesigns).set({ featured: newStatus }).where(eq(communityDesigns.id, input.designId));
      return { success: true, featured: newStatus };
    }),

    deleteDesign: adminProcedure.input(z.object({
      designId: z.number(),
    })).mutation(async ({ input }) => {
      const design = await db.getCommunityDesignById(input.designId);
      if (!design) throw new TRPCError({ code: "NOT_FOUND", message: "Design not found" });
      await communityStorageDelete(design.imageKey);
      await db.deleteCommunityDesign(input.designId);
      return { success: true };
    }),
  }),

  // ==================== SUGGESTION ROUTES ====================
  suggestions: router({
    list: publicProcedure.input(z.object({
      type: z.string().optional(),
      status: z.string().optional(),
      sortBy: z.enum(["upvotes", "newest"]).optional(),
    }).optional()).query(async ({ input }) => {
      const allSuggestions = await db.getAllSuggestions(input);
      const submitterNames = await db.getSuggestionSubmitterNames(allSuggestions.map(s => s.id));

      // Enrich fabric requests with product names
      const productIds = allSuggestions.filter(s => s.productId).map(s => s.productId!);
      const productNames = new Map<number, string>();
      for (const pid of productIds) {
        const product = await db.getProductById(pid);
        if (product) productNames.set(pid, product.name);
      }

      return allSuggestions.map(s => ({
        ...s,
        submitterName: submitterNames.get(s.id) ?? "Anonymous",
        productName: s.productId ? (productNames.get(s.productId) ?? null) : null,
      }));
    }),

    submit: protectedProcedure.input(z.object({
      type: z.enum(["new_design", "different_fabric", "other"]),
      title: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
      productId: z.number().optional(),
      fabricOrMaterial: z.string().max(255).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createSuggestion({
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        description: input.description || null,
        productId: input.productId ?? null,
        fabricOrMaterial: input.fabricOrMaterial || null,
      });
      return { id };
    }),

    upvote: protectedProcedure.input(z.object({
      suggestionId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const added = await db.addSuggestionUpvote(input.suggestionId, ctx.user.id);
      return { success: true, added };
    }),

    removeUpvote: protectedProcedure.input(z.object({
      suggestionId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const removed = await db.removeSuggestionUpvote(input.suggestionId, ctx.user.id);
      return { success: true, removed };
    }),

    myUpvotes: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserUpvotesForSuggestions(ctx.user.id);
    }),

    mySubmissions: protectedProcedure.query(async ({ ctx }) => {
      return db.getSuggestionsByUserId(ctx.user.id);
    }),

    delete: protectedProcedure.input(z.object({
      suggestionId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const suggestion = await db.getSuggestionById(input.suggestionId);
      if (!suggestion) throw new TRPCError({ code: "NOT_FOUND", message: "Suggestion not found" });
      if (suggestion.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own suggestions" });
      }
      await db.deleteSuggestion(input.suggestionId);
      return { success: true };
    }),
  }),

  // ==================== ADMIN SUGGESTION ROUTES ====================
  adminSuggestions: router({
    list: adminProcedure.input(z.object({
      type: z.string().optional(),
      status: z.string().optional(),
      sortBy: z.enum(["upvotes", "newest"]).optional(),
    }).optional()).query(async ({ input }) => {
      const allSuggestions = await db.getAllSuggestions(input);
      const submitterNames = await db.getSuggestionSubmitterNames(allSuggestions.map(s => s.id));

      const productIds = allSuggestions.filter(s => s.productId).map(s => s.productId!);
      const productNames = new Map<number, string>();
      for (const pid of productIds) {
        const product = await db.getProductById(pid);
        if (product) productNames.set(pid, product.name);
      }

      return allSuggestions.map(s => ({
        ...s,
        submitterName: submitterNames.get(s.id) ?? "Anonymous",
        productName: s.productId ? (productNames.get(s.productId) ?? null) : null,
      }));
    }),

    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["open", "reviewed", "planned", "done"]),
    })).mutation(async ({ input }) => {
      await db.updateSuggestionStatus(input.id, input.status);
      return { success: true };
    }),

    addNote: adminProcedure.input(z.object({
      id: z.number(),
      note: z.string().max(2000),
    })).mutation(async ({ input }) => {
      await db.addSuggestionAdminNote(input.id, input.note);
      return { success: true };
    }),

    delete: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteSuggestion(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
