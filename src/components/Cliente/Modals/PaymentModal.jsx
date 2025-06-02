import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './../../CheckoutForm.jsx';
import styles from './../../../styles/ClienteServicios.module.css';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

const PaymentModal = ({ 
  show, 
  onHide, 
  service, 
  userEmail, 
  userId, 
  onSuccess, 
  onError 
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('adelanto');
  
  if (!service) return null;

  // Verificar si es Visa Americana
  const isVisaAmericana = service.name === 'Visa Americana' || 
                         service.name === 'Visa Americana (4 meses)';
  
  // Verificar si tiene costo adicional (opción de 8 meses)
  const haveOtherCost = service.optionCost !== null && 
                       service.optionCost !== undefined && 
                       service.optionCost > 0;

  // Opciones de pago para Visa Americana
  const paymentOptionsVisaAmericana = {
    adelanto: {
      amount: service.cashAdvance,
      description: 'Apartado (anticipo)',
      processingTime: 'Reserva tu trámite de Visa Americana',
      timeType: 'deposit',
      isDeposit: true
    },
    '4meses': {
      amount: service.cost,
      description: 'Visa Americana - Procesamiento en 4 meses',
      processingTime: 'Servicio completo con procesamiento en 4 meses',
      timeType: 'normal',
      isDeposit: false
    },
      '8meses': {
        amount: service.optionCost,
        description: service.nameOption || 'Visa Americana - Procesamiento en 8 meses',
        processingTime: 'Servicio completo con procesamiento en 8 meses',
        timeType: 'extended',
        isDeposit: false
      }
  };

  // Opciones de pago para servicios regulares
  const paymentOptionsRegular = {
    adelanto: {
      amount: service.cashAdvance,
      description: 'Apartado (anticipo)',
      processingTime: 'Reserva tu trámite',
      timeType: 'deposit',
      isDeposit: true
    },
    completo: {
      amount: service.cost,
      description: 'Servicio completo',
      processingTime: 'Pago total del servicio',
      timeType: 'normal',
      isDeposit: false
    },
    ...(haveOtherCost && {
      opcion: {
        amount: service.optionCost,
        description: service.nameOption || 'Opción adicional',
        processingTime: service.nameOption || 'Servicio con opción adicional',
        timeType: 'option',
        isDeposit: false
      }
    })
  };

  // Seleccionar opciones según el tipo de servicio
  const paymentOptions = isVisaAmericana ? paymentOptionsVisaAmericana : paymentOptionsRegular;
  
  // Validar que la opción seleccionada existe, si no, seleccionar la primera disponible
  const availableOptions = Object.keys(paymentOptions);
  const validSelectedType = availableOptions.includes(selectedPaymentType) 
    ? selectedPaymentType 
    : availableOptions[0];
  
  const currentPaymentOption = paymentOptions[validSelectedType];

  const handlePaymentTypeChange = (e) => {
    setSelectedPaymentType(e.target.value);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.paymentModal}
      dialogClassName="my-custom-dialog"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.paymentModalTitle}>
          <div className={styles.serviceIcon}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
          </div>
          <div>
            <div className={styles.serviceTitle}>{service.name}</div>
            <div className={styles.serviceSubtitle}>
              {isVisaAmericana 
                ? 'Visa Americana - Pago seguro con Stripe' 
                : 'Pago seguro con Stripe'
              }
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        
        {/* Opciones de pago */}
        <div className={styles.paymentOptionsContainer} style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
            {isVisaAmericana 
              ? 'Selecciona el tiempo de procesamiento:' 
              : 'Selecciona tu opción de pago:'
            }
          </h4>
          
          {Object.entries(paymentOptions).map(([key, option]) => {
            // Verificar que la opción tenga un monto válido
            if (!option.amount || option.amount <= 0) return null;
            
            return (
              <div 
                key={key} 
                className={styles.paymentOption} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '15px',
                  border: selectedPaymentType === key ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedPaymentType === key ? '#f8f9fa' : 'white',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedPaymentType(key)}
              >
                <input 
                  type="radio" 
                  name="paymentType" 
                  value={key}
                  checked={selectedPaymentType === key}
                  onChange={handlePaymentTypeChange}
                  style={{ marginRight: '12px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    marginBottom: '4px',
                    fontSize: '15px'
                  }}>
                    {option.description}
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#007bff', 
                    marginBottom: '6px',
                    fontWeight: 'bold'
                  }}>
                    💰 ${option.amount.toFixed(2)} MXN
                    {option.isDeposit && (
                      <span style={{ 
                        color: '#28a745', 
                        fontWeight: 'normal',
                        fontSize: '14px',
                        marginLeft: '8px'
                      }}>
                        (Apartado)
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {option.isDeposit ? (
                      <>
                        <span style={{ marginRight: '4px' }}>📋</span>
                        <span>{option.processingTime}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '4px' }}>⏱️</span>
                        <span>{option.processingTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Información específica para Visa Americana */}
        {isVisaAmericana && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="#2196f3" 
                viewBox="0 0 16 16"
                style={{ marginRight: '8px' }}
              >
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
              </svg>
              <strong style={{ color: '#1976d2' }}>Información sobre Visa Americana</strong>
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px', 
              color: '#1976d2',
              fontSize: '14px'
            }}>
              <li>El apartado reserva tu lugar en el proceso</li>
              <li>Procesamiento en 4 meses: Servicio estándar</li>
              {haveOtherCost && <li>Procesamiento en 8 meses: Opción económica con más tiempo</li>}
              <li>Todos los pagos son seguros y procesados por Stripe</li>
            </ul>
          </div>
        )}

        {/* Monto con diseño mejorado */}
        <div className={styles.paymentAmountContainer}>
          <div className={styles.paymentAmount}>
            <span className={styles.paymentAmountLabel}>Total a pagar</span>
            <span className={styles.paymentAmountValue}>
              ${currentPaymentOption?.amount?.toFixed(2) || '0.00'} 
              <span className={styles.currency}>MXN</span>
            </span>
          </div>
          <div className={styles.paymentDetails}>
            <div className={styles.paymentDetailItem}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
              </svg>
              <span>
                {currentPaymentOption?.description} - {currentPaymentOption?.isDeposit ? 'Pago de apartado' : 'Pago completo del servicio'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario Stripe */}
        <div className={styles.stripeFormContainer}>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={currentPaymentOption?.amount || 0}
              description={`${service.name} - ${currentPaymentOption?.description || 'Pago'}`}
              userEmail={userEmail}
              customer={userId}
              idProductoTransaccion={service.idTransact}
              paymentType={validSelectedType}
              serviceType={isVisaAmericana ? 'visa_americana' : 'regular'}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        </div>

        {/* Sección de seguridad */}
        <div className={styles.securitySection}>
          <div className={styles.securityBadge}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
            <span>Pago 100% seguro</span>
          </div>

          <div className={styles.securityFeatures}>
            <div className={styles.securityFeature}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z" />
                <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
              <span>Encriptación SSL</span>
            </div>
            <div className={styles.securityFeature}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
              </svg>
              <span>Sin almacenar datos</span>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;