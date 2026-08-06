import { describe, it, expect } from "vitest";
import { sendOrderNotificationEmail } from "./email";

describe("Order Email Notification Service", () => {
  it("should format and process order notification without throwing", async () => {
    const mockOrder = {
      orderNumber: "TEST-ORD-9999",
      shippingName: "John Doe",
      shippingEmail: "john@example.com",
      shippingPhone: "+91 9876543210",
      shippingAddress: "123 Park Street",
      shippingCity: "Kolkata",
      shippingState: "West Bengal",
      shippingZipCode: "700016",
      totalAmount: 3499,
      items: [
        {
          productName: "Oversized Cyberpunk Hoodie",
          size: "L",
          quantity: 1,
          unitPrice: 2499,
        },
        {
          productName: "Acid Wash Graphic Tee",
          size: "M",
          quantity: 1,
          unitPrice: 1000,
        },
      ],
    };

    // Should complete without throwing — logs to console when SMTP is not configured
    const result = await sendOrderNotificationEmail(mockOrder);
    expect(typeof result).toBe("boolean");
  });
});
