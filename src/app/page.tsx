import Image from "next/image";
import PayHerePayment from "../components/Payhere";
import { handlePayHerePayment } from "@/components/payhereLogic";

export default function Home() {
  return (
    <>
      {/* <PayHerePayment /> */}
      {/* <div onClick={handlePayHerePayment}>seperate btn </div> */}
      <div onClick={handlePayHerePayment}>server only </div>
    </>
  );
}
