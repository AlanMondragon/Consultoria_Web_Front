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
const stripePromise = loadStripe(import.meta.env.VITE_PUBLIC_SECRET_KEY);

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

      {/* Modal Pasos */}
      <Modal 
        show={showStepsModal} 
        onHide={() => setShowStepsModal(false)} 
        centered 
        className={styles.modalSteps}
      >
        <Modal.Header closeButton>
          <Modal.Title>Pasos del trámite</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {steps.length > 0 ? (
            <ol className={styles.stepsList}>
              {steps.map((step, index) => (
                <li
                  key={index}
                  className={styles.stepItem}
                >
                  {step.name}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.loadingMessage}>
              Cargando pasos...
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary"
            className={styles.btnSecondary}
            onClick={() => setShowStepsModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Pago Stripe */}
      <Modal 
        show={paymentModalOpen} 
        onHide={closePaymentModal} 
        centered 
        size="sm"
        className={styles.paymentModal}
      >
        <Modal.Header closeButton>
          <Modal.Title className={styles.paymentModalTitle}>
            Pago de {serviceToPay?.description}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serviceToPay && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={serviceToPay.cashAdvance}
                description={serviceToPay.description}
                userEmail={userEmail}
                customer={userId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}