import { useEffect } from 'react';
import './../../styles/OlvidarContra.css';
import Swal from 'sweetalert2';
import { forgetPassword } from './../../api/api.js';
import { Icon } from '@iconify/react';
import logo from '../../img/logo.jpg'; // o el logo adecuado

export default function OlvidarContra() {
  useEffect(() => {
    document.body.classList.add('home-page');
    localStorage.removeItem("token");
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    forgetPassword(email)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '¡Correo enviado!',
          text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No pudimos enviar el correo. Inténtalo nuevamente.',
        });
      });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="body-login">
      <div className="card-recovery">
        <div className="top-bar">
          <Icon icon="mdi:arrow-left" width="28" height="28" className="back-icon" onClick={handleBack} />
        </div>
        <h2 className="title-recovery">Recuperación de contraseña</h2>
        <img src={logo} alt="Logo Consultoría de Visado" className="logo-img-olvidar-contra" />
        <form onSubmit={handleSubmit} className="form-recovery">
          <p className="description">Por favor, ingresa tu correo electrónico. Te enviaremos un enlace para restablecer tu contraseña.</p>
          <input type="email" name="email" placeholder="Correo electrónico" required className="input-recovery" />
          <button type="submit" className="btn-recovery">Enviar</button>
        </form>
      </div>
    </div>
  );
}
