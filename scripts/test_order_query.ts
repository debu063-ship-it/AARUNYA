import "dotenv/config";
import { getOrderByOrderNumber, generateOrderNumber } from "../server/db";

async function main() {
  try {
    console.log("Testing generateOrderNumber...");
    const orderNumber = await generateOrderNumber();
    console.log("Generated order number:", orderNumber);

    console.log("Testing getOrderByOrderNumber for 'ARU-IBZMCVB8'...");
    const result = await getOrderByOrderNumber("ARU-IBZMCVB8");
    console.log("Query result for ARU-IBZMCVB8:", result);

    console.log("All DB queries for orders succeeded without any SQL errors!");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

main();
