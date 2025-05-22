import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarUser.jsx';
import { Button, Form, Spinner, Image, Card, Badge } from 'react-bootstrap';
import { tramitesPorId, actualizarT } from './../../api/api.js';
import styles from './../../styles/MisTramites.module.css';
import ModalActualizarTramite from './ActualizarMiTramite.jsx';

export default function AdministradorTramites() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [usuario, setUsuario] = useState('');
  const itemsPorPagina = 6; // Cambiado a 6 para mejor disposición en cards

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsuario(decoded.idUser);
      if (decoded.role !== "USER") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a esta página.',
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (usuario) {
      fetchServices();
    }
  }, [usuario]);

  const fetchServices = async () => {
    try {
      const response = await tramitesPorId(usuario);
      if (response.success && Array.isArray(response.response.transactProgresses)) {
        console.log("Datos obtenidos:", response.response.transactProgresses);
        setDatos(response.response.transactProgresses);

      } else {
        console.error("Formato de respuesta inesperado:", response);
        setDatos([]);
      }
    } catch (error) {
      console.error("Error al obtener los tramites:", error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleStatusChange = async (idTransactProgress, nuevoEstado) => {
    try {
      await actualizarT(idTransactProgress, nuevoEstado);
      mensaje(nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error("Error al actualizar el estado del tramite", error);
    }
  };

  const filtrados = datos.filter(d => {
    const busquedaStr = busqueda.toLowerCase();
    const coincideBusqueda =
      d.transact?.name?.toLowerCase().includes(busquedaStr) ||
      d.emailAcces?.toLowerCase().includes(busquedaStr);

    const coincideEstado = estadoSeleccionado === "" || d.status.toString() === estadoSeleccionado;

    return coincideBusqueda && coincideEstado;
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

  function mensaje(numero) {
    let valor = "";
    switch (numero) {
      case 1: valor = "En proceso"; break;
      case 2: valor = "En espera"; break;
      case 3: valor = "Falta de pago"; break;
      case 4: valor = "Terminado"; break;
      case 5: valor = "Cancelado"; break;
      case 6: valor = "Revisar"; break;
      default: valor = "Desconocido";
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Estado actualizado: ${valor}`,
    });
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      1: { variant: 'primary', text: 'En proceso' },
      2: { variant: 'warning', text: 'En espera' },
      3: { variant: 'danger', text: 'Falta de pago' },
      4: { variant: 'success', text: 'Terminado' },
      5: { variant: 'secondary', text: 'Cancelado' },
      6: { variant: 'info', text: 'Revisar' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Desconocido' };
    return <Badge bg={config.variant} className={styles.statusBadge}>{config.text}</Badge>;
  };

  return (
    <div className={styles.container}>
      <Navbar title={"- Mis Trámites"} />

      <div className={styles.searchContainer}>
        <Form.Control
          type="text"
          placeholder="Buscar trámite o email..."
          className={styles.searchInput}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Form.Select
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todos</option>
          <option value="1">En proceso</option>
          <option value="2">En espera</option>
          <option value="3">Falta de pago</option>
          <option value="4">Terminado</option>
          <option value="5">Cancelado</option>
          <option value="6">Revisar</option>
        </Form.Select>
      </div>

      <ModalActualizarTramite
        show={showModalA}
        onHide={() => setShowModalA(false)}
        onClienteRegistrado={fetchServices}
        cliente={clienteSeleccionado}
      />

      {cargando ? (
        <div className={styles.loadingContainer}>
          <Spinner animation="border" size="lg" />
          <p className="mt-3">Cargando trámites...</p>
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          {datosPaginados.length === 0 ? (
            <div className={styles.noResults}>
              <p>No se encontraron trámites que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            datosPaginados.map((cliente, index) => (
              <Card key={cliente.idTransactProgress} className={styles.tramiteCard}>
                <div className={styles.cardHeader}>
                  {getStatusBadge(cliente.status)}
                </div>
                
                <Card.Body className={styles.cardBody}>
                  <div className={styles.cardContent}>
                    <Card.Title className={styles.cardTitle}>
                      {cliente.transact.description}
                    </Card.Title>

                    <div className={styles.cardImageContainer}>
                    <Image
                      src={cliente.transact.image}
                      className={styles.cardImage}
                      rounded
                    />
                  </div>
                    
                    <div className={styles.cardDetails}>
                      <div className={styles.detailItem}>
                        <strong>Inicio:</strong>
                        <span>{cliente.dateStart}</span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <strong>Cita CAS:</strong>
                        <span>{cliente.dateCas || "No aplica/En espera"}</span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <strong>Cita CON:</strong>
                        <span>{cliente.dateCon || "No aplica/En espera"}</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
                
                <Card.Footer className={styles.cardFooter}>
                  <Button
                    variant="success"
                    className={styles.actionButton}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowModalA(true);
                    }}
                  >
                    Ver más información
                  </Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className={styles.paginationContainer}>
          <Button
            variant="outline-primary"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className={styles.paginationButton}
          >
            ← Anterior
          </Button>

          <div className={styles.pageNumbers}>
            {[...Array(totalPaginas)].map((_, i) => (
              <Button
                key={i}
                variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
                onClick={() => cambiarPagina(i + 1)}
                className={styles.pageNumber}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline-primary"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className={styles.paginationButton}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}