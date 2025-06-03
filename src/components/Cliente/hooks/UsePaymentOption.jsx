// hooks/usePaymentOptions.js
import { useState, useMemo } from 'react';

export const usePaymentOptions = (service) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('adelanto');

  const serviceInfo = useMemo(() => {
    if (!service) return { isDs160: false, isVisaAmericana: false, haveOtherCost: false };

    const name = service.name.toLowerCase();
    const isDs160 = name === 'ds-160' || name === 'ds160' || name === 'Creación y generación de DS160';
    const isVisaAmericana = service.name === 'Visa Americana' || service.name === 'Visa Americana (4 meses)';
    const haveOtherCost = service.optionCost !== null && service.optionCost !== undefined && service.optionCost > 0;

    return { isDs160, isVisaAmericana, haveOtherCost };
  }, [service]);

  const paymentOptions = useMemo(() => {
    if (!service) return {};

    const { isVisaAmericana, haveOtherCost } = serviceInfo;

    if (isVisaAmericana) {
      return {
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
    }

    return {
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
  }, [service, serviceInfo]);

  const validatedPaymentType = useMemo(() => {
    const availableOptions = Object.keys(paymentOptions);
    return availableOptions.includes(selectedPaymentType) ? selectedPaymentType : availableOptions[0];
  }, [paymentOptions, selectedPaymentType]);

  const currentPaymentOption = paymentOptions[validatedPaymentType];

  return {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    validatedPaymentType,
    currentPaymentOption
  };
};
