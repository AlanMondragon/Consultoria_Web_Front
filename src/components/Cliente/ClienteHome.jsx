import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
        navigate("/"); 
      }
    } catch (error) {
      navigate("/"); 
    }
  }, []);

  return (
    <div>Esta pagina sera el home del cliente</div>
  );
}



 
