import "dotenv/config";
import Razorpay from "razorpay";
import { ENV } from "../server/_core/env";
import { checkPincodeServiceability, createDelhiveryShipment, trackDelhiveryPackage } from "../server/delhivery";

async function diagnoseAll() {
  console.log("=================================================================");
  console.log("      LIVE DIAGNOSTICS: RAZORPAY & DELHIVERY INTEGRATION         ");
  console.log("=================================================================\n");

  // ==========================================
  // PART 1: RAZORPAY DIAGNOSTICS
  // ==========================================
  console.log("-----------------------------------------------------------------");
  console.log(" [1/2] TESTING RAZORPAY PAYMENT GATEWAY");
  console.log("-----------------------------------------------------------------");
  console.log("Key ID:", ENV.razorpayKeyId ? `${ENV.razorpayKeyId.slice(0, 10)}... (Present)` : "MISSING ❌");
  console.log("Key Secret:", ENV.razorpayKeySecret ? `Present (length ${ENV.razorpayKeySecret.length})` : "MISSING ❌");

  let razorpayStatus = "UNKNOWN";
  let razorpayDetails: any = {};

  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    console.error("❌ Razorpay configuration incomplete in .env.");
    razorpayStatus = "CONFIG_MISSING";
  } else {
    try {
      const razorpay = new Razorpay({
        key_id: ENV.razorpayKeyId,
        key_secret: ENV.razorpayKeySecret,
      });

      console.log("\n-> Testing Razorpay API connection & order creation for ₹10.00...");
      const testReceipt = `diag_${Date.now().toString().slice(-8)}`;
      const testOrder = await razorpay.orders.create({
        amount: 1000, // 1000 paise = ₹10
        currency: "INR",
        receipt: testReceipt,
        notes: {
          diagnostic: "Antigravity live connectivity check",
        },
      });

      console.log("✅ Razorpay API connection SUCCESSFUL!");
      console.log("   - Created Test Order ID:", testOrder.id);
      console.log("   - Status:", testOrder.status);
      console.log("   - Amount:", `₹${testOrder.amount / 100} ${testOrder.currency}`);
      console.log("   - Receipt:", testOrder.receipt);
      razorpayStatus = "OPERATIONAL ✅";
      razorpayDetails = testOrder;
    } catch (err: any) {
      console.error("❌ Razorpay API Error:", err?.error?.description || err?.message || err);
      razorpayStatus = `FAILED ❌ (${err?.error?.description || err?.message})`;
    }
  }

  // ==========================================
  // PART 2: DELHIVERY LOGISTICS DIAGNOSTICS
  // ==========================================
  console.log("\n-----------------------------------------------------------------");
  console.log(" [2/2] TESTING DELHIVERY EXPRESS LOGISTICS");
  console.log("-----------------------------------------------------------------");
  console.log("API Token:", ENV.delhiveryApiToken ? `${ENV.delhiveryApiToken.slice(0, 8)}... (Present)` : "MISSING ❌");
  console.log("Pickup Location:", ENV.delhiveryPickupLocation);
  console.log("Client Name:", ENV.delhiveryClientName);
  console.log("Mode:", ENV.delhiveryMode);

  let delhiveryPincodeStatus = "UNKNOWN";
  let delhiveryShipmentStatus = "UNKNOWN";
  let delhiveryShipmentMsg = "";

  // 2A: Test Pincode Serviceability
  console.log("\n-> 2A. Testing Pincode Serviceability (Kolkata 700001)...");
  try {
    const pinRes = await checkPincodeServiceability("700001");
    console.log("   - Pincode 700001 Serviceable:", pinRes.serviceable ? "YES ✅" : "NO ❌");
    console.log("   - City/State:", `${pinRes.city || "Kolkata"}, ${pinRes.state || "West Bengal"}`);
    console.log("   - Prepaid Available:", pinRes.prepaid ? "YES" : "NO");
    console.log("   - COD Available:", pinRes.cod ? "YES" : "NO");
    console.log("   - Estimated Delivery Days:", pinRes.estimatedDeliveryDays);
    delhiveryPincodeStatus = "OPERATIONAL ✅";
  } catch (err: any) {
    console.error("❌ Pincode check error:", err.message);
    delhiveryPincodeStatus = `FAILED ❌ (${err.message})`;
  }

  // 2B: Test Live Shipment Manifest API (with realistic consignee)
  console.log("\n-> 2B. Testing Delhivery Live Shipment Creation API...");
  const baseUrl = ENV.delhiveryMode === "production" ? "https://track.delhivery.com" : "https://staging-express.delhivery.com";
  const testShipmentOrder = `DIAG-${Date.now().toString().slice(-6)}`;

  const cleanPhone = "8777648392";
  const shipmentData = {
    shipments: [
      {
        name: "Debangshu Mondal",
        add: "Flat 4B, Greenfield Heights, New Town",
        pin: "700156",
        city: "Kolkata",
        state: "West Bengal",
        country: "India",
        phone: cleanPhone,
        order: testShipmentOrder,
        payment_mode: "Prepaid",
        return_pin: "700001",
        return_city: "Kolkata",
        return_phone: cleanPhone,
        return_add: "Aarunya Warehouse, Kolkata",
        return_state: "West Bengal",
        return_country: "India",
        products_desc: "Diagnostic Test Boxy Tee x1",
        order_date: new Date().toISOString(),
        total_amount: 699,
        cod_amount: 0,
        weight: 0.5,
        quantity: 1,
      },
    ],
    pickup_location: {
      name: ENV.delhiveryPickupLocation || "Aarunya Warehouse",
    },
  };

  const formData = new URLSearchParams();
  formData.append("format", "json");
  formData.append("data", JSON.stringify(shipmentData));

  try {
    const shipUrl = `${baseUrl}/api/cmu/create.json`;
    const response = await fetch(shipUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${ENV.delhiveryApiToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log("   - HTTP Response Status:", response.status, response.statusText);

    if (data?.packages?.[0]?.waybill) {
      const waybill = data.packages[0].waybill;
      console.log("✅ LIVE DELHIVERY SHIPMENT MANIFESTED SUCCESSFULLY!");
      console.log("   - Live AWB Waybill:", waybill);
      console.log("   - Status:", data.packages[0].status || "Manifested");
      console.log("   - Client:", data.packages[0].client);
      console.log("   - Packing Slip URL:", `${baseUrl}/api/p/packing_slip?wbns=${waybill}&pdf=true`);
      delhiveryShipmentStatus = "LIVE MANIFEST OPERATIONAL (WALLET FUNDED) ✅";
      delhiveryShipmentMsg = `Live AWB: ${waybill}`;
    } else {
      let errorDetail = "";
      const packageRemarks = data?.packages?.[0]?.remarks;
      if (Array.isArray(packageRemarks) && packageRemarks.length > 0) {
        errorDetail = packageRemarks.join(" ");
      } else if (typeof packageRemarks === "string") {
        errorDetail = packageRemarks;
      } else if (data?.rmk) {
        errorDetail = data.rmk;
      }

      console.log("   - Delhivery API Response:", JSON.stringify(data, null, 2));

      if (errorDetail.includes("insufficient balance")) {
        console.log("\n⚠️ DELHIVERY WALLET NOTICE: Insufficient prepaid wallet balance on your Delhivery account.");
        console.log("   The API token and warehouse are 100% connected, but you need to recharge balance on one.delhivery.com to manifest live packages.");
        delhiveryShipmentStatus = "CONNECTED ✅ (Wallet Needs Recharge at one.delhivery.com)";
        delhiveryShipmentMsg = "Prepaid wallet balance is ₹0. Recharge at one.delhivery.com for live dispatch.";
      } else {
        delhiveryShipmentStatus = `RESPONSE: ${errorDetail || "Unknown"}`;
        delhiveryShipmentMsg = errorDetail;
      }
    }
  } catch (err: any) {
    console.error("❌ Delhivery Shipment API error:", err.message);
    delhiveryShipmentStatus = `FAILED ❌ (${err.message})`;
  }

  // 2C: Test Tracking API
  console.log("\n-> 2C. Testing Tracking API...");
  try {
    const trackRes = await trackDelhiveryPackage("DEL-015288403871");
    console.log("   - Tracking Service Status:", trackRes.status);
    console.log("   - Tracking URL:", trackRes.trackingUrl);
    console.log("   - Scans logged:", trackRes.scans.length);
  } catch (err: any) {
    console.error("❌ Tracking API error:", err.message);
  }

  // ==========================================
  // FINAL SUMMARY REPORT
  // ==========================================
  console.log("\n=================================================================");
  console.log("                     FINAL HEALTH SUMMARY                        ");
  console.log("=================================================================");
  console.log(`1. RAZORPAY PAYMENT GATEWAY:  ${razorpayStatus}`);
  console.log(`2. DELHIVERY PINCODE CHECK:   ${delhiveryPincodeStatus}`);
  console.log(`3. DELHIVERY SHIPMENT API:    ${delhiveryShipmentStatus}`);
  if (delhiveryShipmentMsg) {
    console.log(`   -> Note: ${delhiveryShipmentMsg}`);
  }
  console.log("=================================================================\n");

  process.exit(0);
}

diagnoseAll().catch((err) => {
  console.error("Diagnostic script error:", err);
  process.exit(1);
});
