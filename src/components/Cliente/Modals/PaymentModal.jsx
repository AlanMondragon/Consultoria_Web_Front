// Main PaymentModal.jsx (Refactorizado)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { usePaymentOptions } from './../hooks/UsePaymentOption';
import DS160Section from './components/DS160Section';
import StripePaymentSection from './components/StripePaymentSection';
import paymentStyles from '../../../styles/servicios/client/PaymentModal.module.css';
import { LockIcon } from 'lucide-react';

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

  const { isDs160, isVisaAmericana, haveOtherCost } = serviceInfo;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={paymentStyles.paymentModal}
      dialogClassName="my-custom-dialog"
    >
      <Modal.Header closeButton className={paymentStyles.modalHeader}>
        <Modal.Title className={paymentStyles.paymentModalTitle}>
          <div className={paymentStyles.serviceIcon}>
            <LockIcon />
          </div>
          <div>
            <div className={paymentStyles.serviceTitle}>{service.name}</div>
            <div className={paymentStyles.serviceSubtitle}>
              {isDs160 
                ? 'Formulario DS-160 - Enlace de pago por correo'
                : isVisaAmericana 
                  ? 'Visa Americana - Pago seguro con Stripe' 
                  : 'Pago seguro con Stripe'
              }
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={paymentStyles.modalBody}>
        {isDs160 ? (
          <DS160Section
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
            isVisaAmericana={isVisaAmericana}
            haveOtherCost={haveOtherCost}
            userEmail={userEmail}
            userId={userId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;