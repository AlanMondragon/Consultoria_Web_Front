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
import NavbarAdmin from '../NavbarUser.jsx';

const DateTimeSelector = ({ value, onChange, fechasOcupadas, className, error }) => {
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
        const selectedDateObj = new Date(selectedDateStr);
        const isToday = selectedDateObj.toDateString() === today.toDateString();

        // Horarios de trabajo (9:00 AM a 12:00 AM - Medianoche)
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

    // MODIFICADO: Lógica de generación de horas disponibles simplificada para mayor claridad y robustez.
    const generateAvailableHours = (selectedDateStr) => {
        if (!selectedDateStr) {
            setAvailableHours([]);
            setAllHours([]);
            return;
        }

        const possibleHours = generateAllPossibleHours(selectedDateStr);
        setAllHours(possibleHours); // Guarda todas las horas para mostrarlas en el dropdown

        const selectedDateObj = new Date(selectedDateStr);

        // Crea un Set (conjunto) de horas ocupadas para una búsqueda más eficiente.
        const occupiedTimes = new Set(
            fechasOcupadas
                .map(f => new Date(f)) // Convierte string a objeto Date
                .filter(d => d.toDateString() === selectedDateObj.toDateString()) // Filtra solo las del día seleccionado
                .map(d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`) // Formatea a "HH:mm"
        );

        // Filtra las horas posibles, quedándose solo con las que NO están en el set de horas ocupadas.
        const available = possibleHours.filter(hour => !occupiedTimes.has(hour));

        setAvailableHours(available);
    };


    useEffect(() => {
        generateAvailableHours(selectedDate);
    }, [selectedDate, fechasOcupadas]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSelectedTime('');

        // La llamada a onChange se hace en handleTimeChange para asegurar que ambos valores están presentes
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setSelectedTime(newTime);

        if (selectedDate && newTime) {
            const dateTime = `${selectedDate}T${newTime}`;
            onChange(dateTime);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Función que verifica si una hora específica está en la lista de horas disponibles.
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
                        {allHours.map(hour => (
                            <option
                                key={hour}
                                value={hour}
                                // Aquí está la lógica clave: se deshabilita la opción si la hora no está disponible.
                                disabled={!isHourAvailable(hour)}
                                style={{
                                    // El estilo visual ayuda a diferenciar las horas disponibles de las que no.
                                    color: isHourAvailable(hour) ? 'inherit' : '#999',
                                    backgroundColor: isHourAvailable(hour) ? 'white' : '#f2f2f2'
                                }}
                            >
                                {hour} {!isHourAvailable(hour) && ' (Ocupado)'}
                            </option>
                        ))}
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
        </div>
    );
};


export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    // ... (El resto del componente ActualizarMiTramite no necesita cambios y permanece igual)
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
        // VALIDACIONES ADICIONALES DEL SEGUNDO CÓDIGO
        if (data.dateSimulation) {
            const nuevaFecha = new Date(data.dateSimulation);

            // Filtrar todas las fechas ya ocupadas en la base de datos para el mismo día, excluyendo la cita actual si la estás actualizando
            const ocupadasMismaFecha = fechasOcupadas
                .filter(f => {
                    if (!f) return false;
                    const ocupada = new Date(f);
                    return ocupada.toDateString() === nuevaFecha.toDateString() &&
                        ocupada.getTime() !== new Date(cliente.dateSimulation || '').getTime();
                })
                .map(f => new Date(f));

            // Comprobar si hay una hora libre (1 hora de separación con cada cita existente de ese día)
            const cumpleSeparacion = ocupadasMismaFecha.every(ocupada => {
                const diffMinutos = Math.abs((nuevaFecha - ocupada) / 60000);
                return diffMinutos >= 60; // al menos 1 hora de diferencia
            });

            if (!cumpleSeparacion) {
                // Verificar si no hay ninguna posible hora para ese día
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
                return; // No continuar con la actualización
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