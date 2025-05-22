import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC, obtenerLosPasos, cancelarCita } from './../../api/api.js';

export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const citaCas = cliente?.transact?.cas === true;
    const citaCon = cliente?.transact?.con === true;
    const citaSimulacion = cliente?.transact?.simulation === true;

    const [nombreDelPaso, setNombreDelPaso] = useState('');
    const [descripcionDelPaso, setDescripcionDelPaso] = useState('');
    const [mensaje, setMensaje] = useState();


    const schema = yup.object().shape({
    dateSimulation: yup
        .date()
        .nullable()
        .required('Campo obligatorio')
        .min(new Date(), 'La fecha debe ser posterior a la fecha actual')
    });


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    const advanceValue = watch('advance');

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
                if(response.success){
                Swal.fire({
                    icon: 'success',
                    title: 'Cita cancelada exitosamente',
                    confirmButtonText: 'Aceptar',
                });
                if (typeof onClienteRegistrado === 'function') {
                    onClienteRegistrado();
                }
                onHide();
            }else{
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
                            <label>Cita simulation:</label>
                            <input
                                type="datetime-local"
                                {...register('dateSimulation')}
                                className={`modern-input ${errors.dateSimulation ? 'input-error' : ''}`}
                            />
                            <span className="error">{errors.dateSimulation?.message}</span>
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
