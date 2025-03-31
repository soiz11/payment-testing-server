import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
//import { updateOrderStatus } from "@/server-utils/db"; // Database utility function

// Function to validate MD5 signature
function verifySignature(
  params: URLSearchParams,
  merchant_secret: string
): boolean {
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = Object.fromEntries(params);

  if (!md5sig) return false;

  const hashString = `${merchant_id}${order_id}${payment_id}${payhere_amount}${payhere_currency}${status_code}${crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")}`;
  const calculatedSignature = crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex");

  return calculatedSignature === md5sig;
}

// POST handler for PayHere payment notifications
export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    // Extract required fields
    const order_id = params.get("order_id");
    const status_code = params.get("status_code");
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!order_id || !status_code || !merchant_secret) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify payment signature
    if (!verifySignature(params, merchant_secret)) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 }
      );
    }

    // Determine payment status
    let paymentStatus = "pending";
    switch (status_code) {
      case "2":
        paymentStatus = "success";
        break;
      case "0":
        paymentStatus = "pending";
        break;
      case "-1":
        paymentStatus = "canceled";
        break;
      case "-2":
        paymentStatus = "failed";
        break;
      case "-3":
        paymentStatus = "chargedback";
        break;
    }

    // Update database with payment status
    // await updateOrderStatus(order_id, paymentStatus);

    return NextResponse.json(
      { message: `Payment notification received:${paymentStatus}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing payment notification:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
