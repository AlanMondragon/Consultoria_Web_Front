import { useEffect, useState } from 'react';
import './../../styles/OlvidarContra.css';
import Swal from 'sweetalert2';
import { olvidarContra, actualizarContra, obtenerUsuarioPorCorreo } from './../../api/api.js';
import { Icon } from '@iconify/react';
import logo from '../../img/logo.jpg';
import { redirect } from 'react-router-dom';

export default function OlvidarContra() {
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);

 

  useEffect(() => {
    document.body.classList.add('home-page');
    localStorage.removeItem("token");
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const handleEnviarCodigo = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire('Error', 'Por favor ingresa un correo válido.', 'error');
      return;
    }

    try {
      const resUser = await obtenerUsuarioPorCorreo(email.trim());

      const user = resUser?.response?.user;
      if (!user?.idUser) {
        throw new Error("Usuario no encontrado.");
      }

      setUserId(user.idUser);

      const res = await olvidarContra(email.trim());

      const code = res?.response?.code;  // Usa .data
      if (!code) {
        throw new Error("No se recibió el código del backend.");
      }

      setCodigo(code);
      setPaso(2);

      Swal.fire('¡Correo enviado!', 'Revisa tu bandeja para ver el código.', 'success');
    } catch (error) {
      console.error("Error en recuperación de contraseña:", error);
      Swal.fire('Error', 'El correo no existe en el sistema', 'error');
    }
  };


  const handleActualizarPassword = async (e) => {
    e.preventDefault();

    if (String(codigoIngresado).trim() !== String(codigo)) {
      Swal.fire('Error', 'El código ingresado es incorrecto.', 'error');
      return;
    }

    if (!nuevaPassword || nuevaPassword.length < 6) {
      Swal.fire('Advertencia', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    
     if (nuevaPassword !== confirmarPassword) {
    Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
    return;
  }
    try {
      await actualizarContra(userId, nuevaPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Contraseña actualizada con éxito',
      }).then(() => {
    window.location.href = '/';
  });
      
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar la contraseña, porfavor contacta a soporte.',
      });
    }
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

        {paso === 1 && (
          <form onSubmit={handleEnviarCodigo} className="form-recovery">
            <p className="description">Por favor, ingresa tu correo electrónico. Te enviaremos un código para restablecer tu contraseña.</p>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              className="input-recovery"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn-recovery">Enviar</button>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={handleActualizarPassword} className="form-recovery">
            <p className="description">Ingresa el código recibido y tu nueva contraseña.</p>

            <input
              type="text"
              placeholder="Código de verificación"
              required
              className="input-recovery"
              value={codigoIngresado}
              onChange={(e) => setCodigoIngresado(e.target.value)}
            />

            <div className="password-field">
              <input
                type={verPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                required
                className="input-recovery"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />
              <Icon
                icon={verPassword ? "mdi:eye-off" : "mdi:eye"}
                className="toggle-password-icon"
                width="24"
                height="24"
                onClick={() => setVerPassword(!verPassword)}
              />
            </div>

            <div className="password-field">
              <input
                type={verPassword ? 'text' : 'password'}
                placeholder="Confirmar nueva contraseña"
                required
                className="input-recovery"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
              />
              <Icon
                icon={verPassword ? "mdi:eye-off" : "mdi:eye"}
                className="toggle-password-icon"
                width="24"
                height="24"
                onClick={() => setVerPassword(!verPassword)}
              />
            </div>

            <button type="submit" className="btn-recovery">Actualizar contraseña</button>
          </form>
        )}


      </div>
    </div>
  );
}
