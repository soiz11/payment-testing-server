import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const POST = async function POST(req: NextRequest) {
  try {
    const {
      _returnUrl,
      _cancelUrl,
      _responseUrl,
      _amount,
      _currency,
      _reference,
      _orderId,
      _pluginName,
      _pluginVersion,
      _description,
      _firstName,
      _lastName,
      _email,
    } = await req.json();

    const privateKey = process.env.KOKO_PVT_KEY;

    const merchantId = process.env.KOKO__MERCHANT_ID;
    const apiKey = process.env.KOKO_API_KEY;

    const username = process.env.KOKO_USERNAME;
    const password = process.env.KOKO_PASSWORD;

    const dataString = `${merchantId}${_amount}${_currency}${_pluginName}${_pluginVersion}${_returnUrl}${_cancelUrl}${_orderId}${_reference}${_firstName}${_lastName}${_email}${_description}${apiKey}${_responseUrl}`;

    if (!privateKey || !merchantId || !apiKey) {
      return NextResponse.json(
        { message: "Missing Onepay credentials" },
        { status: 500 }
      );
    }

    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(dataString)
      .digest("base64");

    return NextResponse.json(
      { dataString, signature, merchantId, apiKey, username, password },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Onepay hashing:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
