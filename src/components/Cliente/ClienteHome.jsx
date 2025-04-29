import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

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
     
    </div>
  );
}
