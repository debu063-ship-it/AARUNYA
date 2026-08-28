import "dotenv/config";
import { ENV } from "../server/_core/env";

async function main() {
  const baseUrl = "https://track.delhivery.com";
  const token = ENV.delhiveryApiToken;

  console.log("Testing Delhivery clientwarehouse creation...");

  // Standard Delhivery Warehouse registration payload
  const whPayload = {
    name: "Aarunya Warehouse",
    email: "debangshumondal7@gmail.com",
    phone: "9876543210",
    address: "Kolkata, West Bengal",
    city: "Kolkata",
    country: "India",
    pin: "700001",
    return_address: "Kolkata, West Bengal",
    return_city: "Kolkata",
    return_state: "West Bengal",
    return_country: "India",
    return_pin: "700001",
    return_phone: "9876543210",
  };

  try {
    const res = await fetch(`${baseUrl}/api/backend/clientwarehouse/create/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(whPayload),
    });

    console.log("Status:", res.status, res.statusText);
    const data = await res.json();
    console.log("Response JSON:", data);
  } catch (err: any) {
    console.error("Error:", err);
  }
}

main();
