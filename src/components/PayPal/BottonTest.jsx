import React, { useEffect, useRef, useState } from 'react';

const PayPalButton = ({ amount }) => {
  const paypalRef = useRef();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Espera a que el SDK esté disponible
    if (window.paypal) {
      setSdkReady(true);
    } else {
      const interval = setInterval(() => {
        if (window.paypal) {
          setSdkReady(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount // monto en dólares
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(function (details) {
          alert(`Transacción completada por ${details.payer.name.given_name}`);
          console.log('Detalles de pago:', details);
          // Aquí puedes enviar los datos al backend para registrar la transacción
        });
      },
      onError: (err) => {
        console.error('Error al procesar el pago:', err);
      }
    }).render(paypalRef.current);
  }, [sdkReady, amount]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;
