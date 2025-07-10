// hooks/usePaymentOptions.js
import { useState, useMemo } from 'react';

export const usePaymentOptions = (service) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('adelanto');

  const serviceInfo = useMemo(() => {
    if (!service) return { isDs160: false, isVisaAmericana: false, haveOtherCost: false };

    const name = service.name.toLowerCase();
    const isDs160 = name === 'ds-160' || name === 'ds160' || name === 'Creación y generación de DS160' || name === 'elaboracion de formato ds-160' || name === 'ELABORACION DE FORMATO DS-160' || name.toLowerCase().includes('ds-160') || name.toLowerCase().includes('ds160');
    const isVisaAmericana = service.name === 'Visa Americana' || service.name === 'Visa Americana (4 meses)';
    const haveOtherCost = service.optionCost !== null && service.optionCost !== undefined && service.optionCost > 0;
    const isAdvanceVisaAmericana = name.includes('adelanto') && (name.includes('cita') || name.includes('anticipo')) && name.includes('visa') && name.includes('americana');

    return { isDs160, isVisaAmericana, isAdvanceVisaAmericana, haveOtherCost };
  }, [service]);

  const paymentOptions = useMemo(() => {
    if (!service) return {};

    const { isVisaAmericana, isAdvanceVisaAmericana, haveOtherCost } = serviceInfo;

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

    if (isAdvanceVisaAmericana) {
      return {
        '3meses': {
          amount: service.cost,
          description: 'Espera no mayor a 3 meses',
          processingTime: 'Adelanto de cita en un periodo no mayor a 3 meses',
          timeType: 'normal',
          isDeposit: false
        },
        '6meses': {
          amount: service.optionCost,
          description: 'Espera no mayor a 6 meses',
          processingTime: 'Adelanto de cita en un periodo no mayor a 6 meses',
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
    if (availableOptions.includes(selectedPaymentType)) {
      return selectedPaymentType;
    }
    // Si es adelanto de cita visa americana, empezar con 3meses
    if (serviceInfo.isAdvanceVisaAmericana && availableOptions.includes('3meses')) {
      return '3meses';
    }
    // De lo contrario, usar la primera opción disponible
    return availableOptions[0];
  }, [paymentOptions, selectedPaymentType, serviceInfo]);

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
