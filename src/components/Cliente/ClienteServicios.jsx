import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess } from './../../api/api.js';
import Navbar from '../NavbarUser.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react'; // Iconos con Iconify
import { Modal, Button } from 'react-bootstrap';
import { getStepById } from './../../api/api'; // Importar función para obtener pasos


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './../../styles/ClienteServicios.css';

export default function ClienteServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [steps, setSteps] = useState([]);


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
        console.log('Datos recibidos');
        setServices(response.response.Transacts);
      } else {
        console.error("Unexpected API response format:", response);
        console.log('Datos NO RECIBIDOS');
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  // Función para obtener los pasos del trámite
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


  // Flechas personalizadas con Iconify
  const PrevArrow = ({ onClick }) => (
    <div className="slick-arrow slick-prev" onClick={onClick}>
      <Icon icon="mdi:arrow-left-circle" width="30" height="30" color="black" />
    </div>
  );

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };


  const NextArrow = ({ onClick }) => (
    <div className="slick-arrow slick-next" onClick={onClick}>
      <Icon icon="mdi:arrow-right-circle" width="30" height="30" color="black" />
    </div>
  );

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
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
  // 👇 Al cerrar, limpiamos pasos
  const closeModal = () => {
    setSelectedService(null);
    setModalIsOpen(false);
    setSteps([]);
  };

  return (
    <div style={{ marginTop: '100px' }}>
      <div className='fixed-top'>
        <Navbar title={"-Servicios"} />
      </div>
      <div className="services-slider">
        <h1 className="title">Servicios disponibles</h1>
        <Slider {...sliderSettings}>
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <img src={service.image} alt={service.name} />
              <h2>{truncateDescription(service.description, 40)}</h2>
              <p>{service.name}</p>
              <p style={{ color: "#000", fontWeight: "bold" }}>Pago inicial:</p>
              <p className="price">MX${service.cashAdvance}.00</p>
              <button onClick={() => openModal(service)}>Mostrar Más</button>
            </div>
          ))}
        </Slider>
      </div>

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
                  <p style={{ color: "#000", fontWeight: "bold" }}>Pago inicial:</p>
                  <p className="price" style={{ color: "blue" }}>MX$ {selectedService.cashAdvance}.00</p>
                  <div style={{ marginTop: '30px' }}>
  <h5 style={{ fontWeight: 'bold', color: '#333' }}>Pasos del trámite:</h5>
  {steps.length > 0 ? (
    <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
      {steps.map((step, index) => (
        <li
          key={index}
          style={{
            backgroundColor: '#f8f9fa',
            marginBottom: '10px',
            padding: '10px 15px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            fontWeight: '500',
            color: '#444'
          }}
        >
          {step.name}
        </li>
      ))}
    </ol>
  ) : (
    <p style={{ fontStyle: 'italic', color: '#777' }}>Cargando pasos o no disponibles.</p>
  )}
</div>


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
                {isZoomed && selectedService && (
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
              <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}
