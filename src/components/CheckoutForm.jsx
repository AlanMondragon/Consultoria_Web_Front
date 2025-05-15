import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

export default function CheckoutForm({ amount, description, userEmail, customer, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Enviar todos los datos relevantes al backend
      const { data } = await axios.post(
        'http://localhost:8080/api/pay/create',
        {
          amount: amount * 100,
          currency: 'mxn',
          description: description, // Descripción del producto
          customerEmail: userEmail, // Email del cliente
          customerId: customer      // ID del cliente
        }
      );
      
      const clientSecret = data.clientSecret;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setMessage('No se encontró el método de pago.');
        setLoading(false);
        return;
      }

      // Incluir datos de facturación al confirmar el pago
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { 
          card: cardElement,
          billing_details: {
            name: 'Cliente ' + customer,  // Nombre del cliente
            email: userEmail              // Email del cliente
          }
        },
      });

      if (result.error) {
        setMessage(result.error.message);
        onError && onError(result.error);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('¡Pago exitoso!');
        onSuccess && onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al procesar el pago.');
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
        disabled={!stripe || loading}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
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