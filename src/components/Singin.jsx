import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { RegistrarCliente, olvidarContraSin } from '../api/api.js';
import styles from './../styles/Signin.module.css';
import { FaEye, FaEyeSlash, FaCheck, FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaChevronDown } from 'react-icons/fa';
import { MdClose, MdArrowBack } from 'react-icons/md';
import Logo from './../img/logo_letras_negras.jpg';
import { Icon } from '@iconify/react';

// Opciones de países con banderas emoji
const countryOptions = [
  { value: "+57", label: "Colombia", flag: "🇨🇴", code: "CO" },
  { value: "+52", label: "México", flag: "🇲🇽", code: "MX" },
  { value: "+502", label: "Guatemala", flag: "🇬🇹", code: "GT" },
  { value: "+54", label: "Argentina", flag: "🇦🇷", code: "AR" },
  { value: "+1242", label: "Bahamas", flag: "🇧🇸", code: "BS" },
  { value: "+1246", label: "Barbados", flag: "🇧🇧", code: "BB" },
  { value: "+501", label: "Belice", flag: "🇧🇿", code: "BZ" },
  { value: "+55", label: "Brasil", flag: "🇧🇷", code: "BR" },
  { value: "+591", label: "Bolivia", flag: "🇧🇴", code: "BO" },
  { value: "+1", label: "Canadá", flag: "🇨🇦", code: "CA" },
  { value: "+56", label: "Chile", flag: "🇨🇱", code: "CL" },
  { value: "+506", label: "Costa Rica", flag: "🇨🇷", code: "CR" },
  { value: "+5999", label: "Curazao", flag: "🇨🇼", code: "CW" },
  { value: "+1809", label: "Rep. Dominicana", flag: "🇩🇴", code: "DO" },
  { value: "+593", label: "Ecuador", flag: "🇪🇨", code: "EC" },
  { value: "+503", label: "El Salvador", flag: "🇸🇻", code: "SV" },
  { value: "+592", label: "Guyana", flag: "🇬🇾", code: "GY" },
  { value: "+509", label: "Haití", flag: "🇭🇹", code: "HT" },
  { value: "+504", label: "Honduras", flag: "🇭🇳", code: "HN" },
  { value: "+1876", label: "Jamaica", flag: "🇯🇲", code: "JM" },
  { value: "+507", label: "Panamá", flag: "🇵🇦", code: "PA" },
  { value: "+595", label: "Paraguay", flag: "🇵🇾", code: "PY" },
  { value: "+51", label: "Perú", flag: "🇵🇪", code: "PE" },
  { value: "+597", label: "Suriname", flag: "🇸🇷", code: "SR" },
  { value: "+1868", label: "Trinidad y Tobago", flag: "🇹🇹", code: "TT" },
  { value: "+598", label: "Uruguay", flag: "🇺🇾", code: "UY" },
  { value: "+1", label: "Estados Unidos", flag: "🇺🇸", code: "US" }
];

