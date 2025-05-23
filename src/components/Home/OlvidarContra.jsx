import { useEffect, useState } from 'react';
import './../../styles/OlvidarContra.css';
import Swal from 'sweetalert2';
import { olvidarContra, actualizarContra, obtenerUsuarioPorCorreo } from './../../api/api.js';
import { Icon } from '@iconify/react';
import logo from '../../img/logo.jpg';

export default function OlvidarContra() {
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

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
      console.log("Respuesta de obtenerUsuarioPorCorreo:", resUser);

      const user = resUser?.response?.user;
      if (!user?.idUser) {
        throw new Error("Usuario no encontrado.");
      }

      setUserId(user.idUser);

      const res = await olvidarContra(email.trim());
      console.log("Respuesta de olvidarContra:", res);

      const code = res?.response?.code;  // Usa .data
      if (!code) {
        throw new Error("No se recibió el código del backend.");
      }

      setCodigo(code);
      setPaso(2);

      Swal.fire('¡Correo enviado!', 'Revisa tu bandeja para el código.', 'success');
    } catch (error) {
      console.error("Error en recuperación de contraseña:", error);
      Swal.fire('Error', 'No pudimos enviar el correo o encontrar el usuario.', 'error');
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

    /*try {
      await actualizarContra(userId, { password: nuevaPassword });
      console.log("Respuesta de actualizarContra:", res);
      Swal.fire('Éxito', 'Contraseña actualizada correctamente.', 'success');
      setEmail('');
      setCodigo(null);
      setUserId(null);
      setCodigoIngresado('');
      setNuevaPassword('');
      setPaso(1);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar la contraseña.', 'error');
    }*/
    try {
      await actualizarContra(userId, nuevaPassword );
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Contraseña actualizada con éxito',
      });
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar la contraseña.',
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
            <input
              type="password"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              required
              className="input-recovery"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
            <button type="submit" className="btn-recovery">Actualizar contraseña</button>
          </form>
        )}
      </div>
    </div>
  );
}
