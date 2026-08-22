import "dotenv/config";
import Razorpay from "razorpay";

async function main() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  console.log("Razorpay Key ID:", key_id ? `${key_id.substring(0, 8)}...` : "NOT SET");
  console.log("Razorpay Key Secret:", key_secret ? "SET" : "NOT SET");

  if (!key_id || !key_secret) {
    console.error("Razorpay keys missing");
    return;
  }

  const razorpay = new Razorpay({
    key_id,
    key_secret,
  });

  try {
    console.log("Testing Razorpay order creation for ₹100 (10000 paise)...");
    const order = await razorpay.orders.create({
      amount: 10000,
      currency: "INR",
      receipt: "TEST-ORDER-1",
    });
    console.log("Razorpay order creation succeeded! Order details:", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
  }
}

main();
