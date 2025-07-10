import React, { useState } from 'react';
import { MessageIcon } from './Icons.jsx';
import InfoBox from './InfoBox.jsx';
import StripePaymentSection from './StripePaymentSection.jsx';

const DS160Section = ({ userEmail, onSuccess, onError, onHide, service, paymentOptions, selectedPaymentType, onPaymentTypeChange, currentPaymentOption }) => {
  return (
    <div>
      {/* Info Box */}
      <div style={{
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15px'
        }}>
          <MessageIcon color="#4caf50" />
          <strong style={{ color: '#2e7d32', fontSize: '18px' }}>
            Formulario DS-160
          </strong>
        </div>
        
        <p style={{ 
          color: '#2e7d32', 
          margin: '0 0 15px 0',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          Te enviaremos un correo personalizado a tu correo electrónico para completar 
          el proceso del formulario DS-160 de manera segura.

        </p>

        <p style={{ 
          color: '#2e7d32', 
          margin: '0 0 15px 0',
          fontSize: '14px',
          lineHeight: '1.5'}}>
            Correo electrónico: <strong>{userEmail}</strong>
          </p>
      </div>

      {/* Stripe Payment Section */}
      <StripePaymentSection
        service={service}
        paymentOptions={paymentOptions}
        selectedPaymentType={selectedPaymentType}
        onPaymentTypeChange={onPaymentTypeChange}
        currentPaymentOption={currentPaymentOption}
        userEmail={userEmail}
        onSuccess={onSuccess}
        onError={onError}
        onHide={onHide}
      />

      {/* Warning Box */}
      <InfoBox 
        color="#000"
        backgroundColor="#46cef9"
        title="Información importante"
        items={[
          'Formulario DS-160 para trámite de visa',
          'Pago 100% seguro con Stripe o PayPal',
          'Procesamiento inmediato del trámite',
          'Recibirás confirmación por correo'
        ]}
      />
    </div>
  );
};


export default DS160Section;