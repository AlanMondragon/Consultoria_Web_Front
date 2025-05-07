import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess,getStepById } from './../../api/api.js';
import Navbar from '../NavbarAdmin.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react'; // Iconos con Iconify
import ModalRegistrarTramite from './RegistrarTramite.jsx';
import { Modal, Button } from 'react-bootstrap';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './../../styles/ClienteServicios.css';

export default function AdministradorServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [steps, setSteps] = useState([])
  const [newSteps, setNewSteps] = useState([{ name: "", description: "", stepNumber: 1 }]); // Initialize newSteps state
  const [isEditingSteps, setIsEditingSteps] = useState(false);

  useEffect(() => {
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

  <ModalRegistrarTramite
         tramite={services}
       />

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
    }
  };

  // Modal handlers
  const openModal = async (service) => {
    setSelectedService(service);
    setModalIsOpen(true);
    await fetchStepsById(service.idTransact);
  };

  // Update the closeModal function to reset steps and remove inputs
  const closeModal = () => {
    setSelectedService(null);
    setModalIsOpen(false);
    setSteps([]); // Clear the steps list
    setNewSteps([{ name: "", description: "", stepNumber: 1 }]); // Reset the form fields and remove inputs
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

  // Flechas personalizadas con Iconify
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

  // Function to handle form submission
  const handleAddSteps = () => {
    console.log("Steps to add:", newSteps);
    // Add logic to save steps to the backend
    setNewSteps([{ name: "", description: "", stepNumber: 1 }]); // Reset the form after submission
  };

  // Function to handle step input changes
  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...newSteps];
    updatedSteps[index][field] = value;
    setNewSteps(updatedSteps);
  };

  // Function to add a new step input
  const addNewStepInput = () => {
    setNewSteps([...newSteps, { name: "", description: "", stepNumber: newSteps.length + 1 }]);
  };

  // Function to remove a step input
  const removeStep = (index) => {
    const updatedSteps = newSteps.filter((_, i) => i !== index);
    setNewSteps(updatedSteps);
  };

  const handleUpdateSteps = () => {
    setIsEditingSteps(true);
  };

  const handleStepEditChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <div className='fixed-top'>
        <Navbar title={"-Servicios"} />
      </div>
      <div className="services-slider">
        <h1 className="title">Servicios disponibles</h1>
        <Slider {...sliderSettings}>
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <img src={service.image} alt={service.name} />
              <h2>{service.description}</h2>
              <p>{truncateDescription(service.name, 150)}</p>
              <p style={{ color : "#000", fontWeight : "bold" }}>Pago inicial:</p>
              <p className="price">MX${formatPrice(service.cashAdvance)}</p>
              <Button className='btn-primary' style={{ backgroundColor: '#007bff', borderColor: '#0056b3' }} onClick={() => handleEditClick(service)}>Editar</Button>
              <Button className='btn-secondary m-1' style={{ backgroundColor: '#17a2b8', borderColor: '#117a8b' }} onClick={() => openStepsModal(service.idTransact)}>Ver pasos</Button>
              <Button className='btn-info' style={{ backgroundColor: '#17a2b8', borderColor: '#117a8b' }} onClick={() => openModal(service)}>Vista previa</Button>
            </div>
          ))}
        </Slider>
      </div>
      <div>
        <button className='botton-aggregate' onClick={() => navigate("/RegistrarServicio")}>Agregar Servicio</button>
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
                  <p style={{ color: "#000", fontWeight: "bold" }}>Informacion de costos:</p>
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
      <Modal
        show={showStepsModal}
        onHide={() => setShowStepsModal(false)}
        centered
        className="modal-steps"
      >
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
                  {isEditingSteps ? (
                    <>
                      <input
                        type="text"
                        value={step.name}
                        className='form-control'
                        onChange={(e) => handleStepEditChange(index, 'name', e.target.value)}
                        style={{
                          display: 'block',
                          width: '100%',
                          marginBottom: '10px',
                          padding: '10px',
                          borderRadius: '5px',
                          border: '1px solid #ccc'
                        }}
                      />
                      <textarea
                        value={step.description}
                        className='form-control'
                        onChange={(e) => handleStepEditChange(index, 'description', e.target.value)}
                        style={{
                          display: 'block',
                          width: '100%',
                          marginBottom: '10px',
                          padding: '10px',
                          borderRadius: '5px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </>
                  ) : (
                    step.name
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <>
            <p className="loading-message" style={{ fontStyle: 'italic', color: '#888', textAlign: 'center', padding: '20px 0' }}>
              No hay pasos disponibles para este trámite.
              Desea agregar pasos al trámite?
            </p>
            {newSteps.map((step, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <label htmlFor=""> Paso {index + 1} </label>
                <input
                  type="text"
                  className='form-control'
                  value={step.name}
                  onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
                <label htmlFor=""> Descripción del paso {index + 1}</label>
                <textarea
                  value={step.description}
                  className='form-control'
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
                <button
                  className='btn btn-danger mt-2 mb-5'
                  onClick={() => removeStep(index)}
                  style={{
                    display: 'block',
                    margin: '10px auto',
                    backgroundColor: '#dc3545',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '8px 20px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  Eliminar paso
                </button>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={addNewStepInput}
              style={{
                display: 'block',
                margin: '10px auto',
                backgroundColor: '#6c757d',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 20px',
                fontWeight: 'bold'
              }}
            >
              Agregar otro paso
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSteps}
              style={{
                display: 'block',
                margin: '10px auto',
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 20px',
                fontWeight: 'bold'
              }}
            >
              Guardar pasos
            </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => {
              setShowStepsModal(false);
              setSteps([]); // Clear the steps list
              setNewSteps([{ name: "", description: "", stepNumber: 1 }]); // Reset the form fields and remove inputs
            }}
            className="btn-secondary"
            style={{
              backgroundColor: '#6c757d',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 20px',
              fontWeight: 'bold'
            }}
          >
            Cerrar
          </Button>
          {steps.length > 0 && (
          <Button  
            variant="primary"
            onClick={isEditingSteps ? () => setIsEditingSteps(false) : handleUpdateSteps}
            className="btn-primary"
            style={{
              backgroundColor: '#007bff', 
              borderColor: '#0056b3',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 20px',
              fontWeight: 'bold'}}>
                {isEditingSteps ? 'Guardar' : 'Actualizar'}
              </Button>)}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
