import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { FaInfo, FaPlus } from 'react-icons/fa';
import { trasacciones, actualizarT, clientes } from './../../api/api.js';
import '../../styles/Clientes.css';
import ModalRegistrarTramite from './RegistrarTramite.jsx';
import ModalActualizarTramite from './ActualizarTramite.jsx';

export default function AdministradorTramites() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalA, setShowModalA] = useState(false);
  const [showModalI, setShowModalI] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [Datitos, setDatitos] = useState(null);//Lleva los datos al modal resgistrar transaccion
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
      console.log('Respuesta completa:', response);
      console.log('EL correo es: ', response.response.transactProgresses);

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

    const coincideEstado =
      estadoSeleccionado === "" || d.status === parseInt(estadoSeleccionado, 10);

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
    <div style={{ marginTop: '100px' }}>
      <Navbar title={"-Clientes"} />

      <div className="d-flex justify-content-between align-items-center p-3">
        <Form.Control
          type="text"
          placeholder="Buscar..."
          className="w-75"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ borderRadius: '12px', borderWidth: '2px' }}
        />
        <Form.Select
          value={estadoSeleccionado}
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
        <Button
          variant="success"
          className="d-flex align-items-center gap-2"
          style={{ boxShadow: '2px 2px 6px #00000050', borderRadius: '12px' }}
          onClick={() => {
            setDatitos(datos);
            setShowModal(true);
          }}
        >
          Agregar <FaPlus />
        </Button>
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
                  <a href={`mailto:${cliente.emailAcces || cliente.user?.email}`}>
                    {cliente.emailAcces || cliente.user?.email || "Sin correo"}
                  </a>
                </td>

                <td>
                  <Form.Select
                    value={cliente.status}
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
                    variant="success"
                    className="d-flex align-items-center gap-2"
                    style={{
                      display: 'block',
                      marginLeft: 'auto',
                      boxShadow: '2px 2px 6px #00000050',
                      borderRadius: '12px'
                    }}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      console.log('Los datos', cliente)
                      setShowModalA(true);
                    }}
                  >
                    EDITAR
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
