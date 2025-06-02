import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC, obtenerLosPasos, cancelarCita, getAllDates } from './../../api/api.js';

const DateTimeSelector = ({ value, onChange, fechasOcupadas, className, error }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableHours, setAvailableHours] = useState([]);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            setSelectedDate(dateStr);
            setSelectedTime(timeStr);
        }
    }, [value]);

    const generateAvailableHours = (selectedDateStr) => {
        if (!selectedDateStr) {
            setAvailableHours([]);
            return;
        }

        const today = new Date();
        const selectedDateObj = new Date(selectedDateStr);
        const isToday = selectedDateObj.toDateString() === today.toDateString();

        // Horarios de trabajo (9:00 AM a 6:00 PM)
        const startHour = isToday ? Math.max(9, today.getHours() + 1) : 9;
        const endHour = 18;

        const allHours = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 60) {
                allHours.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }

        // Filtrar horarios ocupados
        const occupiedHours = fechasOcupadas
            .filter(fechaOcupada => {
                const ocupadaDate = new Date(fechaOcupada);
                const isSameDate = ocupadaDate.toDateString() === selectedDateObj.toDateString();
                return isSameDate;
            })
            .map(fechaOcupada => {
                const date = new Date(fechaOcupada);
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            });

        // Debug: mostrar horarios ocupados para esta fecha
        console.log(`Fecha seleccionada: ${selectedDateStr}`);
        console.log('Horarios ocupados para esta fecha:', occupiedHours);
        console.log('Todos los horarios posibles:', allHours);

        // Horarios disponibles (excluyendo ocupados y la hora anterior/posterior por el margen de 1 hora)
        const available = allHours.filter(hour => {
            const [hourNum, minuteNum] = hour.split(':').map(Number);

            // Verificar si este horario está ocupado o muy cerca de uno ocupado
            const isBlocked = occupiedHours.some(occupiedHour => {
                const [occupiedHourNum, occupiedMinuteNum] = occupiedHour.split(':').map(Number);

                // Convertir a minutos para comparar más fácil
                const selectedTimeInMinutes = hourNum * 60 + minuteNum;
                const occupiedTimeInMinutes = occupiedHourNum * 60 + occupiedMinuteNum;
                const diffInMinutes = Math.abs(selectedTimeInMinutes - occupiedTimeInMinutes);

                // Bloquear si:
                // 1. Es exactamente la misma hora (diffInMinutes === 0)
                // 2. Está dentro del rango de 1 hora (diffInMinutes < 60)
                return diffInMinutes === 0 || diffInMinutes < 60;
            });

            return !isBlocked;
        });

        setAvailableHours(available);
    };

    useEffect(() => {
        generateAvailableHours(selectedDate);
    }, [selectedDate, fechasOcupadas]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSelectedTime(''); // Reset time when date changes

        if (newDate && selectedTime) {
            const dateTime = `${newDate}T${selectedTime}`;
            onChange(dateTime);
        }
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setSelectedTime(newTime);

        if (selectedDate && newTime) {
            const dateTime = `${selectedDate}T${newTime}`;
            onChange(dateTime);
        }
    };

    // Obtener fecha mínima (hoy)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (

        <div>
            <div className='fixed-top'>
                <Navbar title={"- Servicios"} />
            </div>
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
                        disabled={!selectedDate}
                    >
                        <option value="">Selecciona una hora</option>
                        {availableHours.map(hour => (
                            <option key={hour} value={hour}>
                                {hour}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedDate && availableHours.length === 0 && (
                <div className="mt-2">
                    <small className="text-warning">
                        No hay horarios disponibles para esta fecha
                    </small>
                </div>
            )}
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

    // Obtener fechas ocupadas del endpoint
    useEffect(() => {
        const obtenerFechasOcupadas = async () => {
            try {
                const response = await getAllDates();
                if (response.success && response.response?.transactProgresses) {
                    // Extraer solo las fechas de simulación y filtrar las que no sean null
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
        }
    }, [cliente, reset]);

    // Obtener nombre y descripción del paso actual
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

    const onSubmit = async (data) => {
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="Titulo" style={{ marginLeft: "350px" }}>{cliente?.transact?.description}</Modal.Title>
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
                                    />
                                )}
                            />
                            {errors.dateSimulation && (
                                <span className="text-danger">{errors.dateSimulation.message}</span>
                            )}

                            {/* Información sobre las citas ocupadas */}
                            <div className="mt-2">
                                <small className="text-info">
                                    <strong>ℹ️ Información:</strong>
                                    <br />
                                    • Horario de atención: 9:00 AM - 12:00 AM
                                    <br />
                                    • Cada cita dura aproximadamente 1 hora
                                    <br />
                                    • {fechasOcupadas.length} horarios ya ocupados
                                </small>
                            </div>
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
                    <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>Guardar <FaCheck /></Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}