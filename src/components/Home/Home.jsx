import React, { useState, useEffect } from 'react';
import logo from '../../img/logo.jpg';
import { Login } from './../../api/api.js';
import './../../styles/Home.css';


export default function Home() {
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
      console.log('Login successful:', response);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
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
        <form action="#" onSubmit={handleLogin}>
          <input type="email" onChange={handleEmailChange} className="form-control" placeholder="Ingresa tu correo" required/>
          <input type="password" onChange={handlePasswordChange} className="form-control" placeholder="Ingresa tu contraseña" required/>
          
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
