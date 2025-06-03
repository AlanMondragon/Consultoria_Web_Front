import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './../../../CheckoutForm.jsx';
import PaymentOptions from './PaymentOption.jsx';
import InfoBox from './InfoBox.jsx'; // Asegúrate de que esté en la misma carpeta
import styles from './../../../../styles/ClienteServicios.module.css';

// Importa los íconos (ejemplo para Material-UI)
import { InfoIcon, MessageIcon, MailIcon, LoadingSpinner } from './Icons'; // Ajusta la ruta según tu estructura de archivosimport LockIcon from '@mui/icons-material/Lock';


const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

const StripePaymentSection = ({
  service,
  paymentOptions,
  selectedPaymentType,
  onPaymentTypeChange,
  currentPaymentOption,
  isVisaAmericana,
  haveOtherCost,
  userEmail,
  userId,
  onSuccess,
  onError
}) => {
  return (
    <div>
      {/* Payment Options */}
      <PaymentOptions
        paymentOptions={paymentOptions}
        selectedPaymentType={selectedPaymentType}
        onPaymentTypeChange={onPaymentTypeChange}
        isVisaAmericana={isVisaAmericana}
      />

      {/* Visa Americana Info */}
      {isVisaAmericana && (
        <InfoBox
          backgroundColor="#e3f2fd"
          borderColor="#2196f3"
          color="#1976d2"
          title="Información sobre Visa Americana"
          items={[
            'El apartado reserva tu lugar en el proceso',
            'Procesamiento en 4 meses: Servicio estándar',
            ...(haveOtherCost ? ['Procesamiento en 8 meses: Opción económica con más tiempo'] : []),
            'Todos los pagos son seguros y procesados por Stripe'
          ]}
        />
      )}

      {/* Formulario de pago Stripe */}
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amount={currentPaymentOption?.amount}
          description={currentPaymentOption?.description}
          idProductoTransaccion={service?.idTransact}
          userEmail={userEmail}
          customer={userId}
          onSuccess={onSuccess}
          onError={onError}
          serviceName={service?.name}
        />
      </Elements>
    </div>
  );
};

export default StripePaymentSection; // No olvides exportar el componente