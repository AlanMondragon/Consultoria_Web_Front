import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { getAllProcess } from './../../api/api.js'; 
import Navbar from '../NavbarUser.jsx'

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
     
    <div>
      <Navbar></Navbar>
      <h1>Servicios Disponibles</h1>
      <div className="services-container">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.name} />
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <p>MX${service.paid}</p>
            <button>Agregar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
