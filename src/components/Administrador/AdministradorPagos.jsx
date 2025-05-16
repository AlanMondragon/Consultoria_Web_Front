import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner, Card, FloatingLabel, Accordion } from 'react-bootstrap';
import { FaInfo, FaPlus, FaFilter } from 'react-icons/fa';
import { getAllPayments, clientePorId, getNameService, statusPayments } from './../../api/api.js';
import '../../styles/Clientes.css';
import ModalRegistrarTramite from './RegistrarTramite.jsx';
import ModalActualizarTramite from './ActualizarTramite.jsx';

export default function AdministradorPagos() {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showModalA, setShowModalA] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [Datitos, setDatitos] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState(null);
    let [numero, setNumero] = useState(0);

    const itemsPorPagina = 5;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "ADMIN") {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta página.',
                });
                navigate("/");
            } else {
                fetchServices();
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        if (datos.length > 0) {
            console.log("Datos cargados:", datos);
            const sinTramites = datos.filter(d => !d.transact || !d.transact.name);
            if (sinTramites.length > 0) {
                console.warn("Pagos sin datos de trámite:", sinTramites);
            }
        }
    }, [datos]);

    const fetchServices = async () => {
        try {
            setCargando(true);
            const response = await getAllPayments();

            if (response.success && Array.isArray(response.response.payments)) {
                const paymentsData = response.response.payments;
                // Ordenamos los datos por idPayment de forma descendente
                const sortedPayments = paymentsData.sort((a, b) => b.idPayment - a.idPayment);
                const paymentsWithDetails = await Promise.all(
                    sortedPayments.map(async (payment) => {
                        try {
                            const clienteResponse = await clientePorId(payment.idUser);
                            const cliente = clienteResponse.success ? clienteResponse.response.user : null;
                            const nombreTramite = await getNameService(payment.idTransact);
                            return {
                                ...payment,
                                user: cliente,
                                transact: { name: nombreTramite },
                                dateStart: payment.dateStart,
                                total: payment.total
                            };
                        } catch (error) {
                            console.error(`Error al obtener detalles para el pago ${payment.idPayment}:`, error);
                            return {
                                ...payment,
                                user: null,
                                transact: { name: `Trámite #${payment.idTransact}` },
                                dateStart: payment.dateStart,
                                total: payment.total
                            };
                        }
                    })
                );
                setDatos(paymentsWithDetails);
            } else {
                console.error("Formato de respuesta inesperado:", response);
                setDatos([]);
            }
        } catch (error) {
            console.error("Error al obtener los pagos:", error);
            setDatos([]);
        } finally {
            setCargando(false);
        }
    };


    const handleStatusChange = async (idPayment, nuevoEstado, total) => {
        try {
            const response = await statusPayments(idPayment, { status: nuevoEstado, total: total });
            if (response && response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Estado Actualizado',
                    text: `El estado del pago ha sido actualizado a ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}.`,
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchServices();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el estado del pago.',
                });
            }
        } catch (error) {
            console.error("Error al actualizar el estado del pago", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al intentar actualizar el estado.',
            });
        }
    };

    const filtrados = datos.filter(d => {
        const busquedaStr = busqueda.toLowerCase();
        const coincideBusqueda =
            d.user?.name?.toLowerCase().includes(busquedaStr) ||
            d.transact?.name?.toLowerCase().includes(busquedaStr);

        const coincideFiltroEstado =
            filtroEstado === null || d.status === filtroEstado;

        return coincideBusqueda && coincideFiltroEstado;
    });

    const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
    const datosPaginados = filtrados.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const cambiarPagina = (numero) => {
        if (numero >= 1 && numero <= totalPaginas) {
            setPaginaActual(numero);
        }
    };


    return (
        <div style={{ marginTop: '100px', width: '100%', maxWidth: '1000px', overflowX: 'hidden' }}>
            <Navbar title={"- Pagos"} />

            <div className="d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center gap-2 w-75">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cliente, trámite o contacto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ borderRadius: '12px', borderWidth: '2px' }}
                    />
                </div>

                <Form.Select
                    style={{ width: '200px', borderRadius: '12px', borderWidth: '2px' }}
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                >
                    <option value="">Todos</option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                </Form.Select>

            </div>

            <ModalRegistrarTramite
                show={showModal}
                onHide={() => setShowModal(false)}
                onClienteRegistrado={fetchServices}
            />
            <ModalActualizarTramite
                show={showModalA}
                onHide={() => setShowModalA(false)}
                onClienteRegistrado={fetchServices}
                cliente={clienteSeleccionado}
            />

            {cargando ? (
                <div className="text-center p-3">
                    <Spinner animation="border" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className="text-center p-5">
                    <h4>No se encontraron registros</h4>
                </div>
            ) : (
                <div className="container">
                    {datosPaginados.map((pago, index) => (
                        <Card
                            key={pago.idPayment}
                            className="mb-3 p-3 shadow-sm mx-auto" 
                            style={{ borderRadius: '16px', maxWidth: '1100px', overflow: 'hidden' }}
                        >
                            <div className="d-flex justify-content-between align-items-center flex-nowrap">
                                <div style={{ minWidth: '40px' }}><strong>#{(paginaActual - 1) * itemsPorPagina + index + 1}</strong></div>
                                <div style={{ minWidth: '150px', marginLeft: '10px' }}><strong>Trámite:</strong> {pago.transact?.name || 'No disponible'}</div>
                                <div style={{ minWidth: '150px', marginLeft: '10px' }}><strong>Cliente:</strong> {pago.user?.name || 'No disponible'}</div>
                                <div style={{ minWidth: '120px', marginLeft: '10px' }}><strong>Fecha:</strong> { pago.dateStart}</div>
                                <div style={{ minWidth: '80px', marginLeft: 'px' }}><strong>Total:</strong> ${pago.total?.toFixed(2) || '0.00'}</div>
                                <div style={{ minWidth: '120px', marginLeft: '10px' }}><strong>Teléfono:</strong> {pago.user?.phone || 'N/A'}</div>
                                <div className="d-flex align-items-center" style={{ minWidth: '180px', marginLeft: '10px', justifyContent: 'flex-end' }}>
                                    <div style={{ marginRight: '10px' }}>
                                        <strong>Estado:</strong>
                                        <Form.Check
                                            type="switch"
                                            id={`status-switch-${pago.idPayment}`}
                                            label={pago.status === 1 ? "Activo" : "Inactivo"}
                                            checked={pago.status === 1}
                                            onChange={(e) => handleStatusChange(pago.idPayment, e.target.checked ? 1 : 0, pago.total)}
                                            style={{ fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {totalPaginas > 0 && (
                <div className="d-flex justify-content-center align-items-center my-4 gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                    >
                        Anterior
                    </Button>
                    {totalPaginas <= 7 ? (
                        [...Array(totalPaginas)].map((_, i) => (
                            <Button
                                key={i}
                                variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
                                onClick={() => cambiarPagina(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))
                    ) : (
                        <>
                            {paginaActual > 1 && (
                                <Button
                                    variant="outline-primary"
                                    onClick={() => cambiarPagina(1)}
                                >
                                    1
                                </Button>
                            )}

                            {paginaActual > 3 && <span className="mx-1">...</span>}

                            {[...Array(3)].map((_, i) => {
                                const pageNum = Math.max(2, paginaActual - 1) + i;
                                if (pageNum < totalPaginas) {
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={paginaActual === pageNum ? "primary" : "outline-primary"}
                                            onClick={() => cambiarPagina(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                }
                                return null;
                            })}

                            {paginaActual < totalPaginas - 2 && <span className="mx-1">...</span>}

                            {paginaActual < totalPaginas && (
                                <Button
                                    variant="outline-primary"
                                    onClick={() => cambiarPagina(totalPaginas)}
                                >
                                    {totalPaginas}
                                </Button>
                            )}
                        </>
                    )}
                    <Button
                        variant="outline-primary"
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
}