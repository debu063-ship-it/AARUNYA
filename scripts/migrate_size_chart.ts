import dotenv from "dotenv";
dotenv.config();
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  const sql = postgres(url, { prepare: false });

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_url text;`;
    console.log("✓ Successfully added size_chart_url column to products table!");

    // Verify
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'size_chart_url';
    `;
    console.log("Column verification:", cols);
  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await sql.end();
  }
}

main();
