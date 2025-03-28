import md5 from "md5";
import "server-only";

export const generateServerHash = (
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  merchant_secret: string
) => {
  const secretHash = md5(merchant_secret).toUpperCase();
  const stringToHash = merchant_id + order_id + amount + currency + secretHash;
  const hash = md5(stringToHash).toUpperCase();
  return { hash, merchant_id };
};

export const sayHello = () => {
  return "hello";
};
