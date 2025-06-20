import { useEffect, useState } from "react";

const PayPalScriptLoader = ({ children }) => {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }
    if (document.getElementById("paypal-sdk")) {
      // Si el script ya existe pero window.paypal aún no está, espera a que cargue
      const interval = setInterval(() => {
        if (window.paypal) {
          setSdkReady(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MXN`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    document.body.appendChild(script);
    return () => {
      if (document.getElementById("paypal-sdk")) {
        document.getElementById("paypal-sdk").remove();
      }
    };
  }, [clientId]);

  return sdkReady ? children : null;
};

export default PayPalScriptLoader;
