import "dotenv/config";
import { getAllOrders, getOrderItems } from "../server/db";

async function main() {
  try {
    const orders = await getAllOrders();
    console.log(`Found ${orders.length} total orders:`);
    for (const o of orders) {
      const items = await getOrderItems(o.id);
      console.log({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        razorpayOrderId: o.razorpayOrderId,
        razorpayPaymentId: o.razorpayPaymentId,
        waybill: o.waybill,
        delhiveryStatus: o.delhiveryStatus,
        shippingName: o.shippingName,
        createdAt: o.createdAt,
        itemsCount: items.length
      });
    }
    process.exit(0);
  } catch (err) {
    console.error("Error inspecting orders:", err);
    process.exit(1);
  }
}

main();
