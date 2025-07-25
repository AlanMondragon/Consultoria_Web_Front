import React, { useState, useEffect } from 'react';
import logo from '../../img/logo_letras_negras.png';
import { Login } from './../../api/api.js';
import styles from './../../styles/Home.module.css'; // Importar el módulo CSS
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2';
import { Icon } from '@iconify/react';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Aplicar fondo al body (color azul rey como respaldo)
    document.body.style.backgroundColor = '#1e40af';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    localStorage.removeItem("token");

    // Limpiar estilos al desmontar
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Login(email, password);
      const data = response.response;

      if (!data.token) {
        const message = response.message || 'Error desconocido';
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: message,
          showCancelButton: false,
          showConfirmButton: true,
        });
        return;
      }

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);

      // Decodificar el token
      const decoded = jwtDecode(data.token);

      // Redirigir según rol
      if (decoded.role === "ADMIN") {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Bienvenido ',
          showConfirmButton: true,
        })
        navigate('/HomeAdmin');
      } else if (decoded.role === "USER") {
        // Verificar si hay un servicio preseleccionado desde la landing page
        const selectedServiceData = sessionStorage.getItem('selectedService');
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Bienvenido ',
          showConfirmButton: true,
        }).then(() => {
          // Si hay un servicio preseleccionado, ir directo a servicios
          if (selectedServiceData) {
            navigate('/ClienteServicios');
          } else {
            navigate('/ClienteHome');
          }
        });
      } else {
        console.warn("Rol no reconocido:", decoded.role);
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '¡Opps...!',
        text: `${error.response.data.message}`,
        showConfirmButton: true,
      })
    }
  };

  // Olvide contraseña
  const handleForgotPassword = () => {
    navigate('/olvidar-contra')
  }
   const volver = () => {
    navigate('/')
  }
  const singint = () => {
    navigate('/Signin')
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.bodyLogin}>
        <div className={styles.cardLogin}>
          <button
            type="button"
            onClick={volver}
            className={styles.volver}
          >
            <Icon icon="mdi:arrow-left" width="20" height="20" />
            Volver
          </button>
          
          <div className={styles.cardLeft}>
            <img
              src={logo}
              alt="Logo Consultoría JAS - Servicios profesionales"
              className={styles.logoImg}
            />
          </div>

          <div className={styles.verticalLine}></div>

          <div className={styles.cardRight}>
            <h1 className={styles.title}>Bienvenido</h1>
            <form onSubmit={handleLogin} className={styles.form}>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formControl}
                placeholder="✉️ Ingresa tu correo electrónico"
                required
              />
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formControl}
                placeholder="🔒 Ingresa tu contraseña"
                required
              />
              <div className={styles.forgotPasswordContainer}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={styles.forgotPassword}
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <br/>
                <button
                  type="button"
                  onClick={singint}
                  className={styles.forgotPassword}
                >
                  Crear cuenta
                </button>
              </div>
              <button type="submit" className={styles.btnLogin}>
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}