import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { FaInfo, FaPlus } from 'react-icons/fa';
import { trasacciones, actualizarT } from './../../api/api.js';
import '../../styles/Clientes.css';
import ModalRegistrarCliente from './RegistrarCliente.jsx';
import ModalActualizarCliente from './ActualizarTramite.jsx';

export default function TramiteMasInfo() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  let [numero, setNumero] = useState(0);

  const itemsPorPagina = 7;

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
    setPaginaActual(1);
  }, [busqueda]);

  const fetchServices = async () => {
    try {
      const response = await trasacciones();
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
      const result = await actualizarT(idTransactProgress, nuevoEstado);
      setNumero(nuevoEstado);
      mensaje(nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error("Error al actualizar el estado del tramite", error);
    }
  };



  const filtrados = datos.filter(d => {
    const busquedaStr = busqueda.toLowerCase();
    const coincideBusqueda = 
      d.user?.name?.toLowerCase().includes(busquedaStr) ||
      d.user?.phone?.toLowerCase().includes(busquedaStr) ||
      d.emailAcces?.toLowerCase().includes(busquedaStr) ||
      d.transact?.name?.toLowerCase().includes(busquedaStr);
  
    const coincideEstado = estadoSeleccionado === "" || d.stepProgress.toString() === estadoSeleccionado;
  
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
      case 1:
        valor = "En proceso";
        break;
      case 2:
        valor = "En espera";
        break;
      case 3:
        valor = "Falta de pago";
        break;
      case 4:
        valor = "Terminado";
        break;
      case 5:
        valor = "Cancelado";
        break;
      case 6:
        valor = "Revisar";
        break;
      default:
        valor = "Desconocido";
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Estado actualizado: ${valor}`,
    });
  }


  return (
    <div style={{ marginTop: '100px' }}>
      {cargando ? (
        <div className="text-center p-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped hover responsive className="p-3" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Trámite</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Paso del tramite</th>
              <th>Acción</th>
              <th>Más Información</th>
            </tr>
          </thead>
          <tbody>
            {datosPaginados.map((cliente, index) => (
              <tr key={cliente.idTransactProgress}>
                <td>{(paginaActual - 1) * itemsPorPagina + index + 1}</td>
                <td>{cliente.transact.name}</td>
                <td>{cliente.user.name}</td>
                <td>{cliente.user.phone}</td>
                <td>
                  <a href={`mailto:${cliente.emailAcces}`}>
                    {cliente.emailAcces}
                  </a>
                </td>
                <td>
                  <Form.Select
                    value={cliente.stepProgress}
                    onChange={(e) =>
                      handleStatusChange(cliente.idTransactProgress, parseInt(e.target.value, 10))
                    }
                  >
                    <option value={1}>En proceso</option>
                    <option value={2}>En espera</option>
                    <option value={3}>Falta de pago</option>
                    <option value={4}>Terminado</option>
                    <option value={5}>Cancelado</option>
                    <option value={6}>Revisar</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowModalA(true);
                    }}
                  >
                    <FaInfo /> Ver más
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal para actualizar trámite */}
      {showModalA && (
        <ModalActualizarCliente
          show={showModalA}
          onHide={() => {
            setShowModalA(false);
            setClienteSeleccionado(null);
          }}
          onClienteRegistrado={fetchServices}
          cliente={clienteSeleccionado}
        />
      )}

      <div className="d-flex justify-content-center align-items-center my-3 gap-2">
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
