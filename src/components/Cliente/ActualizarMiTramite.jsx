import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC, obtenerLosPasos } from './../../api/api.js';

export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const citaCas = cliente?.transact?.cas === true;
    const citaCon = cliente?.transact?.con === true;
    const citaSimulacion = cliente?.transact?.simulation === true;

    const [nombreDelPaso, setNombreDelPaso] = useState('');

    const schema = yup.object().shape({
        advance: yup.boolean().required('Campo obligatorio'),
        dateCas: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr))
            .test('required-if-cas', 'Campo obligatorio', function (value) {
                return !citaCas || !!value;
            }),
        dateCon: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr))
            .test('required-if-con', 'Campo obligatorio', function (value) {
                return !citaCon || !!value;
            }),
        dateSimulation: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr))
            .test('required-if-simulation', 'Campo obligatorio', function (value) {
                return !citaSimulacion || !!value;
            }),
        dateStart: yup.date().required('Campo obligatorio'),
        emailAcces: yup.string().email('Correo inválido').required('Campo obligatorio'),
        haveSimulation: yup.number().required('Campo obligatorio'),
        paid: yup.number().when('advance', {
            is: true,
            then: () => yup.number().required('Campo obligatorio'),
            otherwise: () => yup.number().notRequired().nullable(),
        }),
        paidAll: yup.number().required('Campo obligatorio'),
        status: yup.number().required('Campo obligatorio'),
        stepProgress: yup.number().required('Campo obligatorio'),
        passwordAcces: yup.string().required('Campo obligatorio')
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

    // Obtener nombre del paso actual según el stepProgress
    useEffect(() => {
        const obtenerPasoActual = async () => {
            if (cliente?.idTransact && cliente?.stepProgress != null) {
                try {
                    const resultado = await obtenerLosPasos(cliente.idTransact);
                    const pasos = resultado?.response?.StepsTransacts || [];
                    const pasoActual = pasos.find(p => p.stepNumber === cliente.stepProgress);
                    setNombreDelPaso(pasoActual?.name || 'Paso no encontrado');
                } catch (error) {
                    console.error('Error al obtener el paso actual', error);
                    setNombreDelPaso('Error al cargar paso');
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
                ...data,
                dateCas: formatDate(data.dateCas),
                dateCon: formatDate(data.dateCon),
                dateSimulation: formatDate(data.dateSimulation),
                dateStart: formatDate(data.dateStart),
                advance: data.advance ? 1 : 0,
                haveSimulation: Number(data.haveSimulation),
                paid: data.advance ? data.paid : null,
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="Titulo">Actualizar Trámite</Modal.Title>
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
                        <input type="text" className="form-control" value={cliente?.dateCas ?? ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Cita CON:</label>
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
                        <label>Simulación:</label>
                        <input type="text" className="form-control" value={cliente?.dateSimulation ?? ''} disabled />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cerrar <MdClose /></Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
