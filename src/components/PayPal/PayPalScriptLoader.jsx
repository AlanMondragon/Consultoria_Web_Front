import { useEffect } from "react";

const PayPalScriptLoader = () => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
  useEffect(() => {
    if (document.getElementById("paypal-sdk")) return;
    console.log("Cliente id paypal" + clientId)
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MXN`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.getElementById("paypal-sdk")) {
        document.getElementById("paypal-sdk").remove();
      }
    };
  }, []);
  return null;
};

export default PayPalScriptLoader;
