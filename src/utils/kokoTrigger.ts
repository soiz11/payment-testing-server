"use client";

export type IKokoPaymentParams = {
  orderReference: string;
  amount: string;
  currency: string;
};

export type IKokoPaymentResult = {
  transactionId: string;
  gatewayUrl: string;
};

export const handleKokoPayment = async ({
  orderReference,
  amount,
  currency,
}: // }: IKokoPaymentParams): Promise<IKokoPaymentResult> => {
IKokoPaymentParams) => {
  try {
    const dataBundle = {
      _returnUrl: `http://localhost:3000/`,
      _cancelUrl: "http://eComm.com/orders/66/cancel/3",
      _responseUrl: "http://eComm.com/orders/66/response/3",
      _amount: amount,
      _currency: currency,
      _reference: orderReference,
      _orderId: orderReference,
      _pluginName: "customapi",
      _pluginVersion: "5.5.1",
      _description: "2 products",
      _firstName: "John",
      _lastName: "Doe",
      _email: "john@gmail.com",
    };

    //Request secure hash from the backend
    const response = await fetch("/api/payments/koko/hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBundle),
    });

    const { dataString, signature, merchantId, apiKey, username, password } =
      await response.json();

    const paymentData = {
      ...dataBundle,
      _mId: merchantId,
      api_key: apiKey,
      dataString,
      signature,
    };

    //triger the ipg api
    const formData = new URLSearchParams(paymentData).toString();
    const authString = `${username}${password}`;
    const base64Auth = btoa(authString);

    const ipgResponse = await fetch(
      "https://qaapi.paykoko.com/api/merchants/orderCreate",
      // "https://prodapi.paykoko.com/api/merchants/orderCreate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${base64Auth}`,
        },
        // body: JSON.stringify(paymentData),
        body: formData,
      }
    );

    const responseJson = await ipgResponse.json();
    console.log(responseJson, "res");
  } catch (error) {
    console.error("Error initializing Koko:", error);
    return { transactionId: "", gatewayUrl: "" };
  }
};
