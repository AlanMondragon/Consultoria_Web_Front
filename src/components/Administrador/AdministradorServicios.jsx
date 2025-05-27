import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarAdmin.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import ModalRegistrarTramite from './RegistrarTramite.jsx';
import { Modal, Button } from 'react-bootstrap';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../../styles/AdminServicios.module.css';

export default function AdministradorServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [steps, setSteps] = useState([])
  const [idService, setIdService] = useState(null);

  useEffect(() => {
    // Aplicar el estilo de fondo al body cuando se monta el componente
    document.body.className = styles.backgroundBody;
    
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
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

    // Cleanup: remover la clase cuando el componente se desmonte
    return () => {
      document.body.className = '';
    };
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

  const truncateDescription = (description, maxChars) => {
    if (!description) return '';
    return description.length > maxChars
      ? description.slice(0, maxChars) + '...'
      : description;
  };

  // Function to fetch steps by ID
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
    };
  };

  // Modal handlers
  const openModal = async (service) => {
    setSelectedService(service);
    setModalIsOpen(true);
    setIdService(service.idTransact);
    await fetchStepsById(service.idTransact);
  };

  // Update the closeModal function to reset steps and remove inputs
  const closeModal = () => {
    setSelectedService(null);
    setModalIsOpen(false);
    setSteps([]); // Clear the steps list
  };

  const openStepsModal = async (idTransact) => {
    try {
      const response = await getStepById(idTransact);
      setSteps(response.response.StepsTransacts || []);
      setShowStepsModal(true);
      setIdService(idTransact);
    } catch (error) {
      console.error('Error al obtener pasos:', error);
    }
  };

  // Flechas personalizadas con Iconify
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
    speed: 500,
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

  const handleEditClick = (service) => {
    navigate(`/ActualizarServicio`, { state: { service } });
  };

  // Format the price to show only 2 decimals
  const formatPrice = (price) => price.toFixed(2);

  return (
    <div className={styles.container}>
      <div className='fixed-top'>
        <Navbar title={"- Servicios"} />
      </div>
      <div className={styles.servicesSlider}>
        <h1 className={styles.title}>Servicios disponibles</h1>
        <Slider {...sliderSettings}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <img src={service.image} alt={service.name} className={styles.serviceCardImage} />
              <h2 className={styles.serviceCardTitle}>{service.description}</h2>
              <p className={styles.serviceCardDescription}>{truncateDescription(service.name, 150)}</p>
              <p className={styles.costInfoLabel}>Pago inicial:</p>
              <p className={styles.price}>MX${formatPrice(service.cashAdvance)}</p>
              <Button
                className='btn-primary'
                style={{ backgroundColor: '#007bff', borderColor: '#0056b3' }}
                onClick={() => handleEditClick(service)}
              >
                Editar
              </Button>
              <Button
                className='btn-secondary m-1'
                style={{ backgroundColor: '#17a2b8', borderColor: '#117a8b' }}
                onClick={() => openStepsModal(service.idTransact)}
              >
                Ver pasos
              </Button>
              <Button
                className='btn-info'
                style={{ backgroundColor: '#17a2b8', borderColor: '#117a8b' }}
                onClick={() => openModal(service)}
              >
                Vista previa
              </Button>
            </div>
          ))}
        </Slider>
      </div>
      <div>
        <button className={styles.bottonAggregate} onClick={() => navigate("/RegistrarServicio")}>Agregar Servicio</button>
      </div>
      <Modal show={modalIsOpen} onHide={closeModal} centered dialogClassName={styles.wideModal}>
        {selectedService && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedService.description}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.modalBodyContent}>
                <img src={selectedService.image} alt={selectedService.name} className={styles.modalImage} />
                <div className={styles.modalInfo}>
                  <p>{selectedService.name}</p>
                  <p className={styles.costInfoLabel}>Pago inicial:</p>
                  <p className={styles.price} style={{ color: "blue" }}>MX$ {selectedService.cashAdvance}.00</p>
                  <p className={styles.costInfoLabel}>Informacion de costos:</p>
                  <img
                    src={selectedService.imageDetail}
                    alt="Detalle"
                    onClick={() => setIsZoomed(!isZoomed)}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                {isZoomed && selectedService && (
                  <div
                    onClick={() => setIsZoomed(!isZoomed)}
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
              <Button variant="info" onClick={() => openStepsModal(selectedService.idTransact)}>Ver pasos</Button>
              <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
      <Modal
        show={showStepsModal}
        onHide={() => setShowStepsModal(false)}
        centered
        className={styles.modalSteps}
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">Pasos del trámite</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {steps.length > 0 ? (
            <ol className={styles.stepsList} style={{ paddingLeft: '0' }}>
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
            <div className={styles.noStepsContainer}>
              <p className={styles.loadingMessage}>
                No hay pasos disponibles para este trámite.
                ¿Desea agregar pasos al trámite?
              </p>
              <Button
                onClick={() => navigate("/RegistrarPasos", { state: { serviceID: idService } })}
                className={`${styles.btnAddSteps} btn-info`}
              >
                Agregar pasos
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => {
              setShowStepsModal(false);
              setSteps([]); // Clear the steps list
            }}
            className={styles.btnSecondary}
          >
            Cerrar
          </Button>
          {steps.length > 0 && (
            <Button
              variant="primary"
              onClick={() => navigate("/ActualizarPasos", { state: { serviceID: idService, isEditMode: true } })}
              className={styles.btnPrimary}
            >
              {'Actualizar'}
            </Button>)}
        </Modal.Footer>
      </Modal>
    </div>
  );
}