import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC } from './../../api/api.js';

const schema = yup.object().shape({
    advance: yup.boolean().required('Campo obligatorio'),
    dateCas: yup.date().required('Campo obligatorio'),
    dateCon: yup.date().required('Campo obligatorio'),
    dateSimulation: yup.string().required('Campo obligatorio'),
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
});

export default function ActualizarTramite({ show, onHide, onClienteRegistrado, cliente }) {
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
            const formattedDateSimulation = cliente.dateSimulation
                ? cliente.dateSimulation.replace(' ', 'T').slice(0, 16)
                : '';

            reset({
                advance: cliente.advance,
                dateCas: cliente.dateCas,
                dateCon: cliente.dateCon,
                dateSimulation: formattedDateSimulation,
                dateStart: cliente.dateStart,
                emailAcces: cliente.emailAcces,
                haveSimulation: cliente.haveSimulation,
                paid: cliente.paid,
                paidAll: cliente.paidAll,
                status: cliente.status,
                stepProgress: cliente.stepProgress,
            });
        }
    }, [cliente, reset]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                dateSimulation: data.dateSimulation ? data.dateSimulation.replace('T', ' ') : '',
                advance: data.advance ? 1 : 0, 
                paid: data.advance ? data.paid : null 
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
                        <label>Trámite:</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={cliente?.transact?.name || ''}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>Cliente:</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={cliente?.user?.name || ''}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo de acceso:</label>
                        <input
                            type="email"
                            {...register('emailAcces')}
                            className={`modern-input ${errors.emailAcces ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.emailAcces?.message}</span>
                    </div>
                    <div className="form-group">
                        <label>Progreso:</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={
                                cliente?.stepProgress === 1 ? 'En proceso' :
                                    cliente?.stepProgress === 2 ? 'En espera' :
                                        cliente?.stepProgress === 3 ? 'Falta de pago' :
                                            cliente?.stepProgress === 4 ? 'Terminado' :
                                                cliente?.stepProgress === 5 ? 'Cancelado' :
                                                    cliente?.stepProgress === 6 ? 'Revisar' : ''
                            }
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label>Pago total:</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('paidAll')}
                            className={`modern-input ${errors.paidAll ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.paidAll?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Adelanto:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label>
                                <input
                                    type="radio"
                                    name="advance"
                                    checked={advanceValue === true}
                                    onChange={() => setValue('advance', true, { shouldValidate: true })}
                                />
                                Sí
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="advance"
                                    checked={advanceValue === false}
                                    onChange={() => setValue('advance', false, { shouldValidate: true })}
                                />
                                No
                            </label>
                        </div>
                        {errors.advance && (
                            <span className="error">{errors.advance.message}</span>
                        )}
                    </div>

                    {advanceValue && (
                        <div className="form-group">
                            <label>Pago:</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('paid')}
                                className={`modern-input ${errors.paid ? 'input-error' : ''}`}
                            />
                            <span className="error">{errors.paid?.message}</span>
                        </div>
                    )}



                    <div className="form-group">
                        <label>Cita CAS:</label>
                        <input
                            type="datetime-local"
                            {...register('dateCas')}
                            className={`modern-input ${errors.dateCas ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.dateCas?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Cita CON:</label>
                        <input
                            type="datetime-local"
                            {...register('dateCon')}
                            className={`modern-input ${errors.dateCon ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.dateCon?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Fecha inicio:</label>
                        <input
                            type="date"
                            {...register('dateStart')}
                            className={`modern-input ${errors.dateStart ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.dateStart?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Fecha y Hora Simulación:</label>
                        <input
                            type="datetime-local"
                            {...register('dateSimulation')}
                            className={`modern-input ${errors.dateSimulation ? 'input-error' : ''}`}
                        />
                        <span className="error">{errors.dateSimulation?.message}</span>
                    </div>
                    <div className="form-group">
                        <label>Simulación realizada:</label>
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={watch('haveSimulation') === 1}
                                    onChange={() => setValue('haveSimulation', 1)}
                                />
                                Sí
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={watch('haveSimulation') === 0}
                                    onChange={() => setValue('haveSimulation', 0)}
                                />
                                No
                            </label>
                        </div>
                        <span className="error">{errors.haveSimulation?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Estado:</label>
                        <select
                            {...register('status')}
                            className={`modern-input ${errors.status ? 'input-error' : ''}`}
                        >
                            <option value="1">Iniciado</option>
                            <option value="0">Finalizado</option>
                        </select>
                        <span className="error">{errors.status?.message}</span>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar <MdClose />
                    </Button>
                    <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>
                        Guardar <FaCheck />
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}