import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import Navbar from '../NavbarUser'
import tramites from '../../img/Tramites.png'
import servicios from '../../img/Servicios.png'
import '../../styles/ContenedorHomeUser.css'
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
  }, [navigate]);

  
  return (
    <div style={{ marginTop: '100px' }}>
          <Navbar></Navbar>
        <div className="ContenedorG">
        <div className="tarjeta" onClick={()=> navigate("/ClienteServicios")}>
            <img src={servicios} alt="Servicios" />
            <h3>Servicios</h3>
            <p>Servicios disponibles</p>
        </div>
        <div className="tarjeta" onClick={()=> navigate("/MisTramites")}>
            <img src={tramites} alt="Clientes" />
            <h3>Tramites</h3>
            <p>Gestión de mis tramites</p>
        </div>
    </div>
    </div>
        
  );
}
