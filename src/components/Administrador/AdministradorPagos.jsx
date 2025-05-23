import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner, Card, FloatingLabel, Accordion } from 'react-bootstrap';
import { FaInfo, FaPlus, FaFilter } from 'react-icons/fa';
import { getAllPayments, clientePorId, getNameService, statusPayments } from './../../api/api.js';
import styles from '../../styles/AdministradorPagos.module.css';
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
        <div className={styles.pagosContainer}>
            <Navbar title={"Pagos"} />

            <div className={styles.searchContainer}>
                <div className={styles.searchInput}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cliente, trámite o contacto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className={styles.inputField}
                    />
                </div>

                <Form.Select
                    className={styles.filterSelect}
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
                <div className={styles.spinnerContainer}>
                    <Spinner animation="border" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className={styles.emptyResults}>
                    <h4>No se encontraron registros</h4>
                </div>
            ) : (
                <div className="container">
                    {datosPaginados.map((pago, index) => (
                        <Card
                            key={pago.idPayment}
                            className={styles.pagoCard}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardNumber}><strong>#{(paginaActual - 1) * itemsPorPagina + index + 1}</strong></div>
                                <div className={styles.cardTramite}><strong>Trámite:</strong>
                                <p>{pago.transact?.name || 'No disponible'}</p> 
                                </div>
                                <div className={styles.cardCliente}><strong>Cliente:</strong> 
                                <p>{pago.user?.name || 'No disponible'}</p>
                                </div>
                                <div className={styles.cardFecha}><strong>Fecha:</strong>
                                <p>{pago.dateStart} </p>
                                </div>
                                <div className={styles.cardTotal}><strong>Pagado:</strong>
                                 <p className={styles.cardTextCash}>${pago.total?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className={styles.cardTelefono}><strong>Teléfono:</strong> 
                                 <p>{pago.user?.phone || 'N/A'}</p>
                                </div>
                                <div className={styles.cardEstado}>
                                    <div className={styles.statusSwitch}>
                                        <strong>Estado:</strong>
                                        <Form.Check
                                            type="switch"
                                            id={`status-switch-${pago.idPayment}`}
                                            label={pago.status === 1 ? "Activo" : "Inactivo"}
                                            checked={pago.status === 1}
                                            onChange={(e) => handleStatusChange(pago.idPayment, e.target.checked ? 1 : 0, pago.total)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {totalPaginas > 0 && (
                <div className={styles.paginationContainer}>
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