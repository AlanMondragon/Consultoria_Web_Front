import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { RegistrarCliente, olvidarContraSin } from '../api/api.js';
import styles from './../styles/Signin.module.css';
import { FaEye, FaEyeSlash, FaCheck, FaUser, FaEnvelope, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { MdClose, MdArrowBack } from 'react-icons/md';
import Logo from './../img/logo_letras_negras.jpg'
import { Icon } from '@iconify/react';

const handleDownload = () => {
  const link = document.createElement('a');
  link.href = '/Terminos y condiciones_Consultoría JAS.pdf'; 
  link.download = 'Terminos y condiciones_Consultoría JAS.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const handleDownloadP = () => {
  const link = document.createElement('a');
  link.href = '/Política de Privacidad.pdf';
  link.download = 'Política de Privacidad_Consultoría JAS.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

<button onClick={handleDownload}>Descargar archivo</button>

const schema = yup.object().shape({
    email: yup.string().required('Correo requerido').email('Correo inválido'),
    name: yup.string().required('Nombre requerido'),
    password: yup.string().required('Contraseña requerida').min(8, 'Mínimo 8 caracteres'),
    confirmPassword: yup.string()
        .required('Confirma tu contraseña')
        .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
    phone: yup.string().required('Teléfono requerido').min(10, 'Debe tener 10 dígitos').max(10, 'Debe tener 10 dígitos'),
});

export default function Signin({ onCancel }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(null);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [paso, setPaso] = useState(1);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    const cancel = () => {
        window.history.back();
    };
    const onSubmit = async (data) => {
        try {
            if (paso === 1) {
                const res = await olvidarContraSin(data.email);
                const code = res?.response?.code;

                if (!code) throw new Error('No se recibió el código del backend');

                setCodigoEnviado(code);
                setPaso(2);

                Swal.fire({
                    title: '¡Código enviado!',
                    text: 'Revisa tu correo para el código de verificación.',
                    icon: 'success',
                    customClass: {
                        popup: 'swal-popup-custom'
                    }
                });
            } else {
                if (String(codigoIngresado).trim() !== String(codigoEnviado).trim()) {
                    Swal.fire({
                        title: 'Código incorrecto',
                        text: 'El código ingresado no es válido',
                        icon: 'error',
                        customClass: {
                            popup: 'swal-popup-custom'
                        }
                    });
                    return;
                }

                // Excluir confirmPassword de los datos a enviar
                const { confirmPassword, ...datosRegistro } = watch();
                const datos = {
                    ...datosRegistro,
                    status: 1,
                };

                const resRegistrar = await RegistrarCliente(datos);

                if (resRegistrar?.success) {
                    await Swal.fire({
                        title: '¡Cuenta creada!',
                        text: 'Tu cuenta ha sido registrada exitosamente',
                        icon: 'success',
                        customClass: {
                            popup: 'swal-popup-custom'
                        }
                    });
                    window.location.href = '/login';
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'El usuario ya existe',
                        icon: 'error',
                        customClass: {
                            popup: 'swal-popup-custom'
                        }
                    });
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un problema. Intenta de nuevo.',
                icon: 'error',
                customClass: {
                    popup: 'swal-popup-custom'
                }
            });
        }
    };

    const volverAtras = () => {
        setPaso(1);
        setCodigoIngresado('');
    };

    // Observar las contraseñas para mostrar indicadores visuales
    const password = watch('password');
    const confirmPassword = watch('confirmPassword');
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    return (
        <div className="custom-container">
            <div className={styles.card}>
                <div className={styles.header}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonOutline}`}
                        onClick={cancel}
                    >
                                      <Icon icon="mdi:arrow-left" width="20" height="20" />
                        
                        Volver
                    </button>
                    <div className={styles.headerIcon}>

                        <img src={Logo} alt="Logo" height={125} width={125} />
                    </div>
                    <h1 className={styles.title}>
                        {paso === 1 ? 'Crear cuenta' : 'Verificar correo'}
                    </h1>
                    <p className={styles.subtitle}>
                        {paso === 1
                            ? 'Bienvenido a Consultoría JAS. Completa tus datos para registrarte.'
                            : 'Ingresa el código que enviamos a tu correo electrónico'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    {paso === 1 && (
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <FaUser className={styles.labelIcon} />
                                    Nombre completo
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="Ingresa tu nombre completo"
                                        {...register('name')}
                                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                    />
                                </div>
                                {errors.name && (
                                    <span className={styles.errorMessage}>{errors.name.message}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <FaEnvelope className={styles.labelIcon} />
                                    Correo electrónico
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        {...register('email')}
                                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <span className={styles.errorMessage}>{errors.email.message}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <FaShieldAlt className={styles.labelIcon} />
                                    Contraseña
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Crea una contraseña segura"
                                        {...register('password')}
                                        className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className={styles.errorMessage}>{errors.password.message}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <FaShieldAlt className={styles.labelIcon} />
                                    Confirmar contraseña
                                    {passwordsMatch && (
                                        <FaCheck className={styles.checkIcon} style={{ color: '#10b981', marginLeft: '8px' }} />
                                    )}
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirma tu contraseña"
                                        {...register('confirmPassword')}
                                        className={`${styles.input} ${styles.inputPassword} ${errors.confirmPassword ? styles.inputError :
                                            passwordsMatch ? styles.inputSuccess : ''
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
                                )}
                                {!errors.confirmPassword && confirmPassword && passwordsMatch && (
                                    <span className={styles.successMessage}>
                                        <FaCheck style={{ marginRight: '4px' }} />
                                        Las contraseñas coinciden
                                    </span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <FaPhone className={styles.labelIcon} />
                                    Teléfono
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="tel"
                                        placeholder="10 dígitos sin espacios"
                                        {...register('phone')}
                                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                                    />
                                </div>
                                {errors.phone && (
                                    <span className={styles.errorMessage}>{errors.phone.message}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {paso === 2 && (
                        <div className={styles.verificationSection}>
                            <div className={styles.verificationCard}>
                                <div className={styles.verificationIcon}>
                                    <FaEnvelope />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Código de verificación</label>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            placeholder="Ingresa el código de 6 dígitos"
                                            value={codigoIngresado}
                                            onChange={(e) => setCodigoIngresado(e.target.value)}
                                            className={`${styles.input} ${styles.codeInput}`}
                                            maxLength="6"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {paso === 1 && (
                        <div className={styles.terms}>
                            <p>
                                Al registrarte aceptas nuestros{' '}
                                <a href="#" className={styles.link} onClick={handleDownload}>
                                    Términos y Condiciones
                                </a>{' '}
                                y{' '}
                                <a href="#" className={styles.link} onClick={handleDownloadP}>
                                    Política de Privacidad
                                </a>
                            </p>
                        </div>
                    )}

                    <div className={styles.actions}>
                        {paso === 2 && (
                            <button
                                type="button"
                                className={`${styles.button} ${styles.buttonSecondary}`}
                                onClick={volverAtras}
                            >
                                <MdArrowBack />
                                Volver
                            </button>
                        )}

                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonOutline}`}
                            onClick={cancel}
                        >
                            <MdClose />
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className={styles.spinner}></div>
                            ) : (
                                <>
                                    {paso === 1 ? 'Enviar código' : 'Crear cuenta'}
                                    <FaCheck />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}