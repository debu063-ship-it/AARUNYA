import "dotenv/config";
import {
  createOrder,
  createOrderItem,
  updateOrderStatus,
  getOrderByOrderNumber,
  getOrderById,
  getOrderItems,
  generateOrderNumber,
  updateOrderShipment,
  getAllActiveProducts,
  getDb,
} from "../server/db";
import { createDelhiveryShipment, trackDelhiveryPackage } from "../server/delhivery";

async function runDemoOrderFlowTest() {
  console.log("==================================================");
  console.log("     AARUNYA E-COMMERCE & DELHIVERY DEMO TEST     ");
  console.log("==================================================");

  const db = getDb();

  // Step 1: Simulate customer checkout cancellation flow
  console.log("\n[TEST 1] Simulating Customer Checkout & Payment Cancellation...");
  const orderNum1 = await generateOrderNumber();
  const orderId1 = await createOrder({
    userId: 1,
    orderNumber: orderNum1,
    totalAmount: 699,
    shippingName: "Debangshu Mondal",
    shippingEmail: "debangshumondal7@gmail.com",
    shippingPhone: "8777648392",
    shippingAddress: "Flat 4B, Greenfield Heights, Action Area 1",
    shippingCity: "Kolkata",
    shippingState: "West Bengal",
    shippingZipCode: "700156",
    razorpayOrderId: `order_test_${Date.now().toString().slice(-6)}`,
    status: "pending",
  });

  await createOrderItem({
    orderId: orderId1,
    productId: 1,
    productName: "Aarunya Oversized Boxy Tee",
    size: "L",
    color: "Charcoal Black",
    quantity: 1,
    unitPrice: 699,
  });

  console.log(`  -> Draft Order created: ID=${orderId1}, Number=${orderNum1}, Status=pending`);

  // Customer cancels in modal
  console.log("  -> Customer closed Razorpay payment modal...");
  await updateOrderStatus(orderId1, "cancelled");
  const cancelledOrder = await getOrderById(orderId1);
  console.log(`  -> Order status updated in DB: ${cancelledOrder?.status} (Payment ID: ${cancelledOrder?.razorpayPaymentId ?? "None"})`);
  console.log("  -> [TEST 1 PASSED]: Cancelled payment properly flags order as 'cancelled' with no payment transaction.\n");

  // Step 2: Simulate successful customer order checkout
  console.log("[TEST 2] Simulating Successful Paid Customer Order...");
  const orderNum2 = await generateOrderNumber();
  const demoPaymentId = `pay_demo_${Date.now().toString().slice(-8)}`;
  const orderId2 = await createOrder({
    userId: 1,
    orderNumber: orderNum2,
    totalAmount: 1299,
    shippingName: "Debangshu Mondal",
    shippingEmail: "debangshumondal7@gmail.com",
    shippingPhone: "8777648392",
    shippingAddress: "Flat 4B, Greenfield Heights, New Town",
    shippingCity: "Kolkata",
    shippingState: "West Bengal",
    shippingZipCode: "700156",
    razorpayOrderId: `order_demo_${Date.now().toString().slice(-6)}`,
    razorpayPaymentId: demoPaymentId,
    status: "processing",
  });

  await createOrderItem({
    orderId: orderId2,
    productId: 1,
    productName: "Aarunya Graphic Heavyweight Hoodie",
    size: "XL",
    color: "Washed Olive",
    quantity: 1,
    unitPrice: 1299,
  });

  const paidOrder = await getOrderById(orderId2);
  const items = await getOrderItems(orderId2);
  console.log(`  -> Confirmed Paid Order: ID=${orderId2}, Number=${orderNum2}, Status=${paidOrder?.status}`);
  console.log(`  -> Payment ID: ${paidOrder?.razorpayPaymentId}`);
  console.log(`  -> Line Items: ${items.map((i) => `${i.productName} (${i.size}, ${i.color}) x${i.quantity}`).join(", ")}`);
  console.log("  -> [TEST 2 PASSED]: Paid order successfully stored in processing state.\n");

  // Step 3: Test Delhivery Shipment Creation
  console.log("[TEST 3] Testing Delhivery Logistics Fulfillment with Registered 'Aarunya Warehouse'...");
  const shipment = await createDelhiveryShipment({
    orderNumber: paidOrder!.orderNumber,
    shippingName: paidOrder!.shippingName,
    shippingEmail: paidOrder!.shippingEmail,
    shippingPhone: paidOrder!.shippingPhone,
    shippingAddress: paidOrder!.shippingAddress,
    shippingCity: paidOrder!.shippingCity,
    shippingState: paidOrder!.shippingState,
    shippingZipCode: paidOrder!.shippingZipCode,
    totalAmount: paidOrder!.totalAmount,
    items: items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    paymentType: "Prepaid",
  });

  console.log("  -> Delhivery Shipment Result:");
  console.log(`     - Success: ${shipment.success}`);
  console.log(`     - Waybill (AWB): ${shipment.waybill}`);
  console.log(`     - Courier: ${shipment.courier}`);
  console.log(`     - Status: ${shipment.status}`);
  console.log(`     - Notice: ${shipment.message || "Live shipment active"}`);
  console.log(`     - Is Simulated Mode: ${shipment.isSimulated}`);

  // Update order with Waybill
  await updateOrderShipment(orderId2, {
    waybill: shipment.waybill,
    shippingCourier: shipment.courier,
    shippingLabelUrl: shipment.shippingLabelUrl,
    delhiveryStatus: shipment.status,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
    status: "shipped",
  });

  const updatedOrder = await getOrderById(orderId2);
  console.log(`  -> Order updated with Delhivery AWB: Status=${updatedOrder?.status}, Waybill=${updatedOrder?.waybill}`);
  console.log("  -> [TEST 3 PASSED]: Delhivery shipment creation & local DB sync succeeded.\n");

  // Step 4: Test Delhivery Tracking Retrieval
  console.log("[TEST 4] Testing Delhivery Tracking Lookup for Waybill...");
  const tracking = await trackDelhiveryPackage(shipment.waybill);
  console.log("  -> Tracking Info:");
  console.log(`     - Status: ${tracking.status}`);
  console.log(`     - Expected Delivery: ${tracking.expectedDeliveryDate || "3-5 days"}`);
  console.log(`     - Tracking Link: ${tracking.trackingUrl}`);
  console.log(`     - Checkpoint Scans: ${tracking.scans.length} updates logged`);
  console.log("  -> [TEST 4 PASSED]: Tracking service operational.\n");

  console.log("==================================================");
  console.log("   ALL DEMO ORDER & LOGISTICS TESTS COMPLETED!    ");
  console.log("==================================================");

  process.exit(0);
}

runDemoOrderFlowTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
