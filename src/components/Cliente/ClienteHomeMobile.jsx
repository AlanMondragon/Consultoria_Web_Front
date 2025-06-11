import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import Navbar from '../NavbarUser';
import tramites from '../../img/Tramites.png';
import servicios from '../../img/Servicios.png';
import calendario from '../../img/Calendario.png';
import styles from '../../styles/ContenedorHomeUserMobile.module.css';

export default function ClienteHomeMobile() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        navigate('/ClienteHome');
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
        <div className={styles.tarjeta} onClick={() => navigate("/ClienteServicios")}>
          <img src={servicios} alt="Servicios" />
          <h3>Servicios</h3>
          <p>Servicios disponibles</p>
        </div>
        <div className={styles.tarjeta} onClick={() => navigate("/MisTramites")}>
          <img src={tramites} alt="Clientes" />
          <h3>Tramites</h3>
          <p>Gestión de mis tramites</p>
        </div>
        <div className={styles.tarjeta} onClick={() => navigate("/Calendario")}>
          <img src={calendario} alt="Clientes" />
          <h3>Calendario</h3>
          <p>Gestión de mis tramites</p>
        </div>
      </div>
    </div>
  );
}