// Componente personalizado para el selector de países
const CountrySelect = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountry = countryOptions.find(option => option.value === value) || countryOptions.find(option => option.value === '+52');

  const filteredOptions = countryOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.includes(searchTerm)
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={styles.countrySelectContainer}>
      <div
        className={`${styles.countrySelectTrigger} ${error ? styles.inputError : ''} ${isOpen ? styles.countrySelectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.countrySelectValue}>
          <span className={styles.countryFlag}>{selectedCountry.flag}</span>
          <span className={styles.countryCode}>{selectedCountry.value}</span>
          <span className={styles.countryName}>{selectedCountry.label}</span>
        </div>
        <FaChevronDown className={`${styles.countrySelectArrow} ${isOpen ? styles.countrySelectArrowUp : ''}`} />
      </div>

      {isOpen && (
        <div className={styles.countrySelectDropdown}>
          <div className={styles.countrySearchContainer}>
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.countrySearchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.countryOptionsList}>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.countryOption} ${selectedCountry?.value === option.value ? styles.countryOptionSelected : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.countryFlag}>{option.flag}</span>
                <span className={styles.countryLabel}>{option.label}</span>
                <span className={styles.countryCode}>({option.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const handleDownloadTerminos = () => {
  const link = document.createElement('a');
  link.href = 'http://localhost:8080/api/pdf/download/terminos';
  link.setAttribute('download', 'Terminos_y_Condiciones_Consultoria_JAS.pdf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDownloadPrivacidad = () => {
  const link = document.createElement('a');
  link.href = 'http://localhost:8080/api/pdf/download/privacidad';
  link.setAttribute('download', 'Politica_de_Privacidad_Consultoria_JAS.pdf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const schema = yup.object().shape({
  email: yup.string().required('Correo requerido').email('Correo inválido'),
  name: yup.string().required('Nombre requerido'),
  password: yup.string().required('Contraseña requerida').min(8, 'Mínimo 8 caracteres'),
  confirmPassword: yup.string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  phone: yup.string()
    .required('Teléfono requerido')
    .matches(/^\d{10}$/, 'Debe tener exactamente 10 dígitos'),
});

export default function Signin({ onCancel }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(null);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [paso, setPaso] = useState(1);
  const [phonePrefix, setPhonePrefix] = useState('+52');

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
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const onSubmit = async (data) => {
    try {
      if (paso === 1) {
        const res = await olvidarContraSin(data.email);
        const code = res?.response?.code;

        if (!code) throw new Error('No se recibió el código del backend');

        setCodigoEnviado(code);
        setPaso(2);

        await Swal.fire({
          title: '¡Código enviado!',
          text: 'Revisa tu correo para el código de verificación.',
          icon: 'success',
          customClass: { popup: 'swal-popup-custom' },
        });
      } else {
        if (codigoIngresado.trim() !== (codigoEnviado || '').toString().trim()) {
          await Swal.fire({
            title: 'Código incorrecto',
            text: 'El código ingresado no es válido',
            icon: 'error',
            customClass: { popup: 'swal-popup-custom' },
          });
          return;
        }

        const { confirmPassword, ...datosRegistro } = watch();
        const datos = {
          ...datosRegistro,
          phone: `${phonePrefix}${datosRegistro.phone}`,
          status: 1,
        };

        const resRegistrar = await RegistrarCliente(datos);

        if (resRegistrar?.success) {
          await Swal.fire({
            title: '¡Cuenta creada!',
            text: 'Tu cuenta ha sido registrada exitosamente',
            icon: 'success',
            customClass: { popup: 'swal-popup-custom' },
          });
          window.location.href = '/login';
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'El usuario ya existe',
            icon: 'error',
            customClass: { popup: 'swal-popup-custom' },
          });
        }
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema. Intenta de nuevo.',
        icon: 'error',
        customClass: { popup: 'swal-popup-custom' },
      });
    }
  };

  const volverAtras = () => {
    setPaso(1);
    setCodigoIngresado('');
  };

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
              : 'Ingresa el código que enviamos a tu correo electrónico'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {paso === 1 && (
            <div className={styles.formGrid}>
              {/* Nombre */}
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
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name.message}</span>
                )}
              </div>

              {/* Email */}
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
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email.message}</span>
                )}
              </div>

              {/* Contraseña */}
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
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>{errors.password.message}</span>
                )}
              </div>

              {/* Confirmar contraseña */}
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
                    className={`${styles.input} ${styles.inputPassword} ${errors.confirmPassword ? styles.inputError : passwordsMatch ? styles.inputSuccess : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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

              {/* Teléfono con prefijo */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaPhone className={styles.labelIcon} />
                  Teléfono
                </label>
                <div className={styles.phoneContainer}>
                  <CountrySelect
                    value={phonePrefix}
                    onChange={setPhonePrefix}
                    error={errors.phone}
                  />
                  <div className={styles.phoneInputWrapper}>
                    <input
                      type="tel"
                      placeholder="1234567890"
                      {...register('phone')}
                      className={`${styles.input} ${styles.phoneNumberInput} ${errors.phone ? styles.inputError : ''}`}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="\d{10}"
                    />
                  </div>
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
                      maxLength={6}
                      inputMode="numeric"
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
                <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTerminos(); }}>
                  Términos y Condiciones
                </a>{' '}
                y{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadPrivacidad(); }}>
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
