import React, { useEffect, useRef } from 'react';
import { createProcessWithPayment } from '../../api/api.js';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { useState } from 'react';

const PayPalButton = ({ amount, onSuccess, onError, userId, service, setPaypalStatus }) => {
  const paypalRef = useRef();
  const [paymentStatus, setPaymentStatus] = useState(null);


  const formattedAmount = (() => {
    let num = Number(amount);
    if (isNaN(num) || num <= 0) num = 1;
    return num.toFixed(2);
  })();

  useEffect(() => {
    if (!window.paypal) return;

    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: formattedAmount 
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(async function (details) {
          console.log("Service:", service, "Id Usuario:", userId, "Status:", details.status);
          
          setPaymentStatus(details.status);
          

          if (setPaypalStatus) {
            setPaypalStatus(details.status);
          }
          
          if (details.status === "COMPLETED") {
            try {

              let idTransact;
              if (service.transact && service.transact.idTransact) {
                idTransact = service.transact.idTransact;
              } else if (service.idTransact) {
                idTransact = service.idTransact;
              } else {
                console.error('No se encontró idTransact en service:', service);
                throw new Error('idTransact no encontrado en service');
              }
              

              const paymentData = {
                total: amount,     
                status: 1,                 
                idUser: parseInt(userId),  
                idTransact: idTransact      
              };
              
              console.log('Enviando paymentData:', paymentData);
              
    
              const response = await axios.post(`${API_URL}/payment`, paymentData);
              

              await createProcessWithPayment(paymentData);
              
              console.log('Respuesta backend:', response.data);
              
             
              if (response.data.success) {
                console.log('Pago registrado correctamente');
                if (onSuccess) onSuccess(details);
              } else {
                console.error('Error al registrar en backend:', response.data.error);
                if (onSuccess) onSuccess(details);
              }
            } catch (error) {
              console.error('Error al procesar registro:', error);
              if (onSuccess) onSuccess(details);
            }
          } else {
            console.warn('Pago no completado. Status:', details.status);
            if (onError) onError(new Error('El pago no fue completado.'));
          }
        });
      },
      onError: (err) => {
        console.error('Error PayPal:', err);
        if (onError) onError(err);
      }
    }).render(paypalRef.current);
  }, [formattedAmount, onSuccess, onError, userId, service, setPaypalStatus]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;