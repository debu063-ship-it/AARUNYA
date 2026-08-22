import Razorpay from "razorpay";
import crypto from "crypto";
import { ENV } from "./_core/env";

let _razorpay: InstanceType<typeof Razorpay> | null = null;

function getRazorpay() {
  if (!_razorpay) {
    if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
    }
    _razorpay = new Razorpay({
      key_id: ENV.razorpayKeyId,
      key_secret: ENV.razorpayKeySecret,
    });
  }
  return _razorpay;
}

/**
 * Create a Razorpay order for the given amount (in paise).
 */
export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
  });
  return order;
}

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * Returns true if the signature is valid.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", ENV.razorpayKeySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === razorpaySignature;
}
