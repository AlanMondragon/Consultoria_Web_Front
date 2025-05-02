import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';

export default function RegistrarTramite() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        navigate("/");
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }
  }, []);

  return (
      <div></div>
      );
}




