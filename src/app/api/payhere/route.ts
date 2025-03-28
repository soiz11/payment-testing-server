import { NextResponse } from "next/server";
import md5 from "md5"; // Import MD5 for checksum generation

const MERCHANT_SECRET = process.env
  .NEXT_PUBLIC_PAYHERE_MERCHANT_SECRET as string; // Load the merchant secret from env

// POST handler for payment notification
export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse the incoming JSON body
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1,
      custom_2,
      method,
      status_message,
      card_holder_name,
      card_no,
      card_expiry,
    } = body;

    // Step 1: Generate the MD5 checksum for validation
    const generatedMd5sig = generateMd5sig(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      MERCHANT_SECRET
    );

    // Step 2: Validate the checksum
    if (generatedMd5sig !== md5sig) {
      console.error("Checksum verification failed");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Step 3: Process the payment based on the status code
    switch (status_code) {
      case "2": // Success
        console.log(`Payment Success: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Success");
        break;
      case "0": // Pending
        console.log(`Payment Pending: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Pending");
        break;
      case "-1": // Canceled
        console.log(`Payment Canceled: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Canceled");
        break;
      case "-2": // Failed
        console.log(`Payment Failed: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Failed");
        break;
      case "-3": // Chargeback
        console.log(`Chargeback: OrderID: ${order_id}`);
        await updatePaymentStatus(order_id, "Chargeback");
        break;
      default:
        console.log(`Unknown Payment Status: ${status_code}`);
        return NextResponse.json(
          { message: "Unknown Status" },
          { status: 400 }
        );
    }

    // Step 4: Send the response back indicating that the payment notification is processed
    return NextResponse.json(
      { message: "Payment Status Processed" },
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

// Helper function to generate the MD5 checksum for validation
const generateMd5sig = (
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  status_code: string,
  merchant_secret: string
) => {
  const secretHash = md5(merchant_secret).toUpperCase();
  const stringToHash = `${merchant_id}${order_id}${amount}${currency}${status_code}${secretHash}`;
  return md5(stringToHash).toUpperCase();
};

// Helper function to update the payment status (mock example)
const updatePaymentStatus = async (order_id: string, status: string) => {
  // This is where you'd update your database or perform any necessary actions
  console.log(`Updating payment status for Order ${order_id} to ${status}`);
  // Example: await yourDatabase.updateOrderStatus(order_id, status);
};
