import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { enviarCorreoConDatos } from './src/api/api.js'; // Importa la función que envía correo
import styles from './src/styles/Practicas.module.css';
import { FaUser, FaEnvelope, FaPhone, FaChevronDown, FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Logo from './src/img/logo_letras_negras.jpg';
import LogoUtez from './src/img/utez.jpg';
import LogoUpegro from './src/img/upegro.png';
import { redirect } from 'react-router-dom';


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

const schema = yup.object().shape({
    email: yup.string().required('Correo requerido').email('Correo inválido'),
    name: yup.string().required('Nombre requerido'),
    institutionName: yup.string().required('Nombre de la institución requerido'),
    phone: yup.string()
        .required('Teléfono requerido')
        .matches(/^\d{10}$/, 'Debe tener exactamente 10 dígitos'),
});

export default function Practicas({ onCancel }) {
    const [phonePrefix, setPhonePrefix] = useState('+52');


    const {
        register,
        handleSubmit,
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
            const fullPhone = `${phonePrefix}${data.phone}`;
            const phoneSolicitante = `${phonePrefix}${data.phoneSolicitante}`;


            const mensaje = `
  <ul>
    <li><strong>Nombre completo del solicitante:</strong> ${data.name}</li>
    <li><strong>Numero del solicitante:</strong> ${phoneSolicitante}</li>
    <li><strong>Nombre de la institución:</strong> ${data.institutionName}</li>
    <li><strong>Correo de la institución:</strong> ${data.email}</li>
    <li><strong>Teléfono de la intitución:</strong> ${fullPhone}</li>
  </ul>
`;


            await enviarCorreoConDatos('20233tn073@utez.edu.mx', 'Solicitud de practicas ', mensaje);

            await Swal.fire({
                title: '¡Datos enviados!',
                text: 'La información ha sido enviada correctamente, espera respuesta de parte de Consultoría JAS.',
                icon: 'success',
                customClass: { popup: 'swal-popup-custom' },
            });


        } catch (error) {
            console.error(error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar la información. Intenta de nuevo.',
                icon: 'error',
                customClass: { popup: 'swal-popup-custom' },
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.layoutRow}>
                <div className={styles.institutionsColumn}>
                    <a href="https://www.utez.edu.mx/" target="_blank" rel="noopener noreferrer">
                        <img src={LogoUtez} alt="Logo UTEZ" className={styles.institutionLogo} />
                    </a>
                    <a href="https://upeg.edu.mx" target="_blank" rel="noopener noreferrer">
                        <img src={LogoUpegro} alt='Logo UPEGRO' className={styles.institutionLogo} />
                    </a>
                </div>
                <div className={styles.card}>
                <div className={styles.header}>

                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonOutline}`}
                        onClick={cancel}
                    >
                        Volver
                    </button>
                    <div className={styles.headerIcon}>
                        <img src={Logo} alt="Logo" height={125} width={125} />
                    </div>
                    <h1 className={styles.title}>Enviar información para convenio</h1>
                    <p className={styles.subtitle}>
                        Bienvenido a Consultoría JAS. Completa tus datos para ponernos en contacto con tu institución.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGrid}>
                        {/* Nombre completo */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <FaUser className={styles.labelIcon} />
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                placeholder="Ingresa tu nombre completo"
                                {...register('name')}
                                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                autoComplete="name"
                            />
                            {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
                        </div>
                        {/* Teléfono con prefijo */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <FaPhone className={styles.labelIcon} />
                                Número de Whatsapp del solicitante
                            </label>
                            <div className={styles.phoneContainer}>
                                <CountrySelect
                                    value={phonePrefix}
                                    onChange={setPhonePrefix}
                                    error={errors.phone}
                                />
                                <input
                                    type="tel"
                                    placeholder="1234567890"
                                    {...register('phoneSolicitante')}
                                    className={`${styles.input} ${styles.phoneNumberInput} ${errors.phone ? styles.inputError : ''}`}
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="\d{10}"
                                />
                            </div>
                            {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                        </div>

                        {/* Nombre de la institución */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <FaUser className={styles.labelIcon} />
                                Nombre de la institución
                            </label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre de tu institución"
                                {...register('institutionName')}
                                className={`${styles.input} ${errors.institutionName ? styles.inputError : ''}`}
                                autoComplete="organization"
                            />
                            {errors.institutionName && <span className={styles.errorMessage}>{errors.institutionName.message}</span>}
                        </div>

                        {/* Email */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <FaEnvelope className={styles.labelIcon} />
                                Correo electrónico de la institución
                            </label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                {...register('email')}
                                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                autoComplete="email"
                            />
                            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                        </div>

                        {/* Teléfono con prefijo */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <FaPhone className={styles.labelIcon} />
                                Teléfono de la institución
                            </label>
                            <div className={styles.phoneContainer}>
                                <CountrySelect
                                    value={phonePrefix}
                                    onChange={setPhonePrefix}
                                    error={errors.phone}
                                />
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
                            {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonOutline}`}
                            onClick={cancel}
                        >
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
                                    Enviar datos
                                    <FaCheck />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                </div> {/* cierra .card */}
            </div> {/* cierra .layoutRow */}
        </div>
    );
}
