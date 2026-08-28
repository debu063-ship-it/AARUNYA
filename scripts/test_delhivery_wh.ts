import "dotenv/config";
import { ENV } from "../server/_core/env";

async function main() {
  const baseUrl = "https://track.delhivery.com";
  const token = ENV.delhiveryApiToken;

  // Let's test different methods or endpoints for warehouse
  console.log("Testing Delhivery Client Warehouse endpoints...");
  
  // 1. Fetch user profile / client details if available
  const endpoints = [
    { url: `${baseUrl}/api/backend/clientwarehouse/create/`, method: "OPTIONS" },
    { url: `${baseUrl}/api/v1/user/get/`, method: "GET" },
    { url: `${baseUrl}/api/v1/client/info/`, method: "GET" },
    { url: `${baseUrl}/c/api/client/details/`, method: "GET" },
    { url: `${baseUrl}/api/backend/clientwarehouse/create/`, method: "POST", body: {} }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      console.log(`Endpoint ${ep.method} ${ep.url} -> Status: ${res.status}`);
      const text = await res.text();
      console.log("Response:", text.slice(0, 400));
    } catch (e: any) {
      console.log(`Endpoint ${ep.url} error:`, e.message);
    }
  }
}

main();
