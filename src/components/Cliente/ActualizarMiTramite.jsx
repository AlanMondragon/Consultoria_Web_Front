import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import * as yup from 'yup';
import { jwtDecode } from 'jwt-decode';

import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck, FaCreditCard } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC, obtenerLosPasos, cancelarCita, getAllDates, servicios } from './../../api/api.js';
import CheckoutForm from '../Pagos.jsx';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);
const token = localStorage.getItem("token");
const decoded = jwtDecode(token);

const StripePaymentModal = ({ show, onHide, onPaymentSuccess, amount = 99, clienteInfo, pendingDateTime }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePaymentSuccess = (paymentResult) => {
        console.log('Pago exitoso:', paymentResult);
        setIsProcessing(false);
        onHide();
        if (onPaymentSuccess) {
            onPaymentSuccess(paymentResult, pendingDateTime); // Pasamos la fecha/hora pendiente
        }
    };
    const handlePaymentCancel = () => {
        // Limpia el estado relacionado con el pago extra si aplica
        setShowStripeModal(false);
        setPendingDateTime(null);
        setIsPaymentRequired(false);
        setExtraChargeClientInfo(null);
    };


    const handlePaymentError = (error) => {
        console.error('Error en el pago:', error);
        setIsProcessing(false);
        // NO cerramos el modal en caso de error para que el usuario pueda intentar de nuevo
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaCreditCard className="me-2" />
                    Cobro Extra - Cita después de las 21:00
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="alert alert-info">
                    <strong>Cobro adicional:</strong> $1,000 MXN por cita programada después de las 21:00 horas.
                </div>

                <div className="alert alert-warning mt-3 mb-3">
                    <strong>Total a pagar:</strong> $1,000.00 MXN
                </div>

                {pendingDateTime && (
                    <div className="alert alert-secondary">
                        <strong>Fecha y hora seleccionada:</strong> {new Date(pendingDateTime).toLocaleString('es-MX')}
                    </div>
                )}

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        amount={amount}
                        description={`Cobro Extra - Cita después de las 21:00`}
                        idProductoTransaccion={clienteInfo?.idTransact || clienteInfo?.tramite_id}
                        userEmail={decoded.sub || 'nohaycorreo@gmail.com'}
                        customer={decoded.idUser || 'N/A'}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        serviceName={`Cobro Extra - Cliente: ${decoded.sub || 'N/A'}`}
                        disabled={isProcessing}
                        selectedDate={pendingDateTime}
                        service="hora_extra"
                        idTransactProgress={clienteInfo?.idTransactProgress || 'N/A'}
                    />
                </Elements>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isProcessing}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const DateTimeSelector = ({ value, onChange, fechasOcupadas, className, error, onExtraChargeRequired }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableHours, setAvailableHours] = useState([]);
    const [allHours, setAllHours] = useState([]);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            setSelectedDate(dateStr);
            setSelectedTime(timeStr);
        }
    }, [value]);

    const generateAllPossibleHours = (selectedDateStr) => {
        if (!selectedDateStr) return [];

        const today = new Date();
        const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
        const isToday = selectedDateObj.toDateString() === today.toDateString();

        const startHour = isToday ? Math.max(9, today.getHours() + 1) : 9;
        const endHour = 24;

        const hours = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 60) {
                hours.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return hours;
    };

    const generateAvailableHours = (selectedDateStr) => {
        if (!selectedDateStr) {
            setAvailableHours([]);
            setAllHours([]);
            return;
        }

        const possibleHours = generateAllPossibleHours(selectedDateStr);
        setAllHours(possibleHours);

        const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
        const selectedDateString = selectedDateObj.toDateString();

        const occupiedTimes = new Set();

        fechasOcupadas.forEach(fechaOcupada => {
            if (!fechaOcupada) return;

            const fechaOcupadaObj = new Date(fechaOcupada);
            const fechaOcupadaString = fechaOcupadaObj.toDateString();

            if (fechaOcupadaString === selectedDateString) {
                const horaFormateada = `${String(fechaOcupadaObj.getHours()).padStart(2, '0')}:${String(fechaOcupadaObj.getMinutes()).padStart(2, '0')}`;
                occupiedTimes.add(horaFormateada);
            }
        });

        const available = possibleHours.filter(hour => !occupiedTimes.has(hour));
        setAvailableHours(available);
    };

    useEffect(() => {
        generateAvailableHours(selectedDate);
    }, [selectedDate, fechasOcupadas]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];

        // Validar que la fecha sea actual o posterior
        if (newDate < today) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha inválida',
                text: 'Por favor, selecciona una fecha actual o posterior.',
            });
            return;
        }

        setSelectedDate(newDate);
        setSelectedTime('');
        // Limpiar el valor en el formulario cuando se cambia la fecha
        onChange('');
    };


    const handleTimeChange = (e) => {
        const newTime = e.target.value;

        if (!selectedDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona una fecha',
                text: 'Primero debes seleccionar una fecha válida.',
            });
            return;
        }

        setSelectedTime(newTime);

        if (selectedDate && newTime) {
            const dateTime = `${selectedDate}T${newTime}`;

            const hourNumber = parseInt(newTime.split(':')[0]);
            if (hourNumber >= 21) {
                // Mostrar alerta y manejar cobro extra
                Swal.fire({
                    icon: 'warning',
                    title: 'Cobro Extra',
                    text: 'Si la hora excede de las 21:00 (9:00 PM) se aplicará un costo extra de $1,000 MXN.',
                    showCancelButton: true,
                    confirmButtonText: 'Cancelar selección',
                    cancelButtonText: 'Acepto el cobro extra',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Usuario cancela la selección
                        setSelectedTime('');
                        onChange(''); // Limpiar el valor en el formulario
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        // Usuario acepta el cobro extra - MANTENER la fecha/hora temporalmente
                        // NO actualizar el formulario aún, pero mantener el estado local
                        if (result.dismiss === Swal.DismissReason.cancel) {
                            // Usuario acepta el cobro extra - se guarda en el form y se dispara modal de pago
                            if (onExtraChargeRequired) {
                                onExtraChargeRequired(dateTime);
                            }
                            onChange(dateTime); // <-- ✅ Esta línea garantiza que no se pierda
                        }
                        // NO limpiar selectedTime aquí para que se mantenga visible
                    }
                });
            } else {
                // Hora normal, sin cobro extra - actualizar inmediatamente
                onChange(dateTime);
            }
        }
    };
    const handlePaymentCancel = () => {
        // Limpia la fecha/hora del formulario y del pendingDateTime
        setValue('dateSimulation', '');
        setPendingDateTime(null);
        setIsPaymentRequired(false);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isHourAvailable = (hour) => {
        return availableHours.includes(hour);
    };

    const allHoursOccupied = selectedDate && allHours.length > 0 && availableHours.length === 0;

    return (
        <div>
            <div className="row">
                <div className="col-md-6">
                    <label>Fecha:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={getMinDate()}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                    />
                </div>
                <div className="col-md-6">
                    <label>Hora:</label>
                    <select
                        value={selectedTime}
                        onChange={handleTimeChange}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        disabled={!selectedDate || allHoursOccupied}
                    >
                        <option value="">Selecciona una hora</option>
                        {allHours.map(hour => {
                            const hourNumber = parseInt(hour.split(':')[0]);
                            const isExtraCharge = hourNumber >= 21;
                            return (
                                <option
                                    key={hour}
                                    value={hour}
                                    disabled={!isHourAvailable(hour)}
                                    style={{
                                        color: isExtraCharge ? '#ff6b35' : (isHourAvailable(hour) ? 'inherit' : '#999'),
                                        backgroundColor: isExtraCharge ? '#fff3e0' : (isHourAvailable(hour) ? 'white' : '#f2f2f2'),
                                        fontWeight: isExtraCharge ? 'bold' : 'normal'
                                    }}
                                >
                                    {hour}
                                    {!isHourAvailable(hour) && ' (Ocupado)'}
                                    {isExtraCharge && isHourAvailable(hour) && ' (+$99 MXN)'}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {allHoursOccupied && (
                <div className="mt-2">
                    <small className="text-danger">
                        No hay horarios disponibles para esta fecha.
                    </small>
                </div>
            )}

            <div className="mt-2">
                <small className="text-info">
                    <strong>ℹ️ Información:</strong>
                    <br />
                    • Horario de atención: 9:00 AM - 12:00 AM
                    <br />
                    • Cada cita dura aproximadamente 1 hora
                    <br />
                    • <span className="text-warning"><strong>Citas después de las 21:00 tienen un costo extra de $99 MXN</strong></span>
                    <br />
                    {selectedDate && (
                        <small className="text-info">
                            Fecha: {selectedDate} |
                            Horas totales: {allHours.length} |
                            Horas disponibles: {availableHours.length} |
                            Horas ocupadas: {allHours.length - availableHours.length}
                        </small>
                    )}
                </small>
            </div>
        </div>
    );
};

export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const citaCas = cliente?.transact?.cas === true;
    const citaCon = cliente?.transact?.con === true;
    const citaSimulacion = cliente?.transact?.simulation === true;

    const [nombreDelPaso, setNombreDelPaso] = useState('');
    const [descripcionDelPaso, setDescripcionDelPaso] = useState('');
    const [mensaje, setMensaje] = useState();
    const [fechasOcupadas, setFechasOcupadas] = useState([]);

    // Estados para el modal de Stripe
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [pendingDateTime, setPendingDateTime] = useState(null); // Fecha/hora pendiente de confirmación
    const [extraChargeClientInfo, setExtraChargeClientInfo] = useState(null);
    const [isPaymentRequired, setIsPaymentRequired] = useState(false); // Flag para saber si se requiere pago

    const schema = yup.object().shape({
        dateSimulation: yup
            .string()
            .nullable()
            .required('Debes seleccionar una fecha y hora')
            .test('valid-datetime', 'Fecha y hora no válidas', (value) => {
                if (!value) return false;
                const date = new Date(value);
                return date > new Date();
            })
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    const advanceValue = watch('advance');
    const currentDateSimulation = watch('dateSimulation');

    // Obtener fechas ocupadas del endpoint
    useEffect(() => {
        const obtenerFechasOcupadas = async () => {
            try {
                const response = await getAllDates();
                if (response.success && response.response?.transactProgresses) {
                    const fechas = response.response.transactProgresses
                        .map(item => item.dateSimulation)
                        .filter(fecha => fecha !== null && fecha !== undefined);

                    setFechasOcupadas(fechas);
                    console.log('Fechas ocupadas cargadas:', fechas);
                }
            } catch (error) {
                console.error('Error al obtener fechas ocupadas:', error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Advertencia',
                    text: 'No se pudieron cargar las fechas ocupadas. Verifica manualmente los horarios.',
                });
            }
        };

        if (show) {
            obtenerFechasOcupadas();
        }
    }, [show]);

    useEffect(() => {
        if (cliente) {
            const formattedCas = cliente.dateCas
                ? cliente.dateCas.replace(' ', 'T').slice(0, 16)
                : '';
            const formattedCon = cliente.dateCon
                ? cliente.dateCon.replace(' ', 'T').slice(0, 16)
                : '';
            const formattedSimulacion = cliente.dateSimulation
                ? cliente.dateSimulation.replace(' ', 'T').slice(0, 16)
                : '';

            reset({
                advance: cliente.advance,
                dateCas: formattedCas,
                dateCon: formattedCon,
                dateSimulation: formattedSimulacion,
                dateStart: cliente.dateStart,
                emailAcces: cliente.emailAcces,
                haveSimulation: cliente.haveSimulation,
                paid: cliente.paid,
                paidAll: cliente.paidAll,
                status: cliente.status,
                passwordAcces: cliente.passwordAcces,
                stepProgress: cliente.stepProgress,
            });

            // Resetear estados de pago cuando se carga un nuevo cliente
            setIsPaymentRequired(false);
            setPendingDateTime(null);
        }
    }, [cliente, reset]);

    useEffect(() => {
        const obtenerPasoActual = async () => {
            if (cliente?.transact?.idTransact && cliente?.stepProgress != null) {
                try {
                    const resultado = await obtenerLosPasos(cliente.transact.idTransact);
                    const pasos = resultado?.response?.StepsTransacts || [];
                    const pasoActual = pasos.find(p => p.stepNumber === cliente.stepProgress);

                    setNombreDelPaso(pasoActual?.name?.trim() || 'Paso no encontrado');
                    setDescripcionDelPaso(pasoActual?.description?.trim() || 'Sin descripción');
                } catch (error) {
                    console.error('Error al obtener el paso actual', error);
                    setNombreDelPaso('Error al cargar paso');
                    setDescripcionDelPaso('Error al cargar descripción');
                }
            }
        };
        obtenerPasoActual();
    }, [cliente]);

    // Función para manejar cuando se requiere cobro extra
    const handleExtraChargeRequired = (dateTime) => {
        console.log('Se requiere cobro extra para:', dateTime);
        setPendingDateTime(dateTime); // Guardamos la fecha/hora pendiente
        setIsPaymentRequired(true); // Marcamos que se requiere pago

        // Preparar la información del cliente para el pago
        const clienteInfo = {
            id: cliente?.idTransactProgress,
            idTransactProgress: cliente?.idTransactProgress,
            name: cliente?.name || 'Cliente',
            email: cliente?.emailAcces || '',
            idTransact: cliente?.transact?.idTransact,
            tramite_id: cliente?.transact?.idTransact,
        };

        console.log('Cliente info para pago:', clienteInfo);
        setExtraChargeClientInfo(clienteInfo);
        setShowStripeModal(true);
    };

    // ✅ Función robusta para manejar el éxito del pago
    const handlePaymentSuccess = (paymentResult, confirmedDateTime) => {
        console.log('✅ Pago exitoso:', paymentResult);
        console.log('✅ Fecha/hora confirmada:', confirmedDateTime);

        // 👉 Asegurarse de tener siempre la fecha/hora correcta en el formulario
        if (confirmedDateTime) {
            setValue('dateSimulation', confirmedDateTime, { shouldValidate: true });
            setPendingDateTime(null);
        }

        // 👉 Marcar que ya no se requiere pago extra
        setIsPaymentRequired(false);

        // Limpiar info temporal del cliente para pago extra
        setExtraChargeClientInfo(null);

        // Mostrar confirmación al usuario
        Swal.fire({
            icon: 'success',
            title: 'Pago exitoso',
            text: 'El cobro extra ha sido procesado exitosamente y tu cita ha sido agendada.',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            // Por seguridad, reestablecer la fecha/hora por si hubo cambios
            if (confirmedDateTime) {
                setValue('dateSimulation', confirmedDateTime, { shouldValidate: true });
            }
        });

        // 👉 Cerrar el modal de Stripe (opcional si aún no lo cierras)
        setShowStripeModal(false);
    };


    const onSubmit = async (data) => {
        if (data.dateSimulation && isPaymentRequired) {
            const selectedHour = new Date(data.dateSimulation).getHours();
            if (selectedHour >= 21) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Pago requerido',
                    text: 'Debes completar el pago del cobro extra antes de continuar.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
        }

        // Validaciones existentes...
        if (data.dateSimulation) {
            const nuevaFecha = new Date(data.dateSimulation);

            const ocupadasMismaFecha = fechasOcupadas
                .filter(f => {
                    if (!f) return false;
                    const ocupada = new Date(f);
                    return ocupada.toDateString() === nuevaFecha.toDateString() &&
                        ocupada.getTime() !== new Date(cliente.dateSimulation || '').getTime();
                })
                .map(f => new Date(f));

            const cumpleSeparacion = ocupadasMismaFecha.every(ocupada => {
                const diffMinutos = Math.abs((nuevaFecha - ocupada) / 60000);
                return diffMinutos >= 60;
            });

            if (!cumpleSeparacion) {
                const startHour = 9;
                const endHour = 24;
                let hayPosibleHora = false;

                for (let hour = startHour; hour < endHour; hour++) {
                    const posibleHora = new Date(nuevaFecha);
                    posibleHora.setHours(hour, 0, 0, 0);
                    const esValida = ocupadasMismaFecha.every(ocupada => {
                        const diffMinutos = Math.abs((posibleHora - ocupada) / 60000);
                        return diffMinutos >= 60;
                    });
                    if (esValida) {
                        hayPosibleHora = true;
                        break;
                    }
                }

                if (!hayPosibleHora) {
                    Swal.fire('Fecha no disponible', 'No hay horarios disponibles para esta fecha', 'error');
                } else {
                    Swal.fire('Hora no disponible', 'La hora seleccionada ya está ocupada. Por favor, elige otra.', 'error');
                }
                return;
            }
        }

        try {
            const formatDate = (date) => {
                if (!date) return null;
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const MM = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
            };

            const payload = {
                advance: data.advance,
                dateCas: formatDate(data.dateCas),
                dateCon: formatDate(data.dateCon),
                dateSimulation: formatDate(data.dateSimulation),
                dateStart: data.dateStart,
                emailAcces: data.emailAcces,
                haveSimulation: data.haveSimulation,
                paid: data.paid,
                paidAll: data.paidAll,
                status: data.status,
                passwordAcces: data.passwordAcces,
                stepProgress: data.stepProgress,
            };

            await actualizarTC(cliente.idTransactProgress, payload);

            Swal.fire({
                icon: 'success',
                title: 'Actualización exitosa',
                confirmButtonText: 'Aceptar',
            });

            if (typeof onClienteRegistrado === 'function') {
                onClienteRegistrado();
            }

            // Resetear estados de pago
            setIsPaymentRequired(false);
            setPendingDateTime(null);

            onHide();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'Error al actualizar',
            });
            console.error(error);
        }
    };

    async function eliminarCita(cliente) {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro que quieres cancelar la cita?',
            text: 'Solamente puedes cancelar la cita una vez',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar cita',
            cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
            try {
                const fechaActual = new Date();
                const fechaCita = new Date(cliente.dateSimulation);
                console.log('Fecha actual:', fechaActual);
                console.log('Fecha de la cita:', fechaCita);
                if (fechaCita < fechaActual) {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede cancelar la cita',
                        text: 'La cita ya ha pasado',
                    });
                    return;
                }
                const response = await cancelarCita(cliente.idTransactProgress);
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cita cancelada exitosamente',
                        confirmButtonText: 'Aceptar',
                    });
                    if (typeof onClienteRegistrado === 'function') {
                        onClienteRegistrado();
                    }
                    onHide();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cancelar la cita',
                        text: response.message,
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cancelar',
                    text: 'No se pudo cancelar la cita',
                });
                console.error(error);
            }
        }
    }

    const handleModalHide = () => {
        // Resetear estados cuando se cierra el modal principal
        setIsPaymentRequired(false);
        setPendingDateTime(null);
        setShowStripeModal(false);
        onHide();
    };

    return (
        <>
            <Modal show={show} onHide={handleModalHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="Titulo" style={{ marginLeft: "350px" }}>
                        {cliente?.transact?.description}
                    </Modal.Title>
                </Modal.Header>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <Modal.Body>
                        <div className="form-group">
                            <label>Imagen:</label>
                            {cliente?.transact?.image ? (
                                <img src={cliente.transact.image} alt="Imagen" style={{ maxWidth: '100%', height: 'auto' }} />
                            ) : (
                                <p>Sin imagen</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Cita CAS:</label>
                            <p>
                                {cliente?.dateCas
                                    ? "Ya cuentas con una cita agendada"
                                    : "No cuentas con cita agendada"}
                            </p>
                            <input type="text" className="form-control" value={cliente?.dateCas ?? ''} disabled />
                        </div>

                        <div className="form-group">
                            <label>Cita CON:</label>
                            <p>
                                {cliente?.dateCon
                                    ? "Ya cuentas con una cita agendada"
                                    : "No cuentas con cita agendada"}
                            </p>
                            <input type="text" className="form-control" value={cliente?.dateCon ?? ''} disabled />
                        </div>

                        <div className="form-group">
                            <label>Pago Adelantado:</label>
                            <input type="text" className="form-control" value={cliente?.paid ?? ''} disabled />
                        </div>

                        <div className="form-group">
                            <label>Pago Total:</label>
                            <input type="text" className="form-control" value={cliente?.paidAll ?? ''} disabled />
                        </div>

                        <div className="form-group">
                            <label>Estado:</label>
                            <input type="text" className="form-control" value={
                                cliente?.status === 1 ? 'En proceso' :
                                    cliente?.status === 2 ? 'En espera' :
                                        cliente?.status === 3 ? 'Falta de pago' :
                                            cliente?.status === 4 ? 'Terminado' :
                                                cliente?.status === 5 ? 'Cancelado' :
                                                    cliente?.status === 6 ? 'Revisar' : ''
                            } disabled />
                        </div>

                        <div className="form-group">
                            <label>Paso del trámite actual:</label>
                            <input type="text" className="form-control" value={nombreDelPaso} disabled />
                        </div>

                        <div className="form-group">
                            <label>Descripción del paso:</label>
                            <input type="text" className="form-control" value={descripcionDelPaso} disabled />
                        </div>



                        <div className="form-group">
                            <p>
                                {cliente?.dateSimulation
                                    ? "Ya cuentas con una cita agendada"
                                    : "No cuentas con cita agendada"}
                            </p>
                            <div className="form-group">
                                <label>Cita de Simulación:</label>
                                <Controller
                                    name="dateSimulation"
                                    control={control}
                                    render={({ field }) => (
                                        <DateTimeSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            fechasOcupadas={fechasOcupadas}
                                            error={errors.dateSimulation}
                                            onExtraChargeRequired={handleExtraChargeRequired}
                                        />
                                    )}
                                />
                                {errors.dateSimulation && (
                                    <span className="text-danger">{errors.dateSimulation.message}</span>
                                )}
                            </div>

                            {cliente?.dateSimulation && (
                                <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={() => eliminarCita(cliente)}
                                >
                                    Cancelar cita
                                </button>
                            )}
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>Cerrar <MdClose /></Button>
                        <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>
                            Guardar <FaCheck />
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Modal de Stripe para cobro extra - CORREGIDO */}
            <StripePaymentModal
                show={showStripeModal}
              onHide={() => setShowStripeModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                amount={99}
                clienteInfo={extraChargeClientInfo}
                pendingDateTime={pendingDateTime}
            />


        </>
    );
}