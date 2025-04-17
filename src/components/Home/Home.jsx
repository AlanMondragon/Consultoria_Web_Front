import React, { useState, useEffect } from 'react';
import logo from '../../img/logo.jpg';
import { Login, FindByID } from './../../api/api.js';
import './../../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('home-page');
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
        alert(response.message);
        return;
      }

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);

      // Decodificar el token
      const decoded = jwtDecode(data.token);

  
      // Redirigir según rol
      if (decoded.role === "ADMIN") {
        navigate('/HomeAdmin');
      } else if (decoded.role === "USER") {
        navigate('/HomeUser');
      } else {
        console.warn("Rol no reconocido:", decoded.role);
      }

    } catch (error) {
      console.error('Error during login:', error);
    }
  };

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
              <a href="#" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <button type="submit" className="btn btn-login w-100">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
