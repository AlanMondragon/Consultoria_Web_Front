// Main PaymentModal.jsx (Actualizado)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { usePaymentOptions } from '../hooks/UsePaymentOption';
import DS160Section from './components/DS160Section';
import StripePaymentSection from './components/StripePaymentSection';
import paymentStyles from '../../../styles/servicios/client/PaymentModal.module.css';
import { LockIcon } from 'lucide-react';
import PayPalScriptLoader from '../../PayPal/PayPalScriptLoader';
import PayPalButton from '../../PayPal/BottonTest';
import Swal from 'sweetalert2';

// SVGs inline para logos y escudo
const VisaSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#fff" />
    <text x="7" y="11" fontSize="10" fontWeight="bold" fill="#1a1f71">VISA</text>
  </svg>
);
const MastercardSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="7" r="6" fill="#eb001b" />
    <circle cx="25" cy="7" r="6" fill="#f79e1b" />
    <text x="5" y="12" fontSize="7" fontWeight="bold" fill="#222">MC</text>
  </svg>
);
const StripeSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#635bff" />
    <text x="6" y="11" fontSize="10" fontWeight="bold" fill="#fff">Stripe</text>
  </svg>
);
const ShieldSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" fill="#2563eb" stroke="#2563eb" strokeWidth="1.5" />
    <path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PaymentModal = ({
  show,
  onHide,
  service,
  userEmail,
  userId,
  onSuccess,
  onError,
  isPreviewMode = false,
  onLoginRequired
}) => {
  const {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    selectedLiquidationPlan,
    setSelectedLiquidationPlan,
    validatedPaymentType,
    costoTotal,
    pendienteLiquidar,
    currentPaymentOption,
  } = usePaymentOptions(service);

  const [quantity, setQuantity] = React.useState(1);

  if (!service) return null;
  const { isDs160, isVisaAmericana, haveOtherCost } = serviceInfo;

  // Manejo cantidad
  const handleQuantityChange = (newQty) => {
    if (newQty >= 1 && newQty <= 15) setQuantity(newQty);
  };

  // Calcular total pago inicial
  const getTotalAmount = () => {
    if (!currentPaymentOption) return service.cost * quantity;
    return currentPaymentOption.amount * quantity;
  };

  // Preview intercept
  const handlePaymentAttempt = () => {
    if (!isPreviewMode) return;
    Swal.fire({
      title: 'Iniciar Sesión Requerido',
      text: 'Para continuar con el pago, necesitas iniciar sesión.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Iniciar Sesión',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) { onHide(); onLoginRequired && onLoginRequired(); }
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName={paymentStyles.customDialog} backdropClassName={paymentStyles.modalBackdrop}>
      <Modal.Header closeButton className={paymentStyles.modalHeader}>
        <Modal.Title className={paymentStyles.paymentModalTitle}>
          <div className={paymentStyles.serviceIcon}><LockIcon size={32} /></div>
          <div>
            <div className={paymentStyles.serviceTitle}>{service.name}</div>
            <div className={paymentStyles.serviceSubtitle}>
              {isPreviewMode ?
                'Vista previa - Opciones de pago disponibles'
                : isDs160 ? 'Formulario DS-160 - Pago seguro con Stripe' : 'Pago seguro con Stripe'}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={paymentStyles.modalBody}>
        {/* Seguridad */}
        <div className={paymentStyles.securitySection}>
          <div className={paymentStyles.securityBadge}><ShieldSVG /> Pago 100% seguro</div>
        </div>

        {/* Selector de Plazo para Adelanto de Visa Americana */}
        {validatedPaymentType === 'adelanto' && isVisaAmericana && (
          <div style={{ 
            marginTop: 20, 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ 
              marginBottom: '16px', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#495057'
            }}>
              Selecciona el plazo para liquidar tu trámite:
            </h4>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <button
                onClick={() => setSelectedLiquidationPlan('4meses')}
                style={{
                  padding: '12px 20px',
                  border: selectedLiquidationPlan === '4meses' ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: selectedLiquidationPlan === '4meses' ? '#e7f3ff' : '#fff',
                  color: selectedLiquidationPlan === '4meses' ? '#007bff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedLiquidationPlan === '4meses' ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                4 Meses - ${service.cost} MXN
              </button>
              
              <button
                onClick={() => setSelectedLiquidationPlan('8meses')}
                style={{
                  padding: '12px 20px',
                  border: selectedLiquidationPlan === '8meses' ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: selectedLiquidationPlan === '8meses' ? '#e7f3ff' : '#fff',
                  color: selectedLiquidationPlan === '8meses' ? '#007bff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedLiquidationPlan === '8meses' ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                8 Meses - ${service.optionCost} MXN
              </button>
            </div>

            {/* Información del pago */}
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                Resumen del pago:
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                • Adelanto ahora: ${service.cashAdvance * quantity} MXN
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                • Total del trámite: ${costoTotal()*quantity} MXN
              </p>
              <p style={{ margin: '0', fontWeight: '600', color: '#155724' }}>
                • Pendiente por liquidar: ${pendienteLiquidar()*quantity} MXN
              </p>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {isPreviewMode ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className={paymentStyles.previewButton} onClick={handlePaymentAttempt}>
              Iniciar Sesión para Pagar
            </button>
          </div>
        ) : (
          <>            
            {isDs160 ? (
              <DS160Section
                service={service}
                paymentOptions={paymentOptions}
                selectedPaymentType={validatedPaymentType}
                onPaymentTypeChange={setSelectedPaymentType}
                currentPaymentOption={currentPaymentOption}
                userEmail={userEmail}
                quantity={quantity}
                totalAmount={getTotalAmount()}
                onQuantityChange={handleQuantityChange}
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
                isVisaAmericana={isVisaAmericana}
                haveOtherCost={haveOtherCost}
                userEmail={userEmail}
                userId={userId}
                quantity={quantity}
                totalAmount={getTotalAmount()}
                onQuantityChange={handleQuantityChange}
                onSuccess={onSuccess}
                onError={onError}
                costoTotal={costoTotal()}
                
            
              />
            )}
            
            {/* Separador */}
            <div className={paymentStyles.paymentSeparator}>
              <div className={paymentStyles.separatorLine} />
              <span className={paymentStyles.separatorText}>o paga con</span>
              <div className={paymentStyles.separatorLine} />
            </div>
            
            {/* PayPal */}
            <PayPalScriptLoader>
              <PayPalButton
                amount={getTotalAmount()}
                onSuccess={onSuccess}
                onError={onError}
                userId={userId}
                quantity={quantity}
                service={{ ...service, cost: getTotalAmount() }}
                liquidationPlan={selectedLiquidationPlan}
              />
            </PayPalScriptLoader>
          </>
        )}
        
        {/* Logos */}
        <div className={paymentStyles.paymentMethods}>
          <VisaSVG />
          <MastercardSVG />
          <StripeSVG />
        </div>
        
        {/* Nota */}
        <div className={paymentStyles.privacyNote}>
          Nunca almacenamos datos de tu tarjeta.
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;