import "dotenv/config";
import { ENV } from "../server/_core/env";

console.log("ENV Check:");
console.log("RAZORPAY_KEY_ID:", ENV.razorpayKeyId ? `${ENV.razorpayKeyId.slice(0, 8)}...` : "(EMPTY)");
console.log("RAZORPAY_KEY_SECRET:", ENV.razorpayKeySecret ? "SET (length " + ENV.razorpayKeySecret.length + ")" : "(EMPTY)");
console.log("DELHIVERY_API_TOKEN:", ENV.delhiveryApiToken ? "SET (length " + ENV.delhiveryApiToken.length + ", prefix " + ENV.delhiveryApiToken.slice(0, 4) + "...)" : "(EMPTY)");
console.log("DELHIVERY_PICKUP_LOCATION:", ENV.delhiveryPickupLocation);
console.log("DELHIVERY_CLIENT_NAME:", ENV.delhiveryClientName);
console.log("DELHIVERY_MODE:", ENV.delhiveryMode);
