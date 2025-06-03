import React, { useState } from 'react';
import { payDS160 } from '../../../../api/api.js';

const DS160Section = ({ userEmail, onSuccess, onError, onHide }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' | 'error'

  const handleDS160Payment = async () => {
    if (!userEmail) {
      setMessage('Email no disponible para enviar el enlace de pago DS-160');
      setMessageType('error');
      onError?.('Email no disponible para enviar el enlace de pago DS-160');
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setMessageType(null);
    try {
      await payDS160(userEmail);
      setMessage('✅ Enlace de pago DS-160 enviado correctamente a tu correo electrónico');
      setMessageType('success');
      onSuccess?.({
        type: 'ds160_email_sent',
        email: userEmail,
        message: 'Enlace de pago DS-160 enviado por correo'
      });
      // onHide?.(); // Si quieres cerrar el modal automáticamente, descomenta esto
    } catch (error) {
      setMessage(`Error al enviar el enlace de pago DS-160: ${error.message}`);
      setMessageType('error');
      onError?.(`Error al enviar el enlace de pago DS-160: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
          Te enviaremos un correo de pago personalizado a tu correo electrónico para completar 
          el proceso del formulario DS-160 de manera segura.
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#2e7d32'
        }}>
          <MailIcon />
          <strong>Correo: {userEmail}</strong>
        </div>
      </div>

      {/* Send Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={handleDS160Payment}
          disabled={isProcessing}
          style={{
            backgroundColor: isProcessing ? '#cccccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            transition: 'background-color 0.3s ease'
          }}
        >
          {isProcessing ? (
            <>
              <LoadingSpinner />
              Enviando enlace...
            </>
          ) : (
            <>
              <MailIcon />
              📧 Enviar enlace de pago por correo
            </>
          )}
        </button>
      </div>

      {/* Mensaje visual de éxito o error */}
      {message && (
        <div style={{
          margin: '0 auto 20px auto',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: messageType === 'success' ? '#e8f5e9' : '#ffebee',
          color: messageType === 'success' ? '#2e7d32' : '#c62828',
          textAlign: 'center',
          fontWeight: 'bold',
          maxWidth: 400
        }}>
          {message}
        </div>
      )}

      {/* Warning Box */}
      <InfoBox 
        color="#ffc107"
        backgroundColor="#fff3cd"
        title="Información importante"
        items={[
          'Recibirás el enlace en los próximos minutos',
          'Revisa tu bandeja de entrada y spam',
          'El enlace te llevará al formulario de pago seguro',
          'Si no recibes el correo, contáctanos'
        ]}
      />
    </div>
  );
};


export default DS160Section;