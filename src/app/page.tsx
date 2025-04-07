"use client";
import { handleKokoPayment } from "@/utils/kokoTrigger";

export default function Home() {
  return (
    <>
      <div
        className="bg-yellow-300 px-3 py-2 w-fit rounded-md text-black cursor-pointer"
        onClick={() =>
          handleKokoPayment({
            orderReference: "ItemNo12345",
            amount: "100.00",
            currency: "LKR",
          })
        }
      >
        pay with koko
      </div>
    </>
  );
}
