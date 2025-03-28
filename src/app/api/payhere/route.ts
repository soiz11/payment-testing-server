import { NextResponse } from "next/server";
import md5 from "md5";

const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET as string;

// POST handler for payment notification
export async function POST(req: Request) {
  try {
    // Fix: Parse `application/x-www-form-urlencoded` request properly
    const bodyText = await req.text(); // Read raw text data
    const params = new URLSearchParams(bodyText); // Convert to key-value pairs

    const merchant_id = params.get("merchant_id") ?? "";
    const order_id = params.get("order_id") ?? "";
    const payment_id = params.get("payment_id") ?? "";
    const payhere_amount = params.get("payhere_amount") ?? "";
    const payhere_currency = params.get("payhere_currency") ?? "";
    const status_code = Number(params.get("status_code") ?? ""); // Convert to number
    const md5sig = params.get("md5sig") ?? "";
    const method = params.get("method") ?? "";
    const status_message = params.get("status_message") ?? "";
    const card_holder_name = params.get("card_holder_name") ?? "";
    const card_no = params.get("card_no") ?? "";
    const card_expiry = params.get("card_expiry") ?? "";

    // Step 1: Generate the MD5 checksum for validation
    const generatedMd5sig = generateMd5sig(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      merchant_secret
    );

    // Step 2: Validate the checksum
    if (generatedMd5sig !== md5sig) {
      console.error("❌ Checksum verification failed");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Step 3: Process the payment based on the status code
    switch (status_code) {
      case 2: // Success
        console.log(`✅ Payment Success: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Success");
        break;
      case 0: // Pending
        console.log(`⏳ Payment Pending: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Pending");
        break;
      case -1: // Canceled
        console.log(`🚫 Payment Canceled: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Canceled");
        break;
      case -2: // Failed
        console.log(`❌ Payment Failed: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Failed");
        break;
      case -3: // Chargeback
        console.log(`⚠️ Chargeback: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Chargeback");
        break;
      default:
        console.log(`❓ Unknown Payment Status: ${status_code}`);
        return NextResponse.json(
          { message: "Unknown Status" },
          { status: 400 }
        );
    }

    // Step 4: Send the response back indicating success
    return NextResponse.json(
      { message: "Payment Status Processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing payment notification:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to generate the MD5 checksum for validation
const generateMd5sig = (
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  status_code: number,
  merchant_secret: string
) => {
  const secretHash = md5(merchant_secret).toUpperCase();
  const stringToHash = `${merchant_id}${order_id}${amount}${currency}${status_code}${secretHash}`;
  return md5(stringToHash).toUpperCase();
};

// Helper function to update the payment status (mock example)
const updatePaymentStatus = async (order_id: string, status: string) => {
  console.log(`🔄 Updating payment status for Order ${order_id} to ${status}`);
  // Example: await yourDatabase.updateOrderStatus(order_id, status);
};
