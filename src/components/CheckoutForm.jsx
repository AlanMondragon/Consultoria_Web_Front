import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { createProcessWithPayment, payDS160, actualizarTC } from './../api/api.js';
const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutForm({ amount, description, idProductoTransaccion, userEmail, customer, onSuccess, onError, serviceName, disabled = false, selectedDate, service, idTransactProgress }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (idProductoTransaccion === undefined || idProductoTransaccion === null || isNaN(parseInt(idProductoTransaccion, 10))) {
      setMessage('Error: Identificador de transacción del producto no válido o no proporcionado.');
      console.error("Error: idProductoTransaccion no es válido:", idProductoTransaccion);
      
      setLoading(false);
      onError && onError({ message: 'ID de transacción de producto inválido.' });
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/pay/payint`, {
        amount: amount * 100,
        currency: 'mxn',
        description: serviceName ? `${serviceName} - ${description}` : description,
        customerEmail: userEmail,
        customerId: customer
      });

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setMessage('No se encontró el método de pago.');
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Cliente ' + customer,
            email: userEmail
          }
        },
      });

      if (result.error) {
        setMessage(result.error.message);
        onError && onError(result.error);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('¡Pago exitoso!');
        onSuccess && onSuccess(result.paymentIntent);

        // Guardar el registro del pago en la base de datos y enviar correo DS-160 si aplica
        try {
          const paymentData = {
            total: amount, // Usa el monto original
            status: 1, //  1 para "pagado"
            idUser: parseInt(customer),
            idTransact: parseInt(idProductoTransaccion, 10), // Asegúrate de que sea un número
          };

          await axios.post(`${API_URL}/payment`, paymentData);
          await createProcessWithPayment(paymentData);

          // --- AGENDAR CITA EN EL CAMPO CORRECTO ---
          if (selectedDate && service && idTransactProgress) {
            let payload = {};
            if (service.cas) {
              payload.dateCas = selectedDate.replace('T', ' ');
            } else if (service.con) {
              payload.dateCon = selectedDate.replace('T', ' ');
            } else {
              payload.dateSimulation = selectedDate.replace('T', ' ');
            }
            await actualizarTC(idTransactProgress, payload);
          }

          // Enviar el correo DS-160 solo si el nombre real del servicio es DS-160 (validación por nombre)
          const ds160Names = [
            'ds-160',
            'ds160',
            'creación y generación de ds160',
            'creacion y generacion de ds160'
          ];
          if (serviceName && ds160Names.some(name => serviceName.trim().toLowerCase() === name)) {
            try {
              await payDS160(userEmail);
            } catch (mailError) {
              console.error('Error al enviar correo de confirmación DS-160:', mailError);
            }
          }
        } catch (dbError) {
          console.error("Error en la llamada para guardar el pago en la base de datos:", dbError);
          console.error("Detalles del error de red/axios:", dbError.response?.data || dbError.message);
          setMessage(`Pago en Stripe exitoso, pero hubo un problema al guardar su registro. Por favor, contacte a soporte.`);
        }
      }
    } catch (err) {
      console.error("Error en proceso de pago (Stripe):", err);
      let errorMessage = 'Error al procesar el pago.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setMessage(errorMessage);
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="product-info" style={{ marginBottom: '20px' }}>
        <h4>{description}</h4>
        <p>Monto a pagar: <strong>MX${amount}</strong></p>
        <p>Cliente: {userEmail}</p>
        {selectedDate && (
          <p>Fecha seleccionada: <strong>{selectedDate.replace('T', ' ')}</strong></p>
        )}
      </div>

      <div className="card-element-container" style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '20px' }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#c23d4b' },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || disabled}
        style={{
          backgroundColor: disabled ? '#cccccc' : '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? 'Procesando...' : `Pagar MX$${amount}`}
      </button>

      {message && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: message.includes('exitoso') ? '#d4edda' : '#f8d7da',
          color: message.includes('exitoso') ? '#155724' : '#721c24',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </form>
  );
}
