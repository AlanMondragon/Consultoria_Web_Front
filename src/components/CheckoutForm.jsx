import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

export default function CheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await axios.post(
        'http://localhost:8080/api/pay/create',
        { amount: amount * 100, currency: 'mxn' }
      );
      const clientSecret = data.clientSecret;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setMessage('No se encontró el método de pago.');
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
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
    <form onSubmit={handleSubmit}>
      <p>Vas a pagar <strong>MX${amount}</strong></p>
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
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Procesando...' : `Pagar MX$${amount}`}
      </button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </form>
  );
}
