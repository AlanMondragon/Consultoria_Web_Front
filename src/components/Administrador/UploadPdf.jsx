import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function UploadPdf() {
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
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }

    document.body.classList.add('home-admin-body');
    return () => {
      document.body.classList.remove('home-admin-body');
    };
  }, [navigate]);

  // Estados para archivos y mensajes
  const [filePrivacidad, setFilePrivacidad] = useState(null);
  const [fileTerminos, setFileTerminos] = useState(null);
  const [mensajePrivacidad, setMensajePrivacidad] = useState('');
  const [mensajeTerminos, setMensajeTerminos] = useState('');

  // Subida genérica para evitar repetir código
  const uploadPdf = async (file, tipo, setMensaje) => {
    if (!file) {
      setMensaje('Por favor selecciona un archivo.');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje('No autorizado');
      navigate("/");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8080/api/pdf/upload/${tipo}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}` // PASAMOS TOKEN EN EL HEADER
        },
        body: formData,
      });

      if (response.ok) {
        const text = await response.text();
        setMensaje(text);
      } else {
        setMensaje(`Error al subir: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error de red');
    }
  };

  return (
    <div>
      <h2>Actualizar Políticas de Privacidad</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFilePrivacidad(e.target.files[0])}
      />
      <button onClick={() => uploadPdf(filePrivacidad, 'privacidad', setMensajePrivacidad)}>
        Subir PDF
      </button>
      <p>{mensajePrivacidad}</p>

      <hr />

      <h2>Actualizar Términos y Condiciones</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFileTerminos(e.target.files[0])}
      />
      <button onClick={() => uploadPdf(fileTerminos, 'terminos', setMensajeTerminos)}>
        Subir PDF
      </button>
      <p>{mensajeTerminos}</p>
    </div>
  );
}
