// hooks/usePaymentOptions.js
import { useState, useMemo } from 'react';

export const usePaymentOptions = (service) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedLiquidationPlan, setSelectedLiquidationPlan] = useState('4meses'); // Nuevo estado para el plazo

  const serviceInfo = useMemo(() => {
    if (!service) return { isDs160: false, isVisaAmericana: false, haveOtherCost: false, isTransportService: false };

    const name = service.name.toLowerCase();
    const isTransportService = name === 'servicio de traslado para solicitantes de visa' || name.includes('traslado');
    
    // Lógica mejorada para DS-160
    const nameForDs = name.trim();
    const hasElaboracion = nameForDs.includes('elaboracion') || nameForDs.includes('elaboración');
    const hasCreacion = nameForDs.includes('creacion') || nameForDs.includes('creación');
    const hasDs = nameForDs.includes('ds');
    // Debe tener DS obligatoriamente Y al menos una de las otras dos (elaboracion o creacion)
    const isDs160 = hasDs && (hasElaboracion || hasCreacion);
    
    const isVisaAmericana = service.name === 'Visa Americana' || service.name === 'Visa Americana (4 meses)';
    const haveOtherCost = service.optionCost !== null && service.optionCost !== undefined && service.optionCost > 0;
    const isAdvanceVisaAmericana = name.includes('adelanto') && (name.includes('cita') || name.includes('anticipo')) && name.includes('visa') && name.includes('americana');

    return { isDs160, isVisaAmericana, isAdvanceVisaAmericana, haveOtherCost, isTransportService };
  }, [service]);

  const paymentOptions = useMemo(() => {
    if (!service) return {};

    const { isVisaAmericana, isAdvanceVisaAmericana, haveOtherCost, isTransportService } = serviceInfo;

    if (isVisaAmericana) {
      return {
        adelanto: {
          amount: service.cashAdvance,
          description: 'Apartado (anticipo)',
          processingTime: 'Reserva tu trámite de Visa Americana',
          timeType: 'deposit',
          isDeposit: true,
          // IMPORTANTE: Aquí agregamos la información del plazo seleccionado
          liquidationAmount: selectedLiquidationPlan === '4meses' ? service.cost : service.optionCost,
          liquidationDescription: selectedLiquidationPlan === '4meses' ? 'Liquidación plazo 4 meses' : 'Liquidación plazo 8 meses',
          selectedPlan: selectedLiquidationPlan
        },
        '4meses': {
          amount: service.cost,
          description: 'Visa Americana - Procesamiento en 4 meses',
          processingTime: 'Servicio completo con procesamiento en 4 meses',
          timeType: 'normal',
          isDeposit: false,
          liquidationAmount: service.cost,
          liquidationDescription: 'Pago completo 4 meses',
          selectedPlan: '4meses'
        },
        '8meses': {
          amount: service.optionCost,
          description: service.nameOption || 'Visa Americana - Procesamiento en 8 meses',
          processingTime: 'Servicio completo con procesamiento en 8 meses',
          timeType: 'extended',
          isDeposit: false,
          liquidationAmount: service.optionCost,
          liquidationDescription: 'Pago completo 8 meses',
          selectedPlan: '8meses'
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

    if(isTransportService) {
      const isFullPaymentOnly = service.cashAdvance === service.cost;
      
      return {
        adelanto: {
          amount: service.cashAdvance,
          description: isFullPaymentOnly ? 'Pago único del traslado' : 'Apartado del servicio de traslado',
          processingTime: isFullPaymentOnly ? 'Pago total del servicio de traslado' : 'Reserva tu servicio de traslado',
          timeType: isFullPaymentOnly ? 'normal' : 'deposit',
          isDeposit: !isFullPaymentOnly
        },
        ...(service.cashAdvance !== service.cost && {
          completo: {
            amount: service.cost,
            description: 'Servicio de traslado completo',
            processingTime: 'Pago total del servicio de traslado',
            timeType: 'normal',
            isDeposit: false
          }
        }),
        ...(haveOtherCost && {
          opcion: {
            amount: service.optionCost,
            description: service.nameOption || 'Opción adicional de traslado',
            processingTime: service.nameOption || 'Servicio de traslado con opción adicional',
            timeType: 'option',
            isDeposit: false
          }
        })
      };
    }

    const isFullPaymentOnly = service.cashAdvance === service.cost;
    
    return {
      adelanto: {
        amount: service.cashAdvance,
        description: isFullPaymentOnly ? 'Pago único' : 'Apartado (anticipo)',
        processingTime: isFullPaymentOnly ? 'Pago total del servicio' : 'Reserva tu trámite',
        timeType: isFullPaymentOnly ? 'normal' : 'deposit',
        isDeposit: !isFullPaymentOnly
      },
      ...(service.cashAdvance !== service.cost && {
        completo: {
          amount: service.cost,
          description: 'Servicio completo',
          processingTime: 'Pago total del servicio',
          timeType: 'normal',
          isDeposit: false
        }
      }),
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
  }, [service, serviceInfo, selectedLiquidationPlan]); // Agregamos selectedLiquidationPlan como dependencia

  const validatedPaymentType = useMemo(() => {
    const availableOptions = Object.keys(paymentOptions);
    if (availableOptions.includes(selectedPaymentType)) {
      return selectedPaymentType;
    }
    if (serviceInfo.isAdvanceVisaAmericana && availableOptions.includes('3meses')) {
      return '3meses';
    }
    return availableOptions[0];
  }, [paymentOptions, selectedPaymentType, serviceInfo]);

  const currentPaymentOption = paymentOptions[validatedPaymentType];
  console.log('Current Payment Option:', currentPaymentOption);

  // Función para obtener el costo total correcto basado en el plazo seleccionado
  const costoTotal = () => {
    //AQUI SE OBTIENE EL MONTO TOTAL DEL SERVICIO DEPENDIENDO DE LA SELECCION DEL PLAZO
    console.log('costoTotal - service:', service);
    console.log('costoTotal - serviceInfo.isVisaAmericana:', serviceInfo.isVisaAmericana);
    console.log('costoTotal - validatedPaymentType:', validatedPaymentType);
    
    if (!serviceInfo.isVisaAmericana || validatedPaymentType !== 'adelanto') {
      const amount = currentPaymentOption?.liquidationAmount || service?.cost || service?.cashAdvance || 0;
      console.log('costoTotal - amount (no visa americana):', amount);
      return amount;
    }
    
    // Para adelanto de Visa Americana, devolver el costo según el plazo
    const amount = selectedLiquidationPlan === '4meses' ? (service?.cost || 0) : (service?.optionCost || 0);
    console.log('costoTotal - amount (visa americana):', amount);
    return amount;
  };
  console.log('Total del costo del tramite:',  costoTotal());

  // AQUI SE OBTIENE EL MONTO PENDIENTE DE LIQUIDACION
  const pendienteLiquidar = () => {
    if (!serviceInfo.isVisaAmericana || validatedPaymentType !== 'adelanto') {
      return 0;
    }
    
    const totalCost = costoTotal();
    const advanceAmount = currentPaymentOption?.amount || service?.cashAdvance || 0;
    
    const pending = Math.max(0, totalCost - advanceAmount);
    console.log('pendienteLiquidar - totalCost:', totalCost, 'advanceAmount:', advanceAmount, 'pending:', pending);
    return pending;
  };
    console.log('Lo que se tiene que liquidar:', pendienteLiquidar());

 

  return {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    selectedLiquidationPlan,
    setSelectedLiquidationPlan,
    validatedPaymentType,
    currentPaymentOption,
    costoTotal,
    pendienteLiquidar,
  };
};