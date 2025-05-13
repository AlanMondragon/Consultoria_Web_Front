import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import Navbar from '../NavbarUser';
import tramites from '../../img/Tramites.png';
import servicios from '../../img/Servicios.png';
// Importación correcta del CSS Module
import styles from '../../styles/ContenedorHomeUser.module.css';

export default function ClienteHome() {
  const navigate = useNavigate();

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
    document.body.classList.add('home-client-body');
    return () => {
      document.body.classList.remove('home-client-body');
    };

  }, [navigate]);

 
  return (
    <div style={{ marginTop: '100px' }}>
      <Navbar />
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
      </div>
    </div>
  );
}