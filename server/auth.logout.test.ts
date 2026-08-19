import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    authId: "test-supabase-auth-uuid",
    email: "admin@slaypop.com",
    name: "Admin User",
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("auth router", () => {
  it("auth.me returns null when unauthenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user when authenticated", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("admin@slaypop.com");
    expect(result?.role).toBe("user");
  });

  it("auth.logout reports success", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("procedure protection", () => {
  it("unauthenticated user cannot create order", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.create({
        items: [{ productId: 1, size: "M", quantity: 1 }],
        shippingName: "John",
        shippingEmail: "john@example.com",
        shippingPhone: "1234567890",
        shippingAddress: "123 St",
        shippingCity: "Kolkata",
        shippingState: "WB",
        shippingZipCode: "700001",
      })
    ).rejects.toThrow();
  });

  it("non-admin user cannot access admin dashboard stats", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.adminDashboard.stats()).rejects.toThrow();
  });

  it("non-admin user cannot list admin orders", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.adminOrders.list()).rejects.toThrow();
  });
});
