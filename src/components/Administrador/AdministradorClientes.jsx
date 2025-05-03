import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { FaLess, FaPlus } from 'react-icons/fa';
import { clientes, actualizarStatusCliente } from './../../api/api.js';
import '../../styles/Clientes.css'
import ModalRegistrarCliente from './RegistrarCliente.jsx';
import ModalActualizarCliente from './ActualizarCliente.jsx'

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
      console.log("Cambiando el estado del cliente con id:", idUser, "a:", nuevoEstado);
      const result = await actualizarStatusCliente(idUser, nuevoEstado);
      console.log("Resultado del cambio de estado:", result);
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
        <Button
          variant="success"
          className="d-flex align-items-center gap-2"
          style={{ boxShadow: '2px 2px 6px #00000050', borderRadius: '12px' }}
          onClick={() => setShowModal(true)}
        >
          Agregar <FaPlus />
        </Button>
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
      </div>

      {cargando ? (
        <div className="text-center p-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped hover responsive className="p-3" style={{ minWidth: '1000px' }}>
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
                <td>{(paginaActual - 1) * itemsPorPagina + index + 1}</td>
                <td>{cliente.name}</td>
                <td><a href={`mailto:${cliente.email}`}>{cliente.email}</a></td>
                <td>{cliente.phone}</td>
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
                    />
                  </div>

                  
                </td>
                <td>
                <Button
                    variant="success"
                    className="d-flex align-items-center gap-2"
                    style={{
                      display: 'block',   // Cambiar a block para que ocupe una línea completa
                      marginLeft: 'auto', // Alineamos el botón a la derecha de la celda
                      boxShadow: '2px 2px 6px #00000050',
                      borderRadius: '12px',
                      marginTop: '10px'   // Añadir un pequeño margen superior para separarlo de la "badge"
                    }}
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
