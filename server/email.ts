import nodemailer from "nodemailer";

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

export interface ContactMessageData {
  name: string;
  email: string;
  orderNumber?: string | null;
  subject: string;
  message: string;
  createdAt?: Date;
}

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

  if (!smtpUser || !smtpPass) {
    return null;
  }

  if (smtpHost.toLowerCase().includes("gmail")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function buildOrderText(data: OrderNotificationData, orderDate: string): string {
  const itemsText = data.items
    .map(
      (item) =>
        `  • ${item.productName}${item.color ? ` (${item.color})` : ""} (Size: ${item.size}) x${item.quantity} @ ₹${item.unitPrice} = ₹${item.unitPrice * item.quantity}`
    )
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

function buildOrderHtml(data: OrderNotificationData, orderDate: string, forCustomer: boolean = false): string {
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

  const headerTitle = forCustomer ? "Thank You for Your Order!" : "New Order Received!";
  const headerSubtitle = forCustomer
    ? "We are preparing your streetwear pieces with care."
    : `🛒 New Customer Order #${data.orderNumber}`;

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>${headerTitle} #${data.orderNumber}</title></head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #374151;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #111827 0%, #374151 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; font-weight: 900;">SLAYPOP</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #e5e7eb;">${headerSubtitle}</p>
      </div>
      <div style="padding: 24px;">
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%;"><tr>
            <td><span style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px;">Order</span><h2 style="margin: 2px 0 0; font-size: 20px; color: #1f2937;">#${data.orderNumber}</h2></td>
            <td style="text-align: right;"><span style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px;">Total Paid</span><h2 style="margin: 2px 0 0; font-size: 20px; color: #111827;">₹${data.totalAmount.toLocaleString("en-IN")}</h2></td>
          </tr></table>
        </div>
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-top: 0;">👤 ${forCustomer ? "Delivery Information" : "Customer Details"}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Name:</td><td style="padding: 6px 0; font-weight: 600;">${data.shippingName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${data.shippingEmail}" style="color: #2563eb; text-decoration: none;">${data.shippingEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Phone:</td><td style="padding: 6px 0;"><a href="tel:${data.shippingPhone}" style="color: #2563eb; text-decoration: none;">${data.shippingPhone}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Shipping Address:</td><td style="padding: 6px 0;">${data.shippingAddress}<br/>${data.shippingCity}, ${data.shippingState} - ${data.shippingZipCode}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date:</td><td style="padding: 6px 0;">${orderDate}</td></tr>
        </table>
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">📦 Ordered Items</h3>
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
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 14px; text-align: right; margin-bottom: 24px;">
          <span style="font-size: 13px; color: #4b5563; font-weight: 600;">Grand Total: </span>
          <strong style="font-size: 18px; color: #111827;">₹${data.totalAmount.toLocaleString("en-IN")}</strong>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">SlayPOP Apparel · Premium Streetwear</p>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Sends order notification emails to Admin and Customer.
 */
export async function sendOrderNotificationEmail(data: OrderNotificationData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "debangshumondal7@gmail.com";
  const orderDate = (data.createdAt || new Date()).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const textContent = buildOrderText(data, orderDate);
  const adminHtmlContent = buildOrderHtml(data, orderDate, false);
  const customerHtmlContent = buildOrderHtml(data, orderDate, true);

  console.log(`\n${"=".repeat(60)}`);
  console.log(textContent);
  console.log(`${"=".repeat(60)}\n`);

  const transporter = createTransporter();
  if (!transporter) {
    console.log(
      `[Email] ⚠️ SMTP credentials not configured (set SMTP_USER, SMTP_PASS in .env). Order #${data.orderNumber} logged to console.`
    );
    return false;
  }

  const senderEmail = process.env.SMTP_USER;
  let adminSuccess = false;

  // 1. Send Admin Notification Email
  try {
    await transporter.sendMail({
      from: `"SlayPOP Store" <${senderEmail}>`,
      to: adminEmail,
      subject: `🚨 New Order #${data.orderNumber} — ₹${data.totalAmount.toLocaleString("en-IN")}`,
      text: textContent,
      html: adminHtmlContent,
    });
    console.log(`[Email] ✅ Order #${data.orderNumber} notification sent to Admin (${adminEmail})`);
    adminSuccess = true;
  } catch (err) {
    console.error(`[Email] ❌ Failed sending admin order email for #${data.orderNumber}:`, err);
  }

  // 2. Send Customer Confirmation Email (if customer email is provided)
  if (data.shippingEmail && data.shippingEmail !== adminEmail) {
    try {
      await transporter.sendMail({
        from: `"SlayPOP" <${senderEmail}>`,
        to: data.shippingEmail,
        subject: `🎉 Order Confirmed! #${data.orderNumber} — SlayPOP`,
        text: `Thank you for your order #${data.orderNumber}! We have received your order of ₹${data.totalAmount.toLocaleString("en-IN")} and will dispatch it shortly.`,
        html: customerHtmlContent,
      });
      console.log(`[Email] ✅ Order #${data.orderNumber} confirmation sent to Customer (${data.shippingEmail})`);
    } catch (err) {
      console.error(`[Email] ❌ Failed sending customer confirmation email for #${data.orderNumber}:`, err);
    }
  }

  return adminSuccess;
}

/**
 * Sends Contact Us form email notification to Admin & Auto-acknowledgement to user.
 */
export async function sendContactFormEmail(data: ContactMessageData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "debangshumondal7@gmail.com";
  const dateStr = (data.createdAt || new Date()).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const textContent = `📩 NEW CONTACT US MESSAGE RECEIVED

From: ${data.name} (${data.email})
${data.orderNumber ? `Order ID: ${data.orderNumber}\n` : ""}Subject: ${data.subject}
Date: ${dateStr}

Message:
${data.message}
`;

  console.log(`\n${"=".repeat(60)}`);
  console.log(textContent);
  console.log(`${"=".repeat(60)}\n`);

  const transporter = createTransporter();
  if (!transporter) {
    console.log(
      `[Email] ⚠️ SMTP not configured (set SMTP_USER, SMTP_PASS in .env). Contact message from ${data.name} logged above.`
    );
    return false;
  }

  const senderEmail = process.env.SMTP_USER;
  let adminSuccess = false;

  const adminHtml = `<!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #374151;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: #111827; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900;">SLAYPOP</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #e5e7eb;">📩 New Customer Support Message</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 110px;">From:</td><td style="padding: 6px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></td></tr>
          ${data.orderNumber ? `<tr><td style="padding: 6px 0; color: #6b7280;">Order ID:</td><td style="padding: 6px 0; font-weight: 600;">#${data.orderNumber}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #6b7280;">Subject:</td><td style="padding: 6px 0; font-weight: 600;">${data.subject}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date:</td><td style="padding: 6px 0;">${dateStr}</td></tr>
        </table>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Message Content:</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1f2937;">${data.message}</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display: inline-block; padding: 12px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px;">Reply to Customer</a>
        </div>
      </div>
    </div>
  </body>
</html>`;

  // 1. Send Admin Email
  try {
    await transporter.sendMail({
      from: `"SlayPOP Contact Form" <${senderEmail}>`,
      to: adminEmail,
      replyTo: data.email,
      subject: `📩 [Contact Form] ${data.subject} — from ${data.name}`,
      text: textContent,
      html: adminHtml,
    });
    console.log(`[Email] ✅ Contact message from ${data.name} sent to Admin (${adminEmail})`);
    adminSuccess = true;
  } catch (err) {
    console.error(`[Email] ❌ Failed sending contact message to Admin:`, err);
  }

  // 2. Send Auto-Reply to Customer
  const customerAutoReplyHtml = `<!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #374151;">
    <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #111827; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900;">SLAYPOP</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #e5e7eb;">Message Received</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px; margin-top: 0;">Hey <strong>${data.name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
          We've received your message regarding <strong>"${data.subject}"</strong>. Our customer support team is reviewing it and will get back to you within 24 hours.
        </p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px; color: #6b7280;">
          <strong>Your message:</strong><br/>
          <em>"${data.message}"</em>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">
          Need urgent help? You can also reach us via Instagram <a href="https://www.instagram.com/slaypop.co.in" style="color: #2563eb;">@slaypop.co.in</a>.
        </p>
      </div>
    </div>
  </body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"SlayPOP Support" <${senderEmail}>`,
      to: data.email,
      subject: `We've received your message: "${data.subject}" — SlayPOP`,
      text: `Hi ${data.name},\n\nWe received your message regarding "${data.subject}". Our team will get back to you within 24 hours.\n\nBest regards,\nSlayPOP Support`,
      html: customerAutoReplyHtml,
    });
    console.log(`[Email] ✅ Contact auto-acknowledgement sent to Customer (${data.email})`);
  } catch (err) {
    console.error(`[Email] ❌ Failed sending auto-acknowledgement to ${data.email}:`, err);
  }

  return adminSuccess;
}
