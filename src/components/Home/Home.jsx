import React, { useState, useEffect } from 'react';
import logo from '../../img/logo.jpg';
import { Login } from './../../api/api.js';
import './../../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2';

export default function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {

    document.body.classList.add('home-page');
    localStorage.removeItem("token");
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Login(email, password); 
      const data = response.response; 

      if(!data.token){
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
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Bienvenido ',
          showConfirmButton: true,
        })
        navigate('/ClienteHome');
      } else {
        console.warn("Rol no reconocido:", decoded.role);
      }

    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  //Olvide contraseña
  const handleForgotPassword = () => {
    navigate('/olvidar-contra')
  }

  return (
    <div className='body-login'>
      <div className="card-login">
        <div className="card-left">
          <img
            src={logo}
            alt="Logo Consultoría JAS"
            className="logo-img"
          />
        </div>

        <div className="vertical-line"></div>

        <div className="card-right">
          <h2 className='h2'>Bienvenido</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Ingresa tu correo"
              required
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Ingresa tu contraseña"
              required
            />
            <div className="mb-3">
              <a onClick={handleForgotPassword} className="forgot-password" style={{background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline'}}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <button type="submit" className="btn-login w-100">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
