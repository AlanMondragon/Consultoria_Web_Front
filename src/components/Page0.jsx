import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Row, Col } from "react-bootstrap";
import { Home, Briefcase, Users, MessageSquare, HelpCircle, Mail, Phone, Info, LogInIcon } from "lucide-react";
import Logo from "./../img/logo.png";
import Fondo from "./../img/fondo.jpg";
import { getAllProcess, getStepById } from './../api/api.js';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import ServiceDetailsModal from './Cliente/Modals/ServiceDetailsModal.jsx';
import StepsModal from './Cliente/Modals/StepsModal.jsx';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../styles/ServiciosCards.module.css';

export default function Page0() {
  const [services, setServices] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

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
    ],

    appendArrows: '.slider-arrows-container',
  };

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

  const handleOpenStepsModal = async (idTransact) => {
    console.log("idTransact:", idTransact);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };

  const handleCloseStepsModal = () => {
    setStepsModalOpen(false);
    setSteps([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (let i = navSections.length - 1; i >= 0; i--) {
        const section = navSections[i];
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navSections = [
    { id: 'inicio', label: 'Inicio', icon: Home, href: '#' },
    { id: 'servicios', label: 'Servicios', icon: Briefcase, href: '#servicios' },
    { id: 'nosotros', label: 'Nosotros', icon: Users, href: '#nosotros' },
    { id: 'testimonios', label: 'Testimonios', icon: MessageSquare, href: '#testimonios' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, href: '#faq' },
    { id: 'contacto', label: 'Contacto', icon: Mail, href: '#contacto' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const navbarStyle = {
    backgroundColor: isScrolled ? 'rgba(19, 46, 60, 0.95)' : '#132E3C',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease',
    height: '120px',
    boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  };

  const logoStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: '14px',
    color: '#94A3B8',
    fontWeight: '400'
  };

  const navLinkStyle = (isActive) => ({
    color: isActive ? '#FFFFFF' : '#CBD5E1',
    backgroundColor: isActive ? '#3B82F6' : 'transparent',
    borderRadius: '8px',
    padding: '8px 16px',
    margin: '0 4px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
    border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
    boxShadow: isActive ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
  });

  const ctaButtonStyle = {
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease'
  };
  const sesionButtonStyle = {
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',

    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'right',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="modern-navbar px-3"
        style={navbarStyle}
      >
        <Container fluid>
          <Navbar.Brand href="#" style={brandStyle}>
            <div>
              <img src={Logo} style={{ color: 'white', fontWeight: 'bold', width: '120px' }} alt="Logo" />
            </div>
            <div className="d-none d-md-block">
              <h1 style={titleStyle}>Consultoría JAS</h1>
              <p style={subtitleStyle}>Subsidiaria TRAMIVISA</p>
            </div>
          </Navbar.Brand>

          <div className="d-none d-lg-flex align-items-center ms-auto">
            <Button
              style={ctaButtonStyle}
              className="cta-button me-3"
              onClick={() => window.location.href = '#contacto'}
            >
              <Phone size={16} />
              Cotizar
            </Button>

          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navSections.map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <Nav.Link
                    key={section.id}
                    href={section.href}
                    onClick={() => handleNavClick(section.id)}
                    style={navLinkStyle(isActive)}
                  >
                    <IconComponent size={16} style={{ marginRight: '8px' }} />
                    {section.label}
                  </Nav.Link>
                );
              })}
              <Button
                style={sesionButtonStyle}
                className="cta-button"
                onClick={() => window.location.href = '/Login'}
              >
                <LogInIcon size={16} />
                Iniciar sesión
              </Button>
            </Nav>

            <div className="d-lg-none mt-3">
              <Button
                style={ctaButtonStyle}
                className="cta-button w-100"
              >
                <Phone size={16} />
                Solicitar Cotización
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ height: '85px' }}></div>

      {/* Sección Inicio */}
      <section id="inicio" style={{
        backgroundImage: `url(${Fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}></div>

        <Container style={{
          position: 'relative',
          zIndex: 2
        }}>
          <div className="text-center text-white">
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
              Consultoría JAS
            </h1>
            <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto 40px' }}>
              Somos una empresa especializada en trámites migratorios, comprometida con brindar un servicio de calidad, transparente y orientado a las necesidades de cada cliente. Nos destacamos por nuestro profesionalismo, atención personalizada y enfoque en la satisfacción del usuario, guiados por valores como la honestidad, la confianza, el trabajo en equipo y la innovación.
            </p>
          </div>
        </Container>
      </section>

      {/* Sección Servicios */}
      <section id="servicios" style={{
        backgroundColor: '#132E3C',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container style={{ marginTop: '60px', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#FFFFFF', textAlign: 'center' }}>
            Nuestros Servicios
          </h1>
          {services.length > 0 ? (
            <Slider {...sliderSettings}>
              {services.map((service) => (
                <div key={service.idTransact} className={styles.cardContainer}>
                  <div className={styles.card}>
                    <img
                      src={service.image}
                      alt={service.name}
                      className={styles.cardImage}
                      onClick={() => handleOpenDetailsModal(service)}
                    />
                    <div className={styles.cardBody}>
                      <h5 className={styles.cardTitle}>{service.name}</h5>
                      <p className={styles.cardDescription}>
                        {truncateDescription(service.description, 100)}
                      </p>
                      <div className={styles.cardButtons}>
                        <button
                          className={styles.cardButton}
                          onClick={() => handleOpenStepsModal(service.idTransact)}
                        >
                          Ver Pasos
                        </button>
                        <button
                          className={styles.cardButton}
                          onClick={() => handleOpenDetailsModal(service)}
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-white">Cargando servicios...</p>
          )}
        </Container>
      </section>

      {/* Sección Nosotros */}
      <section id="nosotros" className={styles.nosotrosSection}>
        {/* Efectos de fondo */}
        <div className={styles.backgroundEffect1}></div>
        <div className={styles.backgroundEffect2}></div>

        <Container>
          {/* Header de la sección */}
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Info size={40} color="#FFFFFF" />
            </div>
            <h2 className={styles.sectionTitle}>
              Sobre Nosotros
            </h2>
            <div className={styles.sectionDivider}></div>
          </div>

          {/* Contenido principal */}
          <Row className="align-items-center">
            {/* Columna izquierda - Misión y Visión */}
            <Col lg={6} className="mb-5 mb-lg-0">
              {/* Misión */}
              <div className={`${styles.card} ${styles.cardMision}`}>
                <div className={styles.cardEffect1}></div>

                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIconContainer} ${styles.iconMision}`}>
                    <Briefcase size={24} color="#FFFFFF" />
                  </div>
                  <h3 className={styles.cardTitle}>
                    MISIÓN
                  </h3>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.cardText}>
                    "Brindar servicio de calidad a nuestros clientes, informando y facilitando los trámites que deseen, para cumplir con sus expectativas y hacerlos sentir satisfechos."
                  </p>
                </div>
              </div>

              {/* Visión */}
              <div className={`${styles.card} ${styles.cardVision}`}>
                <div className={styles.cardEffect2}></div>

                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIconContainer} ${styles.iconVision}`}>
                    <Users size={24} color="#FFFFFF" />
                  </div>
                  <h3 className={styles.cardTitle}>
                    VISIÓN
                  </h3>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.cardText}>
                    "Ser una empresa reconocida por su mentalidad de servicio al cliente, compromiso y resolución profesional de las necesidades de cada cliente."
                  </p>
                </div>
              </div>
            </Col>

            {/* Columna derecha - Valores */}
            <Col lg={6}>
              <div className={`${styles.card} ${styles.cardValores}`}>
                <div className={styles.cardEffect3}></div>

                <div className={styles.valoresHeader}>
                  <div className={`${styles.cardIconContainer} ${styles.iconValores}`}>
                    <MessageSquare size={24} color="#FFFFFF" />
                  </div>
                  <h3 className={styles.cardTitle}>
                    VALORES
                  </h3>
                </div>

                <div className={styles.valoresContainer}>
                  {/* Trabajo en equipo */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorTrabajoEquipo}`}>
                      <div className={styles.valorDot}></div>
                      Trabajo en equipo
                    </h4>
                    <p className={styles.valorText}>
                      Se demuestra con el apoyo, respeto, y confianza, compartiendo conocimientos y experiencias.
                    </p>
                  </div>

                  {/* Orientación al logro */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorOrientacionLogro}`}>
                      <div className={styles.valorDot}></div>
                      Orientación al logro
                    </h4>
                    <p className={styles.valorText}>
                      Teniendo en cuenta la visión, misión y objetivos de la organización, asumiendo la responsabilidad de los resultados.
                    </p>
                  </div>

                  {/* Innovación */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorInnovacion}`}>
                      <div className={styles.valorDot}></div>
                      Innovación y creatividad
                    </h4>
                    <p className={styles.valorText}>
                      Basadas en la generación y desarrollo de ideas y soluciones.
                    </p>
                  </div>

                  {/* Honestidad */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorHonestidad}`}>
                      <div className={styles.valorDot}></div>
                      Honestidad
                    </h4>
                    <p className={styles.valorText}>
                      Ser realistas con las expectativas y la definición de objetivos de los clientes.
                    </p>
                  </div>

                  {/* Confianza */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorConfianza}`}>
                      <div className={styles.valorDot}></div>
                      Confianza
                    </h4>
                    <p className={styles.valorText}>
                      Poseer una experiencia demostrable y profesional al problema que enfrenta el cliente.
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Sección Testimonios */}
      <section id="testimonios" style={{
        width: '100vw', // Cambiado de 100%
        marginLeft: 'calc(-50vw + 50%)', // Añadido
        overflowX: 'hidden', // Añadido para ser específico, o usar 'hidden'
        padding: '80px 0',
        background: 'linear-gradient(135deg, #FFFFFF, #F1F5F9)',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <Container>
          <div className="section-content">
            <div className="section-icon">
              <Users size={40} color="#FFFFFF" />
            </div>
            <h2 className="section-title">Testimonios</h2>
            <p className="section-description">
              Nuestros clientes comparten sus experiencias positivas con nuestros servicios, destacando la eficiencia y profesionalismo de nuestro equipo.
            </p>
          <iframe
  src="https://drive.google.com/file/d/1kJQ6pkJ8HKGnw0oRvVPAOAUsDEJOv4-o/preview"
  width="300"
  height="300"
  style={{ border: 'none', borderRadius: '10px' }}
></iframe>
 <iframe
  src="https://drive.google.com/file/d/1n2y9K9kwE6NFvn8JKmP47kfK2Lef6Rp4/preview"
  width="300"
  height="300"
  style={{ border: 'none', borderRadius: '10px' }}
></iframe>
<iframe
  src="https://drive.google.com/file/d/1tGOxxyTQoqD2Q-HiziUGYDUaJNzUf-Tt/preview"
  width="300"
  height="300"
  style={{ border: 'none', borderRadius: '10px' }}
></iframe>
<iframe
  src="https://drive.google.com/file/d/1uWflYR2B3o5AU8kq3EUMzx5E10d4zH57/preview"
  width="300"
  height="300"
  style={{ border: 'none', borderRadius: '10px' }}
></iframe>




          </div>
        </Container>
      </section>

      {/* Sección FAQ */}
      <section id="faq" style={{
        width: '100vw', // Cambiado de 100%
        marginLeft: 'calc(-50vw + 50%)', // Añadido
        overflowX: 'hidden', // Añadido
        padding: '80px 0',
        background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <Container>
          <div className="section-content">
            <div className="section-icon">
              <HelpCircle size={40} color="#FFFFFF" />
            </div>
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-description">
              Resolvemos tus dudas más comunes sobre nuestros servicios y procesos, para que tengas toda la información que necesitas.
            </p>
          </div>
        </Container>
      </section>

      {/* Footer/Contacto */}
      <footer id="contacto" style={{
        width: '100vw', // Cambiado de 100%
        marginLeft: 'calc(-50vw + 50%)', // Añadido
        overflowX: 'hidden', // Añadido
        backgroundColor: '#132E3C',
        padding: '40px 0',
        color: '#FFFFFF'
      }}>
        <Container>
          <Row>
            <Col md={6}>
              <h5>Contacto</h5>
              <p>Teléfono: (777) 983-57-82 </p>
              <p>Teléfono: (777) 301-34-99 </p>
              <p>Gmail: <a href="mailto:consultoriacomercializacionjas@gmail.com" style={{ color: '#60A5FA' }}>consultoriacomercializacionjas@gmail.com</a></p>
              <p>Dirección: Calle Falsa 123, Ciudad</p>
            </Col>

            <Col md={6}>
              <h5>Redes Sociales</h5>
              <p>
                <a href="https://www.facebook.com/AsesoriaEspecializadaConsultoriaJAS" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>Facebook</a>
              </p>
              <p>
                <a href="https://www.instagram.com/somosconsultoriajas" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>Instagram</a>
              </p>
              <p>
                <a href="https://www.tiktok.com/@consultoriajas" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>Tiktok Consultoría JAS</a>
              </p>
              <p>
                <a href="https://www.tiktok.com/@consultoriajhonric" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>Tiktok Consultoría JHONRIC</a>
              </p>
              <p>
                <a href="https://wa.me/message/KXGI4YPWAQ3GC1" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>WhatsApp</a>
              </p>
              <p>
                <a href="https://www.canva.com/design/DAGZeEd0ITA/XUMr9VAQxncvoI1_XiJFxg/view?utm_content=DAGZeEd0ITA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h8c04945ce4" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>PORCENTAJE DE APROVACIÓN ACTUALIZADO</a>
              </p>
              <p>
                <a href="https://www.canva.com/design/DAGbpOhHsh4/E0JuiDkBo7NEopyKalACEg/view?utm_content=DAGbpOhHsh4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h13366f006e" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>ADQUIRIR MANUAL "¿CÓMO LLEVAR UN PROCESO DE VISADO EXITOSO?"</a>
              </p>
              <p>
                <a href="https://www.threads.net/@somosconsultoriajas" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA' }}>Threads</a>
              </p>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col className="text-center">
              <p>&copy; {new Date().getFullYear()} Consultoría JAS. Todos los derechos reservados.</p>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Modales */}
      {detailsModalOpen && selectedService && (
        <ServiceDetailsModal
          show={detailsModalOpen}
          onHide={handleCloseDetailsModal}
          service={selectedService}
          steps={steps}
          loading={stepsLoading}
          zoomed={isZoomed}
          onZoomToggle={handleToggleZoom}
        />
      )}

      {stepsModalOpen && (
        <StepsModal
          show={stepsModalOpen}
          onHide={handleCloseStepsModal}
          steps={steps}
          loading={stepsLoading}
        />
      )}
    </>
  );
}