// ClienteServicios.jsx (Refactorizado)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarUser.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';

// Importar los modales separados
import ServiceDetailsModal from './ServiceDetailsModal.jsx';
import PaymentModal from './PaymentModal.jsx';
import StepsModal from './StepsModal.jsx';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../../styles/ClienteServicios.module.css';

export default function ClienteServicios() {
  const navigate = useNavigate();
  
  // Estados principales
  const [services, setServices] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  
  // Estados para modal de detalles
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Estados para modal de pasos
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  
  // Estados para modal de pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [serviceToPay, setServiceToPay] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.sub || "");
      setUserId(decoded.idUser || "");
      
      if (decoded.role !== "USER") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a esta página.',
        });
        navigate("/");
      } else {
        fetchServices();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await getAllProcess();
      if (response.success && Array.isArray(response.response.Transacts)) {
        setServices(response.response.Transacts);
      } else {
        console.error("Unexpected API response format:", response);
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const fetchStepsById = async (idTransact) => {
    setStepsLoading(true);
    try {
      const response = await getStepById(idTransact);
      if (response.success && Array.isArray(response.response.StepsTransacts)) {
        setSteps(response.response.StepsTransacts);
      } else {
        setSteps([]);
      }
    } catch (error) {
      console.error("Error al obtener pasos:", error);
      setSteps([]);
    } finally {
      setStepsLoading(false);
    }
  };

  const truncateDescription = (text, max) =>
    text?.length > max ? `${text.slice(0, max)}...` : text || '';

  // Componentes de flechas para el slider
  const PrevArrow = ({ onClick }) => (
    <div className={styles.slickArrowPrev} onClick={onClick}>
      <Icon icon="mdi:arrow-left-circle" width="30" height="30" color="black" />
    </div>
  );

  const NextArrow = ({ onClick }) => (
    <div className={styles.slickArrowNext} onClick={onClick}>
      <Icon icon="mdi:arrow-right-circle" width="30" height="30" color="black" />
    </div>
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  // Handlers para modal de detalles
  const handleOpenDetailsModal = async (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
    await fetchStepsById(service.idTransact);
  };

  const handleCloseDetailsModal = () => {
    setSelectedService(null);
    setDetailsModalOpen(false);
    setSteps([]);
    setIsZoomed(false);
  };

  const handleToggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Handlers para modal de pasos
  const handleOpenStepsModal = async (idTransact) => {
    console.log("idTransact:", idTransact);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };

  const handleCloseStepsModal = () => {
    setStepsModalOpen(false);
    setSteps([]);
  };

  // Handlers para modal de pago
  const handleOpenPaymentModal = (service) => {
    setServiceToPay(service);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setServiceToPay(null);
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
    Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
  };

  const handlePaymentError = (error) => {
    Swal.fire('Error', error.message || 'Falló el pago.', 'error');
  };

  return (
    <div className={styles.container}>
      <div className="fixed-top">
        <Navbar title="- Servicios" />
      </div>

      <div className={styles.servicesSlider}>
        <h1 className={styles.title}>Servicios disponibles</h1>
        <Slider {...sliderSettings}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <img
                src={service.image}
                alt={service.name}
                className={styles.serviceCardImage}
              />
              <h2 className={styles.serviceCardTitle}>
                {service.description}
              </h2>
              <p className={styles.serviceCardDescription}>
                {truncateDescription(service.name, 250)}
              </p>
              <p className={styles.costInfoLabel}>Pago inicial:</p>
              <p className={styles.price}>MX${service.cashAdvance}.00</p>
              
              <button
                className={styles.cardButton}
                onClick={() => handleOpenDetailsModal(service)}
              >
                Mostrar Más
              </button>
              
              <button
                className={styles.cardButtonPay}
                onClick={() => handleOpenPaymentModal(service)}
              >
                Pagar MX${service.cashAdvance}
              </button>
            </div>
          ))}
        </Slider>
      </div>

      {/* Modal de Detalles del Servicio */}
      <ServiceDetailsModal
        show={detailsModalOpen}
        onHide={handleCloseDetailsModal}
        service={selectedService}
        onShowSteps={handleOpenStepsModal}
        isZoomed={isZoomed}
        onToggleZoom={handleToggleZoom}
      />

      {/* Modal de Pago */}
      <PaymentModal
        show={paymentModalOpen}
        onHide={handleClosePaymentModal}
        service={serviceToPay}
        userEmail={userEmail}
        userId={userId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Modal de Pasos */}
      <StepsModal
        show={stepsModalOpen}
        onHide={handleCloseStepsModal}
        steps={steps}
        loading={stepsLoading}
      />
    </div>
  );
}