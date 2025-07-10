import { useEffect, useState } from 'react';
import styles from './../../styles/OlvidarContra.module.css'; // Importar el módulo CSS
import Swal from 'sweetalert2';
import { olvidarContra, actualizarContra, obtenerUsuarioPorCorreo } from './../../api/api.js';
import { Icon } from '@iconify/react';
import logo from './../../img/logo_letras_negras.png';
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
    // Aplicar fondo al body (color azul rey como respaldo)
    document.body.style.backgroundColor = '#1e40af';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    localStorage.removeItem("token");

    // Limpiar estilos al desmontar
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.fontFamily = '';
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
    <div className={styles.homePage}>
      <div className={styles.bodyLogin}>
        <div className={styles.cardRecovery}>
          <div className={styles.topBar}>
            <Icon
              icon="mdi:arrow-left"
              width="28"
              height="28"
              className={styles.backIcon}
              onClick={handleBack}
              aria-label="Volver a la página anterior"
            />
          </div>

          <h1 className={styles.titleRecovery}>Recuperación de contraseña</h1>

          {paso === 1 && (
            <form onSubmit={handleEnviarCodigo} className={styles.formRecovery}>
              <p className={styles.description}>
                Por favor, ingresa tu correo electrónico. Te enviaremos un código para restablecer tu contraseña.
              </p>

              <div className={styles.logoContainer}>
                <img
                  src={logo}
                  alt="Logo Consultoría JAS - Servicios profesionales de consultoría"
                  className={styles.logoImgOlvidarContra}
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="📧 Correo electrónico"
                required
                className={styles.inputRecovery}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Ingresa tu correo electrónico"
              />
              <button type="submit" className={styles.btnRecovery}>
                Enviar código
              </button>
            </form>
          )}

          {paso === 2 && (
            <form onSubmit={handleActualizarPassword} className={styles.formRecovery}>
              <p className={styles.description}>Ingresa el código recibido y tu nueva contraseña.</p>

              <input
                type="text"
                placeholder="🔐 Código de verificación"
                required
                className={styles.inputRecovery}
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                aria-label="Ingresa el código de verificación"
              />

              <div className={styles.passwordField}>
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="🔒 Nueva contraseña (mínimo 6 caracteres)"
                  required
                  className={styles.inputRecovery}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  aria-label="Ingresa tu nueva contraseña"
                />
                <Icon
                  icon={verPassword ? "mdi:eye-off" : "mdi:eye"}
                  className={styles.togglePasswordIcon}
                  width="24"
                  height="24"
                  onClick={() => setVerPassword(!verPassword)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                />
              </div>

              <div className={styles.passwordField}>
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="🔒 Confirmar nueva contraseña"
                  required
                  className={styles.inputRecovery}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  aria-label="Confirma tu nueva contraseña"
                />
                <Icon
                  icon={verPassword ? "mdi:eye-off" : "mdi:eye"}
                  className={styles.togglePasswordIcon}
                  width="24"
                  height="24"
                  onClick={() => setVerPassword(!verPassword)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                />
              </div>

              <button type="submit" className={styles.btnRecovery}>Actualizar contraseña</button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}