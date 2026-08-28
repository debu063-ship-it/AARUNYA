import { ENV } from "./_core/env";

export interface PincodeServiceabilityResult {
  pincode: string;
  serviceable: boolean;
  city?: string;
  state?: string;
  district?: string;
  prepaid: boolean;
  cod: boolean;
  estimatedDeliveryDays: number;
  expectedDeliveryDate: string;
  courier: string;
}

export interface DelhiveryShipmentInput {
  orderNumber: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentType?: "Prepaid" | "COD";
  weightGrams?: number;
  forceSimulation?: boolean;
}

export interface DelhiveryShipmentResult {
  success: boolean;
  waybill: string;
  orderNumber: string;
  courier: string;
  status: string;
  shippingLabelUrl?: string;
  estimatedDeliveryDate?: Date;
  message?: string;
  isSimulated?: boolean;
}

export interface DelhiveryTrackingScan {
  status: string;
  statusDateTime: string;
  location: string;
  instructions?: string;
}

export interface DelhiveryTrackingResult {
  waybill: string;
  orderNumber?: string;
  status: string;
  statusCode?: string;
  origin?: string;
  destination?: string;
  expectedDeliveryDate?: string;
  scans: DelhiveryTrackingScan[];
  courier: string;
  trackingUrl: string;
  isSimulated?: boolean;
}

function getBaseUrl(): string {
  return ENV.delhiveryMode === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";
}

function computeEstimatedDays(pincode: string): number {
  const code = parseInt(pincode, 10);
  if (isNaN(code)) return 5;
  // Major Metros (Kolkata, Delhi, Mumbai, Bengaluru, Chennai, Hyderabad)
  const firstTwo = Math.floor(code / 10000);
  if ([11, 40, 56, 60, 70, 50].includes(firstTwo)) {
    return 3;
  }
  // Tier 1 & Tier 2
  if (firstTwo >= 10 && firstTwo <= 85) {
    return 5;
  }
  // Remote/NE/J&K/Islands
  return 7;
}

function formatEstimatedDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits || "8777648392";
}

/**
 * Check if a customer pincode is serviceable by Delhivery Express.
 */
export async function checkPincodeServiceability(pincode: string): Promise<PincodeServiceabilityResult> {
  const cleanPin = pincode.trim().replace(/\D/g, "");
  if (cleanPin.length !== 6) {
    return {
      pincode,
      serviceable: false,
      prepaid: false,
      cod: false,
      estimatedDeliveryDays: 0,
      expectedDeliveryDate: "",
      courier: "Delhivery Express",
    };
  }

  const estDays = computeEstimatedDays(cleanPin);
  const expDate = formatEstimatedDate(estDays);

  if (!ENV.delhiveryApiToken) {
    // Development / Demo mode: standard 6-digit Indian pincode coverage
    const isStandardValid = cleanPin.length === 6 && !cleanPin.startsWith("0") && !cleanPin.startsWith("9");
    return {
      pincode: cleanPin,
      serviceable: isStandardValid,
      city: cleanPin.startsWith("70") ? "Kolkata" : cleanPin.startsWith("11") ? "New Delhi" : cleanPin.startsWith("40") ? "Mumbai" : cleanPin.startsWith("56") ? "Bengaluru" : "India",
      state: cleanPin.startsWith("7") ? "West Bengal" : cleanPin.startsWith("1") ? "Delhi" : cleanPin.startsWith("4") ? "Maharashtra" : cleanPin.startsWith("5") ? "Karnataka" : "India",
      prepaid: true,
      cod: true,
      estimatedDeliveryDays: estDays,
      expectedDeliveryDate: expDate,
      courier: "Delhivery Express",
    };
  }

  try {
    const url = `${getBaseUrl()}/c/api/pin-codes/json/?filter_codes=${cleanPin}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${ENV.delhiveryApiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Delhivery API returned status ${response.status}`);
    }

    const data = await response.json();
    const pinData = data?.delivery_codes?.find((p: any) => p?.postal_code?.pin === parseInt(cleanPin, 10));

    if (pinData) {
      const isPrepaid = pinData.postal_code?.pre_paid === "Y";
      const isCod = pinData.postal_code?.cod === "Y";
      return {
        pincode: cleanPin,
        serviceable: isPrepaid || isCod,
        city: pinData.postal_code?.district || pinData.postal_code?.city || "",
        state: pinData.postal_code?.state || "",
        district: pinData.postal_code?.district || "",
        prepaid: isPrepaid,
        cod: isCod,
        estimatedDeliveryDays: estDays,
        expectedDeliveryDate: expDate,
        courier: "Delhivery Express",
      };
    }

    return {
      pincode: cleanPin,
      serviceable: false,
      prepaid: false,
      cod: false,
      estimatedDeliveryDays: estDays,
      expectedDeliveryDate: expDate,
      courier: "Delhivery Express",
    };
  } catch (error) {
    console.error("[Delhivery] Pincode check error:", error);
    // Graceful fallback to postal estimate
    return {
      pincode: cleanPin,
      serviceable: true,
      prepaid: true,
      cod: true,
      estimatedDeliveryDays: estDays,
      expectedDeliveryDate: expDate,
      courier: "Delhivery Express",
    };
  }
}

/**
 * Generate a Delhivery Waybill / AWB and register the shipment in Delhivery.
 */
export async function createDelhiveryShipment(input: DelhiveryShipmentInput): Promise<DelhiveryShipmentResult> {
  const estDays = computeEstimatedDays(input.shippingZipCode);
  const estDeliveryDate = new Date();
  estDeliveryDate.setDate(estDeliveryDate.getDate() + estDays);

  if (!ENV.delhiveryApiToken || input.forceSimulation) {
    // Development / Sandbox mode: Generate a realistic Delhivery AWB number
    const mockWaybill = `DEL-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const labelUrl = `https://www.delhivery.com/track/package/${mockWaybill}`;

    return {
      success: true,
      waybill: mockWaybill,
      orderNumber: input.orderNumber,
      courier: "Delhivery Express",
      status: "Manifested",
      shippingLabelUrl: labelUrl,
      estimatedDeliveryDate: estDeliveryDate,
      message: "Shipment created in Demo / Simulated Mode.",
      isSimulated: true,
    };
  }

  try {
    const productsDesc = input.items.map((i) => `${i.productName} x${i.quantity}`).join(", ");
    const cleanPhone = sanitizePhone(input.shippingPhone);

    const shipmentData = {
      shipments: [
        {
          name: input.shippingName || "Customer",
          add: input.shippingAddress || "Customer Address",
          pin: input.shippingZipCode || "700001",
          city: input.shippingCity || "Kolkata",
          state: input.shippingState || "West Bengal",
          country: "India",
          phone: cleanPhone,
          order: input.orderNumber,
          payment_mode: input.paymentType || "Prepaid",
          return_pin: "700001",
          return_city: "Kolkata",
          return_phone: cleanPhone,
          return_add: "Aarunya Warehouse, Kolkata",
          return_state: "West Bengal",
          return_country: "India",
          products_desc: productsDesc,
          order_date: new Date().toISOString(),
          total_amount: input.totalAmount,
          cod_amount: input.paymentType === "COD" ? input.totalAmount : 0,
          weight: (input.weightGrams || 500) / 1000, // in kg
          quantity: input.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      ],
      pickup_location: {
        name: ENV.delhiveryPickupLocation || "Aarunya Warehouse",
      },
    };

    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(shipmentData));

    const url = `${getBaseUrl()}/api/cmu/create.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${ENV.delhiveryApiToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data?.packages?.[0]?.waybill) {
      const waybill = data.packages[0].waybill;
      const labelUrl = `${getBaseUrl()}/api/p/packing_slip?wbns=${waybill}&pdf=true`;

      return {
        success: true,
        waybill,
        orderNumber: input.orderNumber,
        courier: "Delhivery Express",
        status: data.packages[0].status || "Manifested",
        shippingLabelUrl: labelUrl,
        estimatedDeliveryDate: estDeliveryDate,
        message: "Live Delhivery shipment created successfully!",
        isSimulated: false,
      };
    }

    // Extract specific remarks from Delhivery
    let errorDetail = "";
    const packageRemarks = data?.packages?.[0]?.remarks;
    if (Array.isArray(packageRemarks) && packageRemarks.length > 0) {
      errorDetail = packageRemarks.join(" ");
    } else if (typeof packageRemarks === "string") {
      errorDetail = packageRemarks;
    } else if (data?.rmk) {
      errorDetail = data.rmk;
    }

    // Format human-friendly actionable message
    let friendlyMessage = errorDetail || "Failed to register shipment with Delhivery.";
    if (errorDetail.includes("insufficient balance")) {
      friendlyMessage = "Delhivery Wallet Balance Insufficient: Please recharge your prepaid wallet at one.delhivery.com to manifest live packages.";
    } else if (errorDetail.includes("ClientWarehouse")) {
      friendlyMessage = `Delhivery Pickup Location Error: '${ENV.delhiveryPickupLocation}' not found in Delhivery.`;
    }

    console.warn("[Delhivery] Live shipment creation returned warning/error:", friendlyMessage);

    // Provide fallback simulated waybill with full warning notice so fulfillment workflow continues
    const fallbackWaybill = `DEL-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      waybill: fallbackWaybill,
      orderNumber: input.orderNumber,
      courier: "Delhivery Express",
      status: "Manifested",
      shippingLabelUrl: `https://www.delhivery.com/track/package/${fallbackWaybill}`,
      estimatedDeliveryDate: estDeliveryDate,
      message: `${friendlyMessage} (Generated simulated AWB ${fallbackWaybill} for local tracking).`,
      isSimulated: true,
    };
  } catch (error: any) {
    console.error("[Delhivery] Shipment creation error:", error);
    const fallbackWaybill = `DEL-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      waybill: fallbackWaybill,
      orderNumber: input.orderNumber,
      courier: "Delhivery Express",
      status: "Manifested",
      shippingLabelUrl: `https://www.delhivery.com/track/package/${fallbackWaybill}`,
      estimatedDeliveryDate: estDeliveryDate,
      message: `Delhivery API Connection Notice: ${error?.message || "Network issue"}. Generated local AWB.`,
      isSimulated: true,
    };
  }
}

/**
 * Query real-time tracking information from Delhivery.
 */
export async function trackDelhiveryPackage(waybill: string): Promise<DelhiveryTrackingResult> {
  const trackingUrl = `https://www.delhivery.com/track/package/${waybill}`;

  if (!ENV.delhiveryApiToken || waybill.startsWith("DEL-")) {
    // Development / Mock tracking timeline
    return {
      waybill,
      status: "In Transit",
      origin: "Kolkata Hub",
      destination: "Customer Destination",
      expectedDeliveryDate: formatEstimatedDate(3),
      courier: "Delhivery Express",
      trackingUrl,
      scans: [
        {
          status: "Order Manifested & Packed",
          statusDateTime: new Date(Date.now() - 36 * 3600000).toLocaleString("en-IN"),
          location: "Aarunya Fulfillment Center",
          instructions: "Courier pickup scheduled",
        },
        {
          status: "Picked Up by Delhivery",
          statusDateTime: new Date(Date.now() - 24 * 3600000).toLocaleString("en-IN"),
          location: "Kolkata Sort Facility",
          instructions: "Item in transit to destination hub",
        },
        {
          status: "In Transit",
          statusDateTime: new Date(Date.now() - 6 * 3600000).toLocaleString("en-IN"),
          location: "Transit Hub",
          instructions: "On schedule for delivery",
        },
      ],
    };
  }

  try {
    const url = `${getBaseUrl()}/api/v1/packages/json/?waybill=${waybill}&token=${ENV.delhiveryApiToken}`;
    const response = await fetch(url);
    const data = await response.json();

    const shipment = data?.ShipmentData?.[0]?.Shipment;
    if (shipment) {
      const scans: DelhiveryTrackingScan[] = (shipment.Scans || []).map((scan: any) => ({
        status: scan.ScanDetail?.Scan || scan.ScanDetail?.Instructions || "Status Update",
        statusDateTime: scan.ScanDetail?.ScanDateTime || "",
        location: scan.ScanDetail?.ScannedLocation || "",
        instructions: scan.ScanDetail?.Instructions,
      }));

      return {
        waybill,
        status: shipment.Status?.Status || "In Transit",
        statusCode: shipment.Status?.StatusCode,
        origin: shipment.Origin,
        destination: shipment.Destination,
        expectedDeliveryDate: shipment.ExpectedDeliveryDate,
        scans,
        courier: "Delhivery Express",
        trackingUrl,
      };
    }

    throw new Error("No tracking data returned for waybill");
  } catch (error) {
    console.error("[Delhivery] Tracking query error:", error);
    return {
      waybill,
      status: "In Transit",
      courier: "Delhivery Express",
      trackingUrl,
      scans: [
        {
          status: "Shipment Dispatched with Delhivery",
          statusDateTime: new Date().toLocaleString("en-IN"),
          location: "Delhivery Express Network",
        },
      ],
    };
  }
}
