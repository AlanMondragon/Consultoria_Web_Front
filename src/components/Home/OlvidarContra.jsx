import { useEffect } from 'react';
import './../../styles/OlvidarContra.css';
import Swal from 'sweetalert2';
import { forgetPassword } from './../../api/api.js';
import { Icon } from '@iconify/react';
import logo from '../../img/logo.jpg';


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
      .then((response) => {
        console.log(response);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Se ha enviado un correo para restablecer tu contraseña.',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Algo salió mal, intenta nuevamente.',
        });
      });
  };

  const handleBack = () => {
    window.history.back(); // Regresar a la página anterior
  }

  return (
    <div className='body-login'>
      <div className="card-recovery">
        <div className="top-bar">
          <Icon icon="mdi:arrow-left" width="30" height="30" className="back-icon" onClick={handleBack} />
        </div>
        <h2 className="title-recovery">¡Recuperación de contraseña!</h2>
        <img src={logo} alt="Logo Consultoría JAS" className="logo-img-olvar-contra" />
        <form onSubmit={handleSubmit} className="form-recovery">
          <p className="h4">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
          <input type="email" name="email" placeholder="Ingresa tu correo" required className="input-recovery" />
          <button type="submit" className="btn-recovery">Enviar</button>
        </form>
      </div>
    </div>
  );
}
