import { describe, it, expect } from "vitest";
import { sendOrderNotificationEmail, sendContactFormEmail } from "./email";

describe("Email Notification Service", () => {
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

    const result = await sendOrderNotificationEmail(mockOrder);
    expect(typeof result).toBe("boolean");
  });

  it("should format and process contact form email without throwing", async () => {
    const mockContact = {
      name: "Jane Smith",
      email: "jane@example.com",
      orderNumber: "ORD-12345",
      subject: "Size exchange query",
      message: "Can I exchange for a size L?",
    };

    const result = await sendContactFormEmail(mockContact);
    expect(typeof result).toBe("boolean");
  });
});
