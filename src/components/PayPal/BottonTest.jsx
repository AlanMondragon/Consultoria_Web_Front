import React, { useEffect, useRef } from 'react';
import { registerPayPalPayment } from '../../api/paypal';

const PayPalButton = ({ amount, onSuccess, onError, userId, service }) => {
  const paypalRef = useRef();

  // Formatea el monto a string con dos decimales y valor mínimo 1.00
  const formattedAmount = (() => {
    let num = Number(amount);
    if (isNaN(num) || num <= 0) num = 1;
    return num.toFixed(2);
  })();

  useEffect(() => {
    if (!window.paypal) return;
    // Limpia el contenedor antes de renderizar el botón
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: formattedAmount // monto en dólares
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(async function (details) {
          try {
            // Registrar el pago en la base de datos
            const response = await registerPayPalPayment(details, userId, service);
            
            if (response.success) {
              console.log('Pago registrado correctamente:', response);
              // Llamar al callback de éxito con los detalles del pago
              if (onSuccess) onSuccess(details);
            } else {
              console.error('Error al registrar el pago:', response.error);
              // Si hay un error al registrar, mostrar error pero no fallar el pago
              if (onSuccess) onSuccess(details);
            }
          } catch (error) {
            console.error('Error al procesar el registro del pago:', error);
            // Aún así, consideramos el pago exitoso porque PayPal lo procesó
            if (onSuccess) onSuccess(details);
          }
        });
      },
      onError: (err) => {
        console.error('Error PayPal:', err);
        if (onError) onError(err);
      }
    }).render(paypalRef.current);
  }, [formattedAmount, onSuccess, onError, userId, service]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;
