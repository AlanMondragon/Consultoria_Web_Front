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
import Swal from 'sweetalert2';

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
  onError,
  isPreviewMode = false,
  onLoginRequired
}) => {
  const {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    validatedPaymentType,
    currentPaymentOption
  } = usePaymentOptions(service);

  // Estado para la cantidad de servicios
  const [quantity, setQuantity] = React.useState(1);

  if (!service) return null;

  const { isDs160 } = serviceInfo;

  // Función para cambiar la cantidad
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 15) { // Límite máximo de 15
      setQuantity(newQuantity);
    }
  };

  // Calcular el precio total basado en la cantidad
  const getTotalAmount = () => {
    if (currentPaymentOption) {
      return currentPaymentOption.amount * quantity;
    }
    return (service.cost) * quantity;
  };

  // Función para interceptar clics de pago en modo preview
  const handlePaymentAttempt = () => {
    if (isPreviewMode) {
      Swal.fire({
        title: 'Iniciar Sesión Requerido',
        text: 'Para continuar con el pago, necesitas iniciar sesión en tu cuenta.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Iniciar Sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          onHide();
          onLoginRequired && onLoginRequired();
        }
      });
      return;
    }
  };

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
            {isPreviewMode ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L21 5V11C21 16.55 16.84 21.74 12 23C7.16 21.74 3 16.55 3 11V5L12 1Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <LockIcon size={32} />
            )}
          </div>
          <div>
            <div className={paymentStyles.serviceTitle}>{service.name}</div>
            <div className={paymentStyles.serviceSubtitle}>
              {isPreviewMode 
                ? 'Vista previa - Opciones de pago disponibles'
                : isDs160 
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
        {isPreviewMode ? (
          // Modo preview: mostrar opciones usando el hook
          <div>
            {/* Mostrar opciones de precios usando el hook */}
            {Object.keys(paymentOptions).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {Object.keys(paymentOptions).length > 1 ? (
                  // Múltiples opciones: mostrar selector
                  <>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '16px',
                      color: '#1e293b'
                    }}>
                      Opciones de Pago Disponibles
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(paymentOptions).map(([key, option]) => (
                        <div 
                          key={key}
                          style={{
                            padding: '16px',
                            border: validatedPaymentType === key ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                            borderRadius: '12px',
                            backgroundColor: validatedPaymentType === key ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => setSelectedPaymentType(key)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ 
                                fontWeight: '600', 
                                color: '#1e293b',
                                marginBottom: '4px' 
                              }}>
                                {option.description}
                              </div>
                              <div style={{ 
                                fontSize: '0.875rem', 
                                color: '#64748b' 
                              }}>
                                {option.processingTime}
                              </div>
                              {option.isDeposit && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#059669',
                                  fontWeight: '500',
                                  marginTop: '4px'
                                }}>
                                  💰 Apartado/Anticipo
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                color: '#059669' 
                              }}>
                                ${(option.amount * quantity).toLocaleString()} MX
                              </div>
                              {quantity > 1 && (
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#64748b' 
                                }}>
                                  ${option.amount} x {quantity}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Una sola opción: mostrar directamente
                  <>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '16px',
                      color: '#1e293b'
                    }}>
                      Precio del Servicio
                    </h4>
                    {Object.entries(paymentOptions).map(([key, option]) => (
                      <div 
                        key={key}
                        style={{
                          padding: '20px',
                          border: '2px solid #059669',
                          borderRadius: '12px',
                          backgroundColor: '#f0fdf4',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          color: '#059669',
                          marginBottom: '8px'
                        }}>
                          ${(option.amount * quantity).toLocaleString()} MX
                        </div>
                        {quantity > 1 && (
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#059669',
                            marginBottom: '8px'
                          }}>
                            ${option.amount} x {quantity} servicios
                          </div>
                        )}
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1e293b',
                          marginBottom: '4px' 
                        }}>
                          {option.description}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#64748b' 
                        }}>
                          {option.processingTime}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {/* Mostrar la opción seleccionada actualmente solo si hay múltiples opciones */}
                {Object.keys(paymentOptions).length > 1 && currentPaymentOption && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Opción seleccionada:
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#1e293b' 
                      }}>
                        {currentPaymentOption.description}
                      </span>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '700', 
                        color: '#059669' 
                      }}>
                        ${(currentPaymentOption.amount * quantity).toLocaleString()} MX
                      </span>
                      {quantity > 1 && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b' 
                        }}>
                          ${currentPaymentOption.amount} x {quantity}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Información de métodos de pago */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#1e293b'
              }}>
                Métodos de Pago Aceptados
              </h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <div style={{
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>💳</span>
                  <span>Tarjetas de Crédito y Débito (Visa, Mastercard)</span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>🅿️</span>
                  <span>PayPal</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Modo normal: mostrar formularios de pago completos
          <div>
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
                userEmail={userEmail}
                userId={userId}
                quantity={quantity}
                totalAmount={getTotalAmount()}
                onQuantityChange={handleQuantityChange}
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
            
            {/* PayPal */}
            <div style={{ marginTop: 24, marginBottom: 12 }}>
              <PayPalScriptLoader>
                <PayPalButton 
                  amount={getTotalAmount()} 
                  onSuccess={onSuccess} 
                  onError={onError}
                  userId={userId}
                  quantity={quantity}
                  service={{
                    ...service,
                    cost: getTotalAmount()
                  }}
                />
              </PayPalScriptLoader>
            </div>
          </div>
        )}
        
        <div className={paymentStyles.paymentMethods}>
          <VisaSVG />
          <MastercardSVG />
          <StripeSVG />
        </div>
        <div className={paymentStyles.privacyNote}>
          Nunca almacenamos los datos de tu tarjeta. El pago es procesado de forma segura por Stripe.
        </div>
        
        {isPreviewMode && (
          <div style={{
            marginTop: '20px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #0ea5e9',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#0369a1',
              fontSize: '15px',
              fontWeight: '500',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <span>Para continuar con el pago, necesitas iniciar sesión</span>
            </div>
            <button
              onClick={handlePaymentAttempt}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Iniciar Sesión para Pagar
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;