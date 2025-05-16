// ClienteServicios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarUser.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import { Modal, Button } from 'react-bootstrap';
import CheckoutForm from './../CheckoutForm.jsx';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../../styles/ClienteServicios.module.css';

// ✅ Clave pública de Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

export default function ClienteServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [steps, setSteps] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [serviceToPay, setServiceToPay] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    console.log(stripeKey)

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
    }
  };

  const truncateDescription = (text, max) =>
    text?.length > max ? `${text.slice(0, max)}...` : text || '';

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

  const openModal = async (service) => {
    setSelectedService(service);
    setModalIsOpen(true);
    await fetchStepsById(service.idTransact);
  };

  const closeModal = () => {
    setSelectedService(null);
    setModalIsOpen(false);
    setSteps([]);
    setIsZoomed(false);
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);

  const openStepsModal = async (idTransact) => {
    await fetchStepsById(idTransact);
    setShowStepsModal(true);
  };

  const openPaymentModal = (service) => {
    setServiceToPay(service);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setServiceToPay(null);
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    closePaymentModal();
    Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
  };

  const handlePaymentError = (error) => {
    Swal.fire('Error', error.message || 'Falló el pago.', 'error');
  };

  return (
    <div className={styles.container}>
      <div className="fixed-top">
        <Navbar title="Servicios" />
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
              <h2 className={styles.serviceCardTitle}>{service.description}</h2>
              <p className={styles.serviceCardDescription}>
                {truncateDescription(service.name, 250)}
              </p>
              <p className={styles.costInfoLabel}>Pago inicial:</p>
              <p className={styles.price}>MX${service.cashAdvance}.00</p>
              <button
                className={styles.cardButton}
                onClick={() => openModal(service)}
              >
                Mostrar Más
              </button>
              <button
                className={styles.cardButtonPay}
                onClick={() => openPaymentModal(service)}
              >
                Pagar MX${service.cashAdvance}
              </button>
            </div>
          ))}
        </Slider>
      </div>

      {/* Modal Detalles */}
      <Modal
        show={modalIsOpen}
        onHide={closeModal}
        centered
        dialogClassName={styles.wideModal}
      >
        {selectedService && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedService.description}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.modalBodyContent}>
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className={styles.modalImage}
                />
                <div className={styles.modalInfo}>
                  <p>{selectedService.name}</p>
                  <p className={styles.costInfoLabel}>Pago inicial:</p>
                  <p className={styles.price} style={{ color: "blue" }}>
                    MX$ {selectedService.cashAdvance}.00
                  </p>
                  <p className={styles.costInfoLabel}>Información de costos:</p>
                  <img
                    src={selectedService.imageDetail}
                    alt="Detalle"
                    onClick={toggleZoom}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {isZoomed && (
                  <div
                    onClick={toggleZoom}
                    className={styles.imageZoomOverlay}
                  >
                    <img
                      src={selectedService.imageDetail}
                      alt="Ampliado"
                      className={styles.zoomedImage}
                    />
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="info" onClick={() => openStepsModal(selectedService.idTransact)}>
                Ver pasos
              </Button>
              <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Modal Pago Stripe - Versión Profesional */}
      <Modal
        show={paymentModalOpen}
        onHide={closePaymentModal}
        centered
        className={styles.paymentModal}
        dialogClassName="my-custom-dialog" // Clase adicional para el diálogo
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.paymentModalTitle}>
            <div className={styles.serviceIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
            </div>
            <div>
              <div className={styles.serviceTitle}>{serviceToPay?.description}</div>
              <div className={styles.serviceSubtitle}>Pago seguro con Stripe</div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          {serviceToPay && (
            <>
              {/* Monto con diseño mejorado */}
              <div className={styles.paymentAmountContainer}>
                <div className={styles.paymentAmount}>
                  <span className={styles.paymentAmountLabel}>Total a pagar</span>
                  <span className={styles.paymentAmountValue}>${serviceToPay.cashAdvance}.00 <span className={styles.currency}>MXN</span></span>
                </div>
                <div className={styles.paymentDetails}>
                  <div className={styles.paymentDetailItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    <span>Este es un pago inicial del servicio</span>
                  </div>
                </div>
              </div>

              {/* Formulario Stripe con mejor espaciado */}
              <div className={styles.stripeFormContainer}>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    amount={serviceToPay.cashAdvance}
                    description={serviceToPay.description}
                    userEmail={userEmail}
                    customer={userId}
                    idProductoTransaccion={serviceToPay.idTransact}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </div>

              {/* Sección de seguridad mejorada */}
              <div className={styles.securitySection}>
                <div className={styles.securityBadge}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  <span>Pago 100% seguro</span>
                </div>

                <div className={styles.securityFeatures}>
                  <div className={styles.securityFeature}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z" />
                      <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                    <span>Encriptación SSL</span>
                  </div>
                  <div className={styles.securityFeature}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                    </svg>
                    <span>Sin almacenar datos</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}