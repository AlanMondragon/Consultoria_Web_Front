// Main PaymentModal.jsx (Refactorizado)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { usePaymentOptions } from './../hooks/UsePaymentOption';
import DS160Section from './components/DS160Section';
import StripePaymentSection from './components/StripePaymentSection';
import paymentStyles from '../../../styles/servicios/client/PaymentModal.module.css';
import { LockIcon } from 'lucide-react';
import PayPalScriptLoader from '../../PayPal/PayPalScriptLoader';
import PayPalButton from '../../PayPal/BottonTest';

// SVGs inline para logos y escudo
const VisaSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#fff"/>
    <text x="7" y="11" fontSize="10" fontWeight="bold" fill="#1a1f71">VISA</text>
  </svg>
);
const MastercardSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="7" r="6" fill="#eb001b"/>
    <circle cx="25" cy="7" r="6" fill="#f79e1b"/>
    <text x="5" y="12" fontSize="7" fontWeight="bold" fill="#222">MC</text>
  </svg>
);
const StripeSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#635bff"/>
    <text x="6" y="11" fontSize="10" fontWeight="bold" fill="#fff">Stripe</text>
  </svg>
);
const ShieldSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" fill="#2563eb" stroke="#2563eb" strokeWidth="1.5"/>
    <path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PaymentModal = ({ 
  show, 
  onHide,
  service, 
  userEmail, 
  userId, 
  onSuccess, 
  onError 
}) => {
  const {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    validatedPaymentType,
    currentPaymentOption
  } = usePaymentOptions(service);

  if (!service) return null;

  const { isDs160 } = serviceInfo;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName={paymentStyles.customDialog}
      backdropClassName={paymentStyles.modalBackdrop}
    >
      <Modal.Header closeButton className={paymentStyles.modalHeader}>
        <Modal.Title className={paymentStyles.paymentModalTitle}>
          <div className={paymentStyles.serviceIcon}>
            <LockIcon size={32} />
          </div>
          <div>
            <div className={paymentStyles.serviceTitle}>{service.name}</div>
            <div className={paymentStyles.serviceSubtitle}>
              {isDs160 
                ? 'Formulario DS-160 - Pago seguro con Stripe'
                : 'Pago seguro con Stripe'
              }
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={paymentStyles.modalBody}>
        <div className={paymentStyles.securitySection}>
          <div className={paymentStyles.securityBadge}>
            <ShieldSVG />
            Pago 100% seguro y encriptado
          </div>
          <div className={paymentStyles.securityFeatures}>
            <div className={paymentStyles.securityFeature}>Tus datos están protegidos</div>
          </div>
        </div>
        {isDs160 ? (
          <DS160Section
            service={service}
            paymentOptions={paymentOptions}
            selectedPaymentType={validatedPaymentType}
            onPaymentTypeChange={setSelectedPaymentType}
            currentPaymentOption={currentPaymentOption}
            userEmail={userEmail}
            onSuccess={onSuccess}
            onError={onError}
            onHide={onHide}
          />
        ) : (
          <StripePaymentSection
            service={service}
            paymentOptions={paymentOptions}
            selectedPaymentType={validatedPaymentType}
            onPaymentTypeChange={setSelectedPaymentType}
            currentPaymentOption={currentPaymentOption}
            userEmail={userEmail}
            userId={userId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        
        {/* Separador entre métodos de pago */}
        <div className={paymentStyles.paymentSeparator}>
          <div className={paymentStyles.separatorLine}></div>
          <span className={paymentStyles.separatorText}>o paga con</span>
          <div className={paymentStyles.separatorLine}></div>
        </div>
        
        {/* PayPal siempre visible debajo del método principal */}
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <PayPalScriptLoader>
            <PayPalButton 
              amount={currentPaymentOption?.amount || service.cost || 0} 
              onSuccess={onSuccess} 
              onError={onError}
              userId={userId}
              service={{
                ...service,
                cost: currentPaymentOption?.amount || service.cost || 0
              }}
            />
          </PayPalScriptLoader>
        </div>
        <div className={paymentStyles.paymentMethods}>
          <VisaSVG />
          <MastercardSVG />
          <StripeSVG />
        </div>
        <div className={paymentStyles.privacyNote}>
          Nunca almacenamos los datos de tu tarjeta. El pago es procesado de forma segura por Stripe.
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;