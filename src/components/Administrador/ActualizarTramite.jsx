import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC } from './../../api/api.js';

export default function ActualizarTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const citaCas = cliente?.transact?.cas === true;
    const citaCon = cliente?.transact?.con === true;
    const citaSimulacion = cliente?.transact?.simulation === true;

    const schema = yup.object().shape({
    advance: yup.boolean().nullable(),
    dateCas: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    dateCon: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    dateSimulation: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    dateStart: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    emailAcces: yup
        .string()
        .email('Correo inválido')
        .nullable()
        .notRequired(),
    haveSimulation: yup.number().nullable(),
    paid: yup
        .number()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    paidAll: yup
        .number()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
    status: yup
        .number()
        .nullable(),
    stepProgress: yup
        .number()
        .nullable(),
    passwordAcces: yup
        .string()
        .nullable()
        .notRequired()
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
                passwordAcces : cliente.passwordAcces,
                stepProgress: cliente.stepProgress,
            });
        }
    }, [cliente, reset]);

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
                title: 'Datos guardados',
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
                        <input type="text" className="form-control modern-input" value={cliente?.transact?.name || ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Cliente:</label>
                        <input type="text" className="form-control modern-input" value={cliente?.user?.name || ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Correo de acceso:</label>
                        <input type="email" {...register('emailAcces')} className={`modern-input ${errors.emailAcces ? 'input-error' : ''}`} />
                        <span className="error">{errors.emailAcces?.message}</span>
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input type="password" {...register('passwordAcces')} className={`modern-input ${errors.passwordAcces ? 'input-error' : ''}`} />
                        <span className="error">{errors.passwordAcces?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Progreso:</label>
                        <input type="text" className="form-control modern-input" value={
                            cliente?.stepProgress === 1 ? 'En proceso' :
                            cliente?.stepProgress === 2 ? 'En espera' :
                            cliente?.stepProgress === 3 ? 'Falta de pago' :
                            cliente?.stepProgress === 4 ? 'Terminado' :
                            cliente?.stepProgress === 5 ? 'Cancelado' :
                            cliente?.stepProgress === 6 ? 'Revisar' : ''
                        } disabled />
                    </div>

                    <div className="form-group">
                        <label>Pago total:</label>
                        <input type="number" step="0.01" {...register('paidAll')} className={`modern-input ${errors.paidAll ? 'input-error' : ''}`} />
                        <span className="error">{errors.paidAll?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Adelanto:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label><input type="radio" name="advance" checked={advanceValue === true} onChange={() => setValue('advance', true)} /> Sí</label>
                            <label><input type="radio" name="advance" checked={advanceValue === false} onChange={() => setValue('advance', false)} /> No</label>
                        </div>
                        <span className="error">{errors.advance?.message}</span>
                    </div>

                    {advanceValue && (
                        <div className="form-group">
                            <label>Monto de Pago:</label>
                            <input type="number" step="0.01" {...register('paid')} className={`modern-input ${errors.paid ? 'input-error' : ''}`} />
                            <span className="error">{errors.paid?.message}</span>
                        </div>
                    )}

                    {citaCas && (
                        <div className="form-group">
                            <label>Cita CAS:</label>
                            <input type="datetime-local" {...register('dateCas')} className={`modern-input ${errors.dateCas ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateCas?.message}</span>
                        </div>
                    )}

                    {citaCon && (
                        <div className="form-group">
                            <label>Cita CON:</label>
                            <input type="datetime-local" {...register('dateCon')} className={`modern-input ${errors.dateCon ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateCon?.message}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Fecha inicio:</label>
                        <input type="date" {...register('dateStart')} className={`modern-input ${errors.dateStart ? 'input-error' : ''}`} />
                        <span className="error">{errors.dateStart?.message}</span>
                    </div>

                    {citaSimulacion && (
                        <div className="form-group">
                            <label>Fecha y Hora Simulación:</label>
                            <input type="datetime-local" {...register('dateSimulation')} className={`modern-input ${errors.dateSimulation ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateSimulation?.message}</span>
                        </div>
                    )}

                    {citaSimulacion && (
                        <div className="form-group">
                            <label>Simulación realizada:</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" checked={watch('haveSimulation') === 1} onChange={() => setValue('haveSimulation', 1)} /> Sí</label>
                                <label><input type="checkbox" checked={watch('haveSimulation') === 0} onChange={() => setValue('haveSimulation', 0)} /> No</label>
                            </div>
                            <span className="error">{errors.haveSimulation?.message}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Estado:</label>
                        <select {...register('status')} className={`modern-input ${errors.status ? 'input-error' : ''}`}>
                            <option value="1">Iniciado</option>
                            <option value="0">Finalizado</option>
                        </select>
                        <span className="error">{errors.status?.message}</span>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar <MdClose /></Button>
                    <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>Guardar <FaCheck /></Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
