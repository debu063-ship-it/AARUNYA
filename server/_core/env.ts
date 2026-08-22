export const ENV = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "debangshumondal7@gmail.com",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  delhiveryApiToken: process.env.DELHIVERY_API_TOKEN ?? "",
  delhiveryPickupLocation: process.env.DELHIVERY_PICKUP_LOCATION ?? "Primary Warehouse",
  delhiveryClientName: process.env.DELHIVERY_CLIENT_NAME ?? "Aarunya",
  delhiveryMode: (process.env.DELHIVERY_MODE ?? "staging") as "staging" | "production",
  isProduction: process.env.NODE_ENV === "production",
};
