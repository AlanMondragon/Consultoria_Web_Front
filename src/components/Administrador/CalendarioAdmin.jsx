import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from '@fullcalendar/core/locales/es';
import { trasacciones } from './../../api/api';
import Navbar from '../NavbarAdmin';

export default function CalendarioAdmin() {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [eventos, setEventos] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [tiposUnicos, setTiposUnicos] = useState([]);
    const [coloresPorTramite, setColoresPorTramite] = useState({});

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
            console.log("Los datos son: ", response);
            if (response.success && Array.isArray(response.response.transactProgresses)) {
                const data = response.response.transactProgresses;

                const tipos = [...new Set(data.map(item => item.transact.name))];
                setTiposUnicos(tipos);

                const colores = {};
                data.forEach(item => {
                    const idReal = item.transact.idTransact;
                    if (!colores[idReal]) {
                        colores[idReal] = obtenerColorPorId(idReal);
                    }
                });
                setColoresPorTramite(colores);

                const eventosTransformados = data.flatMap((item) => {
                    const idReal = item.transact.idTransact;
                    const color = colores[idReal];

                    const baseProps = {
                        transactDesc: item.transact.name,
                        backgroundColor: color,
                        borderColor: color,
                        userName: item.user?.name,
                        userPhone: item.user?.phone
                    };

                    return [
                        item.dateCas && {
                            title: `${item.transact.name} - CAS`,
                            start: item.dateCas,
                            end: item.dateCas,
                            description: 'Cita en CAS',
                            text: item.dateCas,
                            tipo: 'CAS',
                            ...baseProps
                        },
                        item.dateCon && {
                            title: `${item.transact.name} - CONSULADO`,
                            start: item.dateCon,
                            end: item.dateCon,
                            description: 'Cita en el consulado',
                            text: item.dateCon,
                            tipo: 'CONSULADO',
                            ...baseProps
                        },
                        item.dateSimulation && {
                            title: `${item.transact.name} - SIMULACIÓN`,
                            start: item.dateSimulation,
                            end: item.dateSimulation,
                            description: 'Cita Simulación',
                            text: item.dateSimulation,
                            tipo: 'SIMULACION',
                            ...baseProps
                        }
                    ].filter(Boolean);
                });

                setEventos(eventosTransformados);
            } else {
                setEventos([]);
                setTiposUnicos([]);
            }
        } catch (error) {
            console.error("Error al obtener los trámites:", error);
            setEventos([]);
            setTiposUnicos([]);
        }
    };

    const eventosFiltrados = filtroTipo
        ? eventos.filter(e => e.transactDesc === filtroTipo)
        : eventos;

    const irAFechaMasCercana = (tipo) => {
        const hoy = new Date();
        const fechas = eventosFiltrados
            .filter(e => e.tipo === tipo)
            .map(e => new Date(e.start))
            .filter(fecha => fecha >= hoy)
            .sort((a, b) => a - b);

        if (fechas.length > 0 && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(fechas[0]);
        } else {
            Swal.fire('Sin coincidencias', `No hay próximas fechas para ${tipo}`, 'info');
        }
    };

    return (
        <div style={{ marginTop: '100px', backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', width: '1000px', margin: '0 auto', padding: '50px' }}>
                <div style={{ flex: 3 }}>
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        style={{
                            marginBottom: '15px',
                            padding: '8px',
                            width: '100%',
                            backgroundColor: 'white',
                            color: 'black',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Selecciona el tramite</option>
                        {tiposUnicos.map((tipo, idx) => (
                            <option key={idx} value={tipo}>{tipo}</option>
                        ))}
                    </select>

                    <div style={{
                        marginBottom: '15px',
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'right',
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        <button style={buttonStyle} onClick={() => irAFechaMasCercana('CAS')}>CAS</button>
                        <button style={buttonStyle} onClick={() => irAFechaMasCercana('CONSULADO')}>Consulado</button>
                        <button style={buttonStyle} onClick={() => irAFechaMasCercana('SIMULACION')}>Simulación</button>
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

                <div>
                    <h4>Información</h4>
                    <ul style={{ listStyle: 'none', paddingLeft: '10px' }}>
                        {Object.entries(coloresPorTramite).map(([id, color]) => {
                            const descripcion = eventos.find(e => e.backgroundColor === color)?.transactDesc;
                            return (
                                <li key={id} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '15px',
                                        height: '15px',
                                        backgroundColor: color,
                                        marginRight: '10px',
                                        borderRadius: '3px'
                                    }}></span>
                                    {descripcion || `No hay fechas #${id}`}
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
