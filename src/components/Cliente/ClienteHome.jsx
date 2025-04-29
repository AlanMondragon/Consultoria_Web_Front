import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess } from './../../api/api.js'; 

export default function ClienteHome() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

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
        fetchServices();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/"); 
    }
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await getAllProcess();
        if (response.success && Array.isArray(response.response.Transacts)) {
        setServices(response.response.Transacts);
      } else {
        console.error("Unexpected API response format:", response);
        setServices([]); // Fallback to an empty array
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]); // Fallback to an empty array
    }
  };


  return (
    <div>
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




