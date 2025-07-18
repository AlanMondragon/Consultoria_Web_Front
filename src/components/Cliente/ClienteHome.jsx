import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import Navbar from '../NavbarUser';
import tramites from '../../img/Tramites.png';
import servicios from '../../img/Servicios.png';
import calendario from '../../img/Calendario.png';
import styles from '../../styles/ContenedorHomeUser.module.css';

export default function ClienteHome() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        navigate('/ClienteHome-sm');
      }
    };

    handleResize(); // Checar tamaño inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

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
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }

    // Aplica la clase al body para estilos globales si se necesita
    document.body.classList.add('home-admin-body');
    return () => {
      document.body.classList.remove('home-admin-body');
    };
  }, [navigate]);

  return (
    <div className={styles.clientContainer}>
      <div className='fixed-top'>
        <Navbar />
      </div>
      <div className={styles.ContenedorG}>
        <div 
          className={styles.tarjeta} 
          onClick={() => navigate("/ClienteServicios")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate("/ClienteServicios");
            }
          }}
          aria-label="Acceder a servicios disponibles"
        >
          <img src={servicios} alt="Icono de servicios" />
          <h3>Servicios</h3>
          <p>Servicios disponibles</p>
        </div>
        <div 
          className={styles.tarjeta} 
          onClick={() => navigate("/MisTramites")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate("/MisTramites");
            }
          }}
          aria-label="Gestionar mis trámites"
        >
          <img src={tramites} alt="Icono de trámites" />
          <h3>Trámites</h3>
          <p>Gestión de mis trámites</p>
        </div>
        <div 
          className={styles.tarjeta} 
          onClick={() => navigate("/Calendario")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate("/Calendario");
            }
          }}
          aria-label="Ver calendario de citas"
        >
          <img src={calendario} alt="Icono de calendario" />
          <h3>Calendario</h3>
          <p>Gestión de citas</p>
        </div>
      </div>
    </div>
  );
}