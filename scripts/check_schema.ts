import "dotenv/config";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = postgres(connectionString, { prepare: false });
  try {
    console.log("Fetching existing tables and columns...");
    const columns = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    
    const tables: Record<string, string[]> = {};
    for (const row of columns) {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row.column_name);
    }
    
    console.log("=== Existing Database Schema ===");
    for (const [table, cols] of Object.entries(tables)) {
      console.log(`Table '${table}':`, cols.join(", "));
    }

    const enums = await sql`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public';
    `;
    console.log("=== Existing Enums ===");
    console.log(enums);
  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await sql.end();
  }
}

main();
