import "dotenv/config";
import { ENV } from "../server/_core/env";

async function main() {
  const baseUrl = "https://track.delhivery.com";
  const token = ENV.delhiveryApiToken;
  const pickupLocation = "Aarunya Warehouse";

  console.log("Testing shipment creation with realistic customer info...");

  const testInput = {
    orderNumber: `ARU-${Date.now().toString().slice(-6)}`,
    shippingName: "Debangshu Mondal",
    shippingEmail: "debangshumondal7@gmail.com",
    shippingPhone: "8777648392", // realistic 10-digit mobile
    shippingAddress: "Flat 4B, Greenfield Heights, Action Area 1, New Town",
    shippingCity: "Kolkata",
    shippingState: "West Bengal",
    shippingZipCode: "700156",
    totalAmount: 799,
    items: [
      {
        productName: "Aarunya Core Boxy Tee",
        quantity: 1,
        unitPrice: 799,
      },
    ],
    paymentType: "Prepaid" as const,
  };

  const productsDesc = testInput.items.map((i) => `${i.productName} x${i.quantity}`).join(", ");
  const shipmentData = {
    shipments: [
      {
        name: testInput.shippingName,
        add: testInput.shippingAddress,
        pin: testInput.shippingZipCode,
        city: testInput.shippingCity,
        state: testInput.shippingState,
        country: "India",
        phone: testInput.shippingPhone,
        order: testInput.orderNumber,
        payment_mode: testInput.paymentType || "Prepaid",
        return_pin: "700001",
        return_city: "Kolkata",
        return_phone: "8777648392",
        return_add: "Aarunya Warehouse, Kolkata, West Bengal",
        return_state: "West Bengal",
        return_country: "India",
        products_desc: productsDesc,
        order_date: new Date().toISOString(),
        total_amount: testInput.totalAmount,
        cod_amount: 0,
        weight: 0.5,
        quantity: 1,
      },
    ],
    pickup_location: {
      name: pickupLocation,
    },
  };

  const formData = new URLSearchParams();
  formData.append("format", "json");
  formData.append("data", JSON.stringify(shipmentData));

  try {
    const shipUrl = `${baseUrl}/api/cmu/create.json`;
    console.log("Posting to:", shipUrl);

    const response = await fetch(shipUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log("Shipment Response Status:", response.status, response.statusText);
    const resData = await response.json();
    console.log("Shipment JSON Response:", JSON.stringify(resData, null, 2));
  } catch (err: any) {
    console.error("Shipment creation error:", err);
  }
}

main();
