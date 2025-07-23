import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { FaLess, FaPlus } from 'react-icons/fa';
import { clientes, actualizarStatusCliente } from './../../api/api.js';
import '../../styles/Clientes.css'; 
import ModalRegistrarCliente from './RegistrarCliente.jsx';
import ModalActualizarCliente from './ActualizarCliente.jsx';
import ModalRegistrarTramite from './RegistrarTramite.jsx';

export default function AdministradorClientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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
      const response = await clientes();
      if (response.success && Array.isArray(response.response.users)) {
        setDatos(response.response.users);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setDatos([]);
      }
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleSwitchChange = async (idUser, nuevoEstado) => {
    try {
      const result = await actualizarStatusCliente(idUser, nuevoEstado);
      mensaje(nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error("Error al actualizar el estado del cliente", error);
    }
  };

  const filtrados = datos.filter(d =>
    `${d.name ?? ''} ${d.apellidos ?? ''}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.phone?.includes(busqueda)
  );

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

  function mensaje(nuevoEstado) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Estado actualizado: ${nuevoEstado ? 'Activado' : 'Desactivado'}`,
    });
  }

  return (
    <div className="tramites-container">
      <div className='fixed-top'>
        <Navbar title={"- Clientes"} />
      </div>

      {/* Controles superiores */}
      <div className="controles-superiores">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          className="busqueda-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button
          className="btn-agregar"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" />
          Agregar Cliente
        </Button>
      </div>

      <ModalRegistrarCliente
        show={showModal}
        onHide={() => setShowModal(false)}
        onClienteRegistrado={fetchServices}
      />
      <ModalActualizarCliente
        show={showModalA}
        onHide={() => setShowModalA(false)}
        onClienteRegistrado={fetchServices}
        cliente={clienteSeleccionado}
      />

      {cargando ? (
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando clientes...</p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para escritorio y tablet */}
          <div className="tabla-responsiva">
            <Table className="tabla-tramites" striped hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datosPaginados.map((cliente, index) => (
                  <tr key={cliente.idUser || index}>
                    <td>
                      <span className="numero-tramite">
                        {(paginaActual - 1) * itemsPorPagina + index + 1}
                      </span>
                    </td>
                    <td>
                      <strong>{cliente.name}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${cliente.email}`} className="email-link">
                        {cliente.email}
                      </a>
                    </td>
                    <td>
                      <a href={`tel:${cliente.phone}`}>
                        {cliente.phone}
                      </a>
                    </td>
                    <td>
                      <div className={`estado-badge ${cliente.status ? 'on' : 'off'}`}>
                        <Form.Check
                          type="switch"
                          id={`custom-switch-${cliente.idUser}`}
                          checked={cliente.status}
                          onChange={(e) => {
                            const nuevoEstado = e.target.checked;
                            handleSwitchChange(cliente.idUser, nuevoEstado);
                          }}
                          style={{
                            transform: 'scale(1.2)',
                            accentColor: cliente.status ? '#28a745' : '#dc3545'
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <Button
                        className="btn-editar"
                        onClick={() => {
                          setClienteSeleccionado(cliente);
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
          </div>

          {/* Vista de tarjetas para móviles */}
          <div className="vista-movil">
            {datosPaginados.map((cliente, index) => (
              <div key={cliente.idUser || index} className={`tarjeta-tramite ${cliente.status ? 'status-4' : 'status-5'}`}>
                <div className="tarjeta-header">
                  <span className="numero-tramite">
                    #{(paginaActual - 1) * itemsPorPagina + index + 1}
                  </span>
                  <h5 className="nombre-tramite">{cliente.name}</h5>
                </div>
                
                <div className="tarjeta-body">
                  <div className="campo-movil">
                    <span className="label-movil">Email:</span>
                    <span className="valor-movil">
                      <a href={`mailto:${cliente.email}`} className="email-link">
                        {cliente.email}
                      </a>
                    </span>
                  </div>
                  
                  <div className="campo-movil">
                    <span className="label-movil">Teléfono:</span>
                    <span className="valor-movil">
                      <a href={`tel:${cliente.phone}`}>
                        {cliente.phone}
                      </a>
                    </span>
                  </div>
                  
                  <div className="campo-movil">
                    <span className="label-movil">Estado:</span>
                    <div className="valor-movil d-flex align-items-center justify-content-end gap-2">
                      <span className={`badge ${cliente.status ? 'bg-success' : 'bg-danger'}`}>
                        {cliente.status ? 'Activo' : 'Inactivo'}
                      </span>
                      <Form.Check
                        type="switch"
                        id={`mobile-switch-${cliente.idUser}`}
                        checked={cliente.status}
                        onChange={(e) => {
                          const nuevoEstado = e.target.checked;
                          handleSwitchChange(cliente.idUser, nuevoEstado);
                        }}
                        style={{
                          transform: 'scale(1.2)',
                          accentColor: cliente.status ? '#28a745' : '#dc3545'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="acciones-movil">
                  <Button
                    className="btn-editar-movil"
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowModalA(true);
                    }}
                  >
                    EDITAR CLIENTE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginación */}
      <div className="paginacion-container">
        <Button
          variant="outline-primary"
          className="btn-paginacion"
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          Anterior
        </Button>

        {[...Array(totalPaginas)].map((_, i) => (
          <Button
            key={i}
            variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
            className="btn-paginacion"
            onClick={() => cambiarPagina(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          variant="outline-primary"
          className="btn-paginacion"
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </Button>
      </div>

      {/* Modal de RegistrarTramite si lo necesitas */}
      <ModalRegistrarTramite clientes={datos} />
    </div>
  );
}