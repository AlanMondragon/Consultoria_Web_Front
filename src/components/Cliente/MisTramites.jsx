import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarUser.jsx';
import { Table, Button, Form, Spinner, Image } from 'react-bootstrap';
import { tramitesPorId, actualizarT } from './../../api/api.js';
import styles from './../../styles/MisTramites.module.css';
import ModalActualizarTramite from './ActualizarMiTramite.jsx';

export default function AdministradorTramites() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [usuario, setUsuario] = useState('');
  const itemsPorPagina = 7;

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

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        navigate('/MisTramites-sm');
      }
    };

    handleResize(); // Checar tamaño inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await tramitesPorId(usuario);
      if (response.success && Array.isArray(response.response.transactProgresses)) {
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

  return (
    <div className={styles.container}>
      <div className='fixed-top'>
        <Navbar title={"- Mis Tramites"} />
      </div>

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
          className={styles.selectState}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
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
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped hover responsive className={styles.tablaDatos}>
          <thead>
            <tr>
              <th>#</th>
              <th>Imagen</th>
              <th>Trámite</th>
              <th>Inicio del trámite</th>
              <th>Cita CAS</th>
              <th>Cita CON</th>
              <th>Pago</th>
              <th>Restante</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {datosPaginados.map((cliente, index) => (
              <tr key={cliente.idTransactProgress}>
                <td>{(paginaActual - 1) * itemsPorPagina + index + 1}</td>
                <td>
                  <Image
                    src={cliente.transact.image}
                    className={styles.tableImage}
                    rounded
                  />
                </td>
                <td>{cliente.transact.description}</td>
                <td>{cliente.dateStart}</td>
                <td>{cliente.dateCas ? cliente.dateCas : "No aplica/En espera"}</td>
                <td >{cliente.dateCon ? cliente.dateCon : "No aplica/En espera"}</td>     
                <td style={{ color: '#38b2ac', fontWeight: 'bold' }}>${cliente.paid}</td>
                <td style={{ color: (cliente.paidAll - cliente.paid) === 0 ? '#11a553' : '#e53e3e', fontWeight: 'bold' }}>
                  {(cliente.paidAll - cliente.paid) === 0 ? "Pagado" : `$${cliente.paidAll - cliente.paid}`}
                </td>

                <td>
                  {cliente.status === 1 ? 'En proceso' :
                    cliente.status === 2 ? 'En espera' :
                      cliente.status === 3 ? 'Falta de pago' :
                        cliente.status === 4 ? 'Terminado' :
                          cliente.status === 5 ? 'Cancelado' :
                            cliente.status === 6 ? 'Revisar' : 'Desconocido'}
                </td>

                <td>
                  <Button
                    variant="success"
                    className={styles.actionButton}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowModalA(true);
                    }}
                  >
                    Más info
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className={styles.paginationContainer}>
        <Button
          variant="outline-primary"
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          Anterior
        </Button>

        {[...Array(totalPaginas)].map((_, i) => (
          <Button
            key={i}
            variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
            onClick={() => cambiarPagina(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          variant="outline-primary"
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}