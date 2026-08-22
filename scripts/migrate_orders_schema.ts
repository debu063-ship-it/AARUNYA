import "dotenv/config";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false });

  try {
    console.log("Applying missing database columns and enums...");

    // Ensure order_status enum has 'cancelled'
    try {
      await sql`ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'cancelled';`;
      console.log("✓ order_status enum updated with 'cancelled'");
    } catch (e: any) {
      console.log("Note on order_status enum:", e.message);
    }

    // Ensure products columns
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes json DEFAULT '["XS","S","M","L","XL","XXL"]'::json;`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors json DEFAULT '[]'::json;`;
    console.log("✓ products table columns ensured");

    // Ensure order_items columns
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color varchar(64);`;
    console.log("✓ order_items table columns ensured");

    // Ensure orders columns
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id varchar(255);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id varchar(255);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier varchar(64) DEFAULT 'Delhivery';`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill varchar(64);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url varchar(512);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delhivery_status varchar(128);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamp with time zone;`;
    console.log("✓ orders table columns ensured (shipping_courier, waybill, shipping_label_url, delhivery_status, estimated_delivery_date, razorpay_order_id, razorpay_payment_id)");

    // Verify columns in orders table
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position;
    `;
    console.log("Updated orders table columns:", cols.map((c: any) => c.column_name));

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
