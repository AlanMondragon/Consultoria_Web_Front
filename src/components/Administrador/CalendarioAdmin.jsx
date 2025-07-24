import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from '@fullcalendar/core/locales/es';
import { trasacciones } from './../../api/api';
import Navbar from '../NavbarAdmin';
import '../../styles/CalendarioAdmin.css';

export default function CalendarioAdmin() {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [eventos, setEventos] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [tiposUnicos, setTiposUnicos] = useState([]);
    const [coloresPorTramite, setColoresPorTramite] = useState({});
    const [contadorCitas, setContadorCitas] = useState({}); 

    const obtenerColorPorId = (id) => {
        const coloresBase = [
            '#1E90FF', '#32CD32', '#FFA500', '#FF69B4', '#8A2BE2',
            '#00CED1', '#DC143C', '#FF8C00', '#20B2AA', '#9370DB'
        ];
        return coloresBase[id % coloresBase.length];
    };

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
                setUsuario(decoded.idUser);
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
            const response = await trasacciones();
            if (response.success && Array.isArray(response.response.transactProgresses)) {
                const data = response.response.transactProgresses;

                const tipos = [...new Set(data.map(item => item.transact.name))];
                setTiposUnicos(tipos);

                const colores = {};
                const contador = {}; // Contador para cada trámite
                
                data.forEach(item => {
                    const idReal = item.transact.idTransact;
                    const nombreTramite = item.transact.name;
                    
                    if (!colores[idReal]) {
                        colores[idReal] = obtenerColorPorId(idReal);
                    }
                    
                    // Inicializar contador si no existe
                    if (!contador[nombreTramite]) {
                        contador[nombreTramite] = 0;
                    }
                    
                    contador[nombreTramite]++; // Incrementar contador para el trámite correspondiente
                });

                setColoresPorTramite(colores);
                setContadorCitas(contador);
                
                // Mapear los datos a formato de eventos para FullCalendar
                const eventosCalendario = data.map(item => ({
                    id: item.id,
                    title: item.transact.name,
                    date: item.date,
                    description: item.description,
                    userName: item.userName,
                    userPhone: item.userPhone,
                    text: item.text,
                    backgroundColor: colores[item.transact.idTransact],
                    borderColor: colores[item.transact.idTransact],
                    transactDesc: item.transact.desc // Suponiendo que 'desc' es el campo correcto
                }));

                setEventos(eventosCalendario);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const eventosFiltrados = filtroTipo ? eventos.filter(evento => evento.title === filtroTipo) : eventos;

    const irAFechaMasCercana = (tipo) => {
        const evento = eventos.find(evento => evento.title === tipo);
        if (evento) {
            const fecha = new Date(evento.date);
            calendarRef.current.getApi().gotoDate(fecha);
        }
    };

    return (
      <div className="calendario-admin-main">
        <Navbar title={"- Calendario"} />
        <div className="calendario-admin-container">
          <div className="calendario-admin-card">
            <select
              className="calendario-admin-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Selecciona el trámite</option>
              {tiposUnicos.map((tipo, idx) => (
                <option key={idx} value={tipo}>{tipo}</option>
              ))}
            </select>
            <div className="calendario-admin-btns">
              <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('CAS')}>CAS</button>
              <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('CONSULADO')}>Consulado</button>
              <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('SIMULACION')}>Simulación</button>
            </div>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              contentHeight="auto"
              locale={esLocale}
              events={eventosFiltrados}
              eventClick={(info) => {
                const { userName, userPhone, description, text } = info.event.extendedProps;
                Swal.fire({
                  title: info.event.title,
                  html: `
                    <strong>Cliente:</strong> ${userName || 'No disponible'}<br/>
                    <strong>Teléfono:</strong> ${userPhone || 'No disponible'}<br/>
                    <strong>Descripción:</strong> ${description || 'Sin descripción'}<br/>
                    <strong>Fecha:</strong> ${text || 'No disponible'}
                  `,
                  icon: 'info'
                });
              }}
            />
          </div>
          <div className="calendario-admin-info">
            <h4>Información</h4>
            <ul>
              {Object.entries(coloresPorTramite).map(([id, color]) => {
                const descripcion = eventos.find(e => e.backgroundColor === color)?.transactDesc;
                const cantidadCitas = contadorCitas[descripcion] || 0;
                return (
                  <li key={id}>
                    <span className="color-box" style={{ backgroundColor: color }}></span>
                    {descripcion || `No hay fechas #${id}`}
                    <span className="citas-count">({cantidadCitas})</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
}

const buttonStyle = {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer'
};