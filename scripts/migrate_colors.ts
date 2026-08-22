import "dotenv/config";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = postgres(connectionString);
  try {
    console.log("Checking and applying columns...");
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors json DEFAULT '[]'::json;`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color varchar(64);`;
    console.log("Migration successful: added colors to products and color to order_items.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
