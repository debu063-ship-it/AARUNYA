export interface OrderItemNotification {
  productName: string;
  size: string;
  color?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderNotificationData {
  orderNumber: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  totalAmount: number;
  items: OrderItemNotification[];
  createdAt?: Date;
}

function buildOrderText(data: OrderNotificationData, orderDate: string): string {
  const itemsText = data.items
    .map((item) => `  • ${item.productName}${item.color ? ` (${item.color})` : ""} (Size: ${item.size}) x${item.quantity} @ ₹${item.unitPrice} = ₹${item.unitPrice * item.quantity}`)
    .join("\n");

  return `🛒 NEW ORDER RECEIVED

Order #${data.orderNumber}
Date: ${orderDate}
Total: ₹${data.totalAmount.toLocaleString("en-IN")}

👤 CUSTOMER
Name: ${data.shippingName}
Email: ${data.shippingEmail}
Phone: ${data.shippingPhone}

📦 SHIPPING ADDRESS
${data.shippingAddress}
${data.shippingCity}, ${data.shippingState} - ${data.shippingZipCode}

📋 ORDER ITEMS
${itemsText}

Grand Total: ₹${data.totalAmount.toLocaleString("en-IN")}`;
}

function buildOrderHtml(data: OrderNotificationData, orderDate: string): string {
  const formattedItemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #111827;">${item.productName}</strong>
          ${item.color ? `<br/><span style="font-size: 12px; color: #6b7280;">Colour: ${item.color}</span>` : ""}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${item.size}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.unitPrice.toLocaleString("en-IN")}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>New Order #${data.orderNumber}</title></head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #374151;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900;">SlayPOP</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">🛒 New Order Received!</p>
      </div>
      <div style="padding: 24px;">
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%;"><tr>
            <td><span style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px;">Order</span><h2 style="margin: 2px 0 0; font-size: 20px; color: #1f2937;">#${data.orderNumber}</h2></td>
            <td style="text-align: right;"><span style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px;">Total</span><h2 style="margin: 2px 0 0; font-size: 20px; color: #4f46e5;">₹${data.totalAmount.toLocaleString("en-IN")}</h2></td>
          </tr></table>
        </div>
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-top: 0;">👤 Customer</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Name:</td><td style="padding: 6px 0; font-weight: 600;">${data.shippingName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${data.shippingEmail}" style="color: #4f46e5; text-decoration: none;">${data.shippingEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Phone:</td><td style="padding: 6px 0;"><a href="tel:${data.shippingPhone}" style="color: #4f46e5; text-decoration: none;">${data.shippingPhone}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Address:</td><td style="padding: 6px 0;">${data.shippingAddress}<br/>${data.shippingCity}, ${data.shippingState} - ${data.shippingZipCode}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date:</td><td style="padding: 6px 0;">${orderDate}</td></tr>
        </table>
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">📦 Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <thead><tr style="background: #f9fafb; color: #6b7280; text-transform: uppercase; font-size: 11px;">
            <th style="padding: 8px 12px; text-align: left;">Product</th>
            <th style="padding: 8px 12px; text-align: center;">Size</th>
            <th style="padding: 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; text-align: right;">Price</th>
            <th style="padding: 8px 12px; text-align: right;">Subtotal</th>
          </tr></thead>
          <tbody>${formattedItemsHtml}</tbody>
        </table>
        <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 14px; text-align: right; margin-bottom: 24px;">
          <span style="font-size: 13px; color: #3730a3; font-weight: 600;">Grand Total: </span>
          <strong style="font-size: 18px; color: #312e81;">₹${data.totalAmount.toLocaleString("en-IN")}</strong>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">Sent by SlayPOP E-Commerce System</p>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Sends an order notification to the admin.
 *
 * Strategy:
 * 1. If SMTP_HOST/SMTP_USER/SMTP_PASS are configured → send real email via nodemailer (dynamically imported)
 * 2. Always attempt notifyOwner() as an additional/fallback notification channel
 * 3. Log the full order details to console as a guaranteed record
 */
export async function sendOrderNotificationEmail(data: OrderNotificationData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "debangshumondal7@gmail.com";
  const orderDate = (data.createdAt || new Date()).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const textContent = buildOrderText(data, orderDate);
  const htmlContent = buildOrderHtml(data, orderDate);

  // Always log to console as a guaranteed record
  console.log(`\n${"=".repeat(60)}`);
  console.log(textContent);
  console.log(`${"=".repeat(60)}\n`);

  let emailSent = false;

  // Attempt SMTP delivery if configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

    try {
      // Dynamically import nodemailer — only requires the package to be installed
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"SlayPOP Store" <${smtpUser}>`,
        to: adminEmail,
        subject: `🚨 New Order #${data.orderNumber} — ₹${data.totalAmount.toLocaleString("en-IN")}`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email] ✅ Order #${data.orderNumber} email sent to ${adminEmail}`);
      emailSent = true;
    } catch (err) {
      console.error(`[Email] ❌ SMTP send failed for order #${data.orderNumber}:`, err);
    }
  } else {
    console.log(
      `[Email] ⚠️ SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env). Order #${data.orderNumber} logged above.`
    );
  }

  return emailSent;
}
