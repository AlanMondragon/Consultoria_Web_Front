import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from '@fullcalendar/core/locales/es';
import { tramitesPorId } from './../../api/api';
import Navbar from '../NavbarUser';

export default function Calendario() {
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
            if (decoded.role !== "USER") {
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
            const response = await tramitesPorId(usuario);
            if (response.success && Array.isArray(response.response.transactProgresses)) {
                const data = response.response.transactProgresses;

                const tipos = [...new Set(data.map(item => item.transact.description))];
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
                        transactDesc: item.transact.description,
                        backgroundColor: color,
                        borderColor: color
                    };

                    return [
                        item.dateCas && {
                            title: `${item.transact.description} - CAS`,
                            start: item.dateCas,
                            end: item.dateCas,
                            description: 'Cita en CAS',
                            text: item.dateCas,
                            tipo: 'CAS',
                            ...baseProps
                        },
                        item.dateCon && {
                            title: `${item.transact.description} - CONSULADO`,
                            start: item.dateCon,
                            end: item.dateCon,
                            description: 'Cita en el consulado',
                            text: item.dateCon,
                            tipo: 'CONSULADO',
                            ...baseProps
                        },
                        item.dateSimulation && {
                            title: `${item.transact.description} - SIMULACIÓN`,
                            start: item.dateSimulation,
                            end: item.dateSimulation,
                            description: 'Tienes una cita de simulación con el equipo de Consultoría JAS',
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
        <>
            <style jsx>{`
                .calendario-container {
                    margin-top: 100px;
                    min-height: 100vh;
                    padding: 20px;
                }

                .calendario-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .calendario-main {
                    flex: 1;
                    min-width: 300px;
                }

                .calendario-sidebar {
                    flex: 0 0 280px;
                    min-width: 280px;
                }

                .filtro-select {
                    margin-bottom: 15px;
                    padding: 12px;
                    width: 100%;
                    background-color: white;
                    color: black;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .botones-container {
                    margin-bottom: 15px;
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                    background-color: white;
                    padding: 12px;
                    border-radius: 4px;
                    flex-wrap: wrap;
                }

                .boton-fecha {
                    background-color: #f8f9fa;
                    color: #495057;
                    border: 1px solid #dee2e6;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease-in-out;
                    white-space: nowrap;
                    flex: 1;
                    min-width: 80px;
                }

                .boton-fecha:hover {
                    background-color: #e9ecef;
                    border-color: #adb5bd;
                }

                .calendario-wrapper {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }

                .info-panel {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }

                .info-titulo {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #333;
                    font-size: 18px;
                }

                .info-lista {
                    list-style: none;
                    padding-left: 0;
                    margin: 0;
                }

                .info-item {
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }

                .color-indicator {
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    margin-right: 10px;
                    border-radius: 3px;
                    border: 1px solid #ddd;
                    flex-shrink: 0;
                }

                .info-text {
                    font-size: 14px;
                    color: #555;
                    line-height: 1.3;
                }

                /* Media queries para responsividad */
                @media (max-width: 768px) {
                    .calendario-container {
                        margin-top: 80px;
                        padding: 15px;
                    }

                    .calendario-content {
                        flex-direction: column;
                        gap: 20px;
                    }

                    .calendario-sidebar {
                        order: -1;
                        flex: none;
                        min-width: auto;
                    }

                    .botones-container {
                        justify-content: center;
                        gap: 6px;
                    }

                    .boton-fecha {
                        padding: 10px 8px;
                        font-size: 13px;
                        min-width: 70px;
                    }

                    .calendario-wrapper {
                        padding: 15px;
                    }

                    .info-panel {
                        padding: 15px;
                    }

                    .info-titulo {
                        font-size: 16px;
                    }

                    .filtro-select {
                        padding: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .calendario-container {
                        margin-top: 70px;
                        padding: 10px;
                    }

                    .botones-container {
                        padding: 10px;
                        gap: 4px;
                    }

                    .boton-fecha {
                        padding: 8px 6px;
                        font-size: 12px;
                        min-width: 60px;
                    }

                    .calendario-wrapper {
                        padding: 10px;
                    }

                    .info-panel {
                        padding: 12px;
                    }

                    .info-titulo {
                        font-size: 15px;
                        margin-bottom: 12px;
                    }

                    .info-text {
                        font-size: 13px;
                    }

                    .color-indicator {
                        width: 12px;
                        height: 12px;
                        margin-right: 8px;
                    }
                }

                @media (min-width: 1200px) {
                    .calendario-container {
                        padding: 30px;
                    }

                    .calendario-content {
                        gap: 40px;
                    }
                }
            `}</style>

            <div className="calendario-container">
                <div className='fixed-top'>
                    <Navbar title={"- Calendario"} />
                </div>

                <div className="calendario-content">
                    <div className="calendario-main">
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="filtro-select"
                        >
                            <option value="">Selecciona el trámite</option>
                            {tiposUnicos.map((tipo, idx) => (
                                <option key={idx} value={tipo}>{tipo}</option>
                            ))}
                        </select>

                        <div className="botones-container">
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('CAS')}>
                                CAS
                            </button>
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('CONSULADO')}>
                                Consulado
                            </button>
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('SIMULACION')}>
                                Simulación
                            </button>
                        </div>

                        <div className="calendario-wrapper">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                contentHeight="auto"
                                locale={esLocale}
                                events={eventosFiltrados}
                                eventClick={(info) => {
                                    Swal.fire({
                                        title: info.event.title,
                                        text: `${info.event.extendedProps.description} el DÍA y HORA ${info.event.extendedProps.text}` || 'Sin descripción',
                                        icon: 'info'
                                    });
                                }}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth'
                                }}
                                dayHeaderFormat={{ weekday: 'short' }}
                                height="auto"
                                aspectRatio={window.innerWidth < 768 ? 1.0 : 1.35}
                            />
                        </div>
                    </div>

                    <div className="calendario-sidebar">
                        <div className="info-panel">
                            <h4 className="info-titulo">Información</h4>
                            <ul className="info-lista">
                                {Object.entries(coloresPorTramite).map(([id, color]) => {
                                    const descripcion = eventos.find(e => e.backgroundColor === color)?.transactDesc;
                                    return (
                                        <li key={id} className="info-item">
                                            <span 
                                                className="color-indicator"
                                                style={{ backgroundColor: color }}
                                            ></span>
                                            <span className="info-text">
                                                {descripcion || `No hay fechas #${id}`}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}