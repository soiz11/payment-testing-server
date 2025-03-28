"use client";
import React, { useState, useEffect } from "react";
import md5 from "md5"; // Import MD5 hashing library

// Extend the Window type to include payhere
declare global {
  interface Window {
    payhere: {
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
      startPayment: (payment: object) => void;
    };
  }
}

// Function to generate the hash
const generateHash = (
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  merchant_secret: string
) => {
  // Step 1: MD5 hash of the merchant_secret
  const secretHash = md5(merchant_secret).toUpperCase();

  // Step 2: Concatenate all required fields
  const stringToHash = merchant_id + order_id + amount + currency + secretHash;

  // Step 3: Final MD5 hash of the concatenated string and convert to uppercase
  const finalHash = md5(stringToHash).toUpperCase();

  return finalHash;
};

const PayHerePayment: React.FC = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load PayHere script dynamically
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    // Set scriptLoaded to true when the script is fully loaded
    script.onload = () => {
      setScriptLoaded(true);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!scriptLoaded) {
      console.error("PayHere script not loaded yet");
      return;
    }

    const merchant_id = process.env.PAYHERE_MERCHANT_ID; // Replace with your Merchant ID
    const order_id = "ItemNo12345"; // Replace with the order ID
    const amount = "1000.00"; // Replace with the amount
    const currency = "LKR"; // Replace with the currency
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET; // Replace with your merchant secret

    // Generate the hash
    const hash = generateHash(
      merchant_id as string,
      order_id,
      amount,
      currency,
      merchant_secret as string
    );

    // Payment object
    const payment = {
      sandbox: true, // Change to false in production
      merchant_id: merchant_id,
      return_url: "http://localhost:3000/hello",
      cancel_url: "http://localhost:3000/hello",
      notify_url: "http://localhost:3000/api/payhere",
      order_id: order_id,
      items: "Door bell wireless",
      amount: amount,
      currency: currency,
      hash: hash, // Generated hash
      first_name: "Saman",
      last_name: "Perera",
      email: "samanp@gmail.com",
      phone: "0771234567",
      address: "No.1, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
      delivery_address: "No. 46, Galle road, Kalutara South",
      delivery_city: "Kalutara",
      delivery_country: "Sri Lanka",
      custom_1: "",
      custom_2: "",
    };

    // Start the PayHere payment
    if (window.payhere) {
      window.payhere.startPayment(payment);
    } else {
      console.error("PayHere script is not available.");
    }
  };

  return (
    <button type="button" onClick={handlePayment}>
      PayHere Pay
    </button>
  );
};

export default PayHerePayment;
