// ... importaciones
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
import './../../styles/ClienteServicios.css';

// ✅ Configura tu public key de Stripe
const stripePromise = loadStripe("pk_test_51QrBlZJkhVNwEnzwnMQJP2ePgjyJxOlIvzHEFibaqygiHUB65TVG7JBPiDTcfv28Vp4eQ9ovJtCYyUogtJEi3AqL00JGxmMV5e");

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
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

  const fetchStepsById = async (stepId) => {
    try {
      const response = await getStepById(stepId);
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

  const PrevArrow = ({ onClick }) => (
    <div className="slick-arrow slick-prev" onClick={onClick}>
      <Icon icon="mdi:arrow-left-circle" width="30" height="30" color="black" />
    </div>
  );

  const NextArrow = ({ onClick }) => (
    <div className="slick-arrow slick-next" onClick={onClick}>
      <Icon icon="mdi:arrow-right-circle" width="30" height="30" color="black" />
    </div>
  );

  const truncateDescription = (description, maxChars) => {
    if (!description) return '';
    return description.length > maxChars ? description.slice(0, maxChars) + '...' : description;
  };

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

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const openStepsModal = async (idTransact) => {
    try {
      const response = await getStepById(idTransact);
      setSteps(response.response.StepsTransacts || []);
      setShowStepsModal(true);
    } catch (error) {
      console.error('Error al obtener pasos:', error);
    }
  };

  const openPaymentModal = (service) => {
    setServiceToPay(service);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setServiceToPay(null);
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    closePaymentModal();
    Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
  };

  const handlePaymentError = (error) => {
    Swal.fire('Error', error.message || 'Falló el pago.', 'error');
  };

  return (
    <div style={{ marginTop: '100px' }}>
      <div className='fixed-top'>
        <Navbar title={"Servicios"} />
      </div>

      <div className="services-slider">
        <h1 className="title">Servicios disponibles</h1>
        <Slider {...sliderSettings}>
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <img src={service.image} alt={service.name} />
              <h2>{service.description}</h2>
              <p>{truncateDescription(service.name, 250)}</p>
              <p style={{ color: "#000", fontWeight: "bold" }}>Pago inicial:</p>
              <p className="price">MX${service.cashAdvance}.00</p>
              <button onClick={() => openModal(service)}>Mostrar Más</button>
              <button
                className="btn btn-primary mt-2"
                onClick={() => openPaymentModal(service)}
              >
                Pagar MX${service.cashAdvance}
              </button>
            </div>
          ))}
        </Slider>
      </div>

      {/* Modal de detalles del servicio */}
      <Modal show={modalIsOpen} onHide={closeModal} centered dialogClassName="wide-modal">
        {selectedService && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedService.description}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-body-content">
                <img src={selectedService.image} alt={selectedService.name} />
                <div className="info">
                  <p>{selectedService.name}</p>
                  <p style={{ fontWeight: "bold" }}>Pago inicial:</p>
                  <p className="price" style={{ color: "blue" }}>MX$ {selectedService.cashAdvance}.00</p>
                  <p style={{ fontWeight: "bold" }}>Información de costos:</p>
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
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 9999,
                      cursor: 'zoom-out',
                      padding: '20px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src={selectedService.imageDetail}
                      alt="Ampliado"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="info" onClick={() => openStepsModal(selectedService.idTransact)}>Ver pasos</Button>
              <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Modal de pasos */}
      <Modal show={showStepsModal} onHide={() => setShowStepsModal(false)} centered className="modal-steps">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">Pasos del trámite</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {steps.length > 0 ? (
            <ol className="steps-list" style={{ paddingLeft: '0' }}>
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="step-item"
                  style={{
                    backgroundColor: '#fff',
                    marginBottom: '15px',
                    padding: '15px 15px 15px 50px',
                    borderLeft: '4px solid #007bff',
                    borderRadius: '6px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    position: 'relative'
                  }}
                >
                  {step.name}
                </li>
              ))}
            </ol>
          ) : (
            <p className="loading-message" style={{ fontStyle: 'italic', color: '#888', textAlign: 'center', padding: '20px 0' }}>
              Cargando pasos...
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={() => setShowStepsModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal de pago con Stripe */}
      <Modal show={paymentModalOpen} onHide={closePaymentModal} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Pago de {serviceToPay?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serviceToPay && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={serviceToPay.cashAdvance}
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
