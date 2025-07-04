import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Row, Col, Table } from "react-bootstrap";
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
import 'leaflet/dist/leaflet.css';


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
  const [showNavbar, setShowNavbar] = useState(true);

  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
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


  useEffect(() => {
    fetchServices();
  }, []);

  const faqData = [
    {
      question: "¿Cuánto tiempo tarda el proceso de visa?",
      answer: "El tiempo de procesamiento varía según el tipo de servicio solicitado. Por ejemplo, para el trámite de eTA, el proceso suele tomar entre 30 minutos y 72 horas. En el caso de visa americana, el tiempo de espera puede oscilar entre 2 y 6 meses, dependiendo de lo acordado en el contrato. Cabe destacar que en CONSULTORÍA JAS siempre trabajamos para minimizar los tiempos de espera y agilizar cada trámite, buscando la mayor eficiencia posible para nuestros clientes."
    },
    {
      question: "¿Qué documentos necesito para solicitar una visa?",
      answer: "Los documentos requeridos varían según el tipo de visa y el país de destino. Por lo general, incluyen pasaporte vigente, fotografías, formularios completados, comprobantes financieros, carta de invitación (cuando sea necesario) y otros documentos específicos relacionados con el propósito del viaje. Nosotros te proporcionaremos una lista detallada y personalizada para que tengas toda la información clara y completa."
    },
    {
      question: "¿Ofrecen garantía de aprobación?",
      answer: "Aunque contamos con una alta tasa de éxito, no podemos garantizar la aprobación al 100%, ya que la decisión final recae en las autoridades consulares. No obstante, nos comprometemos a preparar tu solicitud con el máximo cuidado y profesionalismo, acompañándote en cada etapa del proceso para brindarte el mejor apoyo posible."
    },
    {
      question: "¿Cuáles son sus tarifas y métodos de pago?",
      answer: "Nuestras tarifas varían según el tipo de servicio, la complejidad del caso y la urgencia del trámite requerida por el solicitante. Ofrecemos precios competitivos, transparentes y con todos los costos incluidos, IVA incluido. Aceptamos pagos en efectivo, transferencias bancarias y tarjetas de crédito, además de ofrecer la opción de pago a meses sin intereses para mayor comodidad. Solicita una cotización gratuita y personalizada para conocer el costo específico de tu trámite."
    },
    {
      question: "¿Qué pasa si mi visa es rechazada?",
      answer: "En caso de que tu solicitud sea negada, puedes contactarnos para analizar tu caso a detalle y orientarte sobre las mejores alternativas para una segunda aplicación. En esta ocasión, solo deberás cubrir las cuotas arancelarias, y el pago de nuestros honorarios estará sujeto a la aprobación de tu documento. Nuestro equipo especializado en casos de rechazo estará contigo para brindarte todo el apoyo necesario y así aumentar las posibilidades de éxito en futuros intentos."
    },
    {
      question: "¿Atienden casos de emergencia o urgentes?",
      answer: "Sí, ofrecemos servicios de procesamiento urgente, incluso las 24 horas del día, los 7 días de la semana, siempre que sea posible. Evaluamos cada caso de manera personalizada y te informamos sobre las opciones de servicio rápido disponibles. Es importante considerar que estos trámites exprés pueden implicar costos adicionales, que en algunos casos pueden llegar hasta el doble del costo normal."
    }
  ];

  const handleFaqToggle = (index) => {
    setFaqActiveIndex(faqActiveIndex === index ? null : index);
  };
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
    <button
      type="button"
      className={styles.slickArrowPrev}
      onClick={onClick}
      aria-label="Anterior"
      style={{
        background: 'rgba(59, 130, 246, 0.7)',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
        transition: 'background 0.2s, transform 0.2s',
        position: 'absolute',
        zIndex: 2,
        left: -24,
        top: 'calc(50% - 24px)',
        cursor: 'pointer'
      }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'}
      onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.7)'}
    >
      <Icon icon="mdi:chevron-left" width="50" height="50" color="#fff" />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      type="button"
      className={styles.slickArrowNext}
      onClick={onClick}
      aria-label="Siguiente"
      style={{
        background: 'rgba(59, 130, 246, 0.7)',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
        transition: 'background 0.2s, transform 0.2s',
        position: 'absolute',
        zIndex: 2,
        right: -24,
        top: 'calc(50% - 24px)',
        cursor: 'pointer'
      }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'}
      onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.7)'}
    >
      <Icon icon="mdi:chevron-right" width="50" height="50" color="#fff" />
    </button>
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

  const singint = () => {
    window.location.href = '/Login';
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
    { id: 'inicio', label: 'Inicio', icon: Home, href: '/#' },
    { id: 'servicios', label: 'Servicios', icon: Briefcase, href: '#servicios' },
    { id: 'nosotros', label: 'Nosotros', icon: Users, href: '#nosotros' },
    { id: 'testimonios', label: 'Testimonios', icon: MessageSquare, href: '#testimonios' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, href: '#faq' },
    { id: 'contacto', label: 'Contacto', icon: Mail, href: '#contacto' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  // --- MODIFICA ESTA CONSTANTE ---
  const navbarStyle = {
    backgroundColor: isScrolled ? 'rgba(19, 46, 60, 0.95)' : '#132E3C',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    // Modifica la transición para incluir 'top'
    transition: 'top 0.4s ease-in-out, background-color 0.3s ease',
    height: '120px',
    boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    // Añade la propiedad 'top' que cambiará dinámicamente
    top: showNavbar ? '0' : '-120px'
  };
  // --- FIN DEL CÓDIGO A MODIFICAR ---
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
              <p style={subtitleStyle}>JOHNRIC</p>
            </div>
          </Navbar.Brand>

          <div className="d-none d-lg-flex align-items-center ms-auto">
            <Button
              style={ctaButtonStyle}
              className="cta-button me-3"
              onClick={() => window.location.href = 'tel:+527779835782'}
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
      <section id="inicio" className={styles.inicio}>
        <div className={styles.overlay}></div>

        <Container style={{
          position: 'relative',
          zIndex: 2
        }}>
          <div className="text-center text-white">
            <p className={styles.descripcion}>
              En <strong>CONSULTORÍA JAS </strong>somos especialistas en trámites migratorios. Ofrecemos un servicio profesional, transparente y enfocado en brindar soluciones efectivas, basadas en un análisis detallado del perfil de cada solicitante.
              Nuestro equipo está conformado en su mayoría por profesionales jóvenes con grado académico superior, lo que nos permite combinar preparación técnica con una visión actualizada y dinámica del entorno migratorio.
              Además, nos capacitamos constantemente en nuevas políticas, cambios normativos y estrategias migratorias que representen un beneficio real para nuestros clientes. Esta actualización continua nos permite ofrecer asesoría precisa, segura y alineada a los lineamientos más recientes.
              En CONSULTORÍA JAS, trabajamos con integridad, responsabilidad y excelencia para generar confianza y acompañar a cada cliente en su proceso con total compromiso y ética profesional.            </p>
          </div>
        </Container>
      </section>

      {/* Sección Servicios */}
      <section id="servicios" className={styles.seccion}>
        <Container >
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
                        <button
                          className={styles.cardButton}
                          onClick={() => singint()}
                        >
                          Obtener
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
            <Icon icon="teenyicons:users-solid" width="50" height="50" style={{ color: "#f0f0f0" }} />
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
                    Ser una consultoría líder en servicios migratorios a nivel nacional e internacional, reconocida por la calidad, precisión y ética en cada gestión.
                    Aspiramos a transformar la experiencia del solicitante, facilitando sus trámites con información clara, asesoría profesional y atención personalizada, superando sus expectativas y generando confianza en cada etapa del proceso.                  </p>
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
                    Ser una empresa reconocida por su enfoque genuino en el servicio al cliente, su compromiso constante y su capacidad para ofrecer soluciones profesionales que respondan eficazmente a las necesidades de cada persona.                  </p>
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
                      Trabajo en equipo:
                    </h4>
                    <p className={styles.valorText}>
                      Se fomenta a través del apoyo mutuo, el respeto y la confianza, promoviendo la colaboración mediante el intercambio de conocimientos y experiencias.                    </p>
                  </div>

                  {/* Innovación */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorInnovacion}`}>
                      <div className={styles.valorDot}></div>
                      Orientación al logro:
                    </h4>
                    <p className={styles.valorText}>
                      Actuamos alineados con la visión, misión y objetivos de la organización, asumiendo con responsabilidad los resultados obtenidos.
                    </p>
                  </div>

                  {/* Honestidad */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorHonestidad}`}>
                      <div className={styles.valorDot}></div>
                      Innovación y creatividad:
                    </h4>
                    <p className={styles.valorText}>
                      Impulsamos la generación y desarrollo constante de ideas y soluciones que aporten valor y mejoren nuestros procesos.
                    </p>
                  </div>

                  {/* Confianza */}
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorConfianza}`}>
                      <div className={styles.valorDot}></div>
                      Honestidad:
                    </h4>
                    <p className={styles.valorText}>
                      Mantenemos una comunicación realista y transparente respecto a las expectativas y objetivos de cada cliente.                    </p>
                  </div>
                  <div className={styles.valorItem}>
                    <h4 className={`${styles.valorHeader} ${styles.colorAzulBlanco}`}>
                      <div className={styles.valorDot}></div>
                      Confianza:
                    </h4>
                    <p className={styles.valorText}>
                      Respaldamos nuestro trabajo con experiencia demostrable y un enfoque profesional para abordar y resolver las necesidades de nuestros clientes.
                    </p>                 
                     </div>

                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Sección Testimonios */}
      <section id="testimonios" className={styles.testimoniosSection}>
        <div className={styles.testimoniosContainer}>
          <div className={styles.testimoniosHeader}>
            <div className={styles.sectionIcon}>
              <MessageSquare size={40} color="#60A5FA" />
            </div>
            <h2 className={styles.testimoniosTitle}>Testimonios</h2>
            <p className={styles.testimoniosDescription}>
              Nuestros clientes comparten sus experiencias positivas con nuestros servicios,
              destacando la eficiencia y profesionalismo de nuestro equipo.
            </p>
          </div>

          <div className={styles.testimoniosGrid}>
            {[
              "1yqEprSPRX7USlNl2mBriQMN22Z5ZTYPx",
              "17BUblslsO4d0iNXUFrZJjt_g4C3G-Sya",
              "1fMGEVv1H7XodRR9sbFXpWZobYcETVQOA",
              "123Iyc3EM6oJ6BqGm0mZAei9gtCo_GzzM",
              "11KCqJy3G2FrMsxFm5QnRghLQETZAZ3GR",
              "1eoeiepTjQrM5pfCSPrQUcJAE6zsgHiwf",
              "1UmFZwj7_LolAA1rCYpJnp9HtmdiQbcRw",
              "1VXZBF5XIqoq8Jo44iXTRav3sc3UiwnfM",
              "1ZSTDl2Ia-CqNKD13BUVorwQmufuBij_-",
              "1QXlAypI-58YVcJiPgBEiI4HDqLJjBPhj",
              "1ORluy_SDTlyh2DfMj_6mYsy9FtWD5CZu"
            ].map((videoId, index) => (
              <div key={index} className={`${styles.testimonioCard} ${styles.fadeInUp}`}>
                <iframe
                  src={`https://drive.google.com/file/d/${videoId}/preview`}
                  className={styles.testimonioImagenFrame}
                  allow="autoplay"
                  title={`Testimonio ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      <section id="faq" className={styles.testimoniosSection}>
        <div className={styles.faqContainer}>
          <div className={styles.faqHeader}>
            <div className={styles.sectionIcon}>
              <HelpCircle size={40} color="#3B82F6" />
            </div>
            <h2 className={styles.testimoniosTitle}>Preguntas Frecuentes</h2>
            <p className={styles.testimoniosDescription}>
              Resolvemos tus dudas más comunes sobre nuestros servicios y procesos,
              para que tengas toda la información que necesitas.
            </p>
          </div>

          <div className={styles.faqList}>
            {faqData.map((faq, index) => (
              <div key={index} className={`${styles.faqItem} ${styles.fadeInUp}`}>
                <button
                  className={`${styles.faqQuestion} ${faqActiveIndex === index ? 'active' : ''}`}
                  onClick={() => handleFaqToggle(index)}
                >
                  <span>{faq.question}</span>
                  <Icon
                    icon="mdi:chevron-down"
                    className={`${styles.faqIcon} ${faqActiveIndex === index ? styles.active : ''}`}
                  />
                </button>
                <div className={`${styles.faqAnswer} ${faqActiveIndex === index ? styles.active : ''}`}>
                  <div className={styles.faqAnswerContent}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contacto" style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        overflowX: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '60px 0 40px 0',
        color: '#FFFFFF',
        marginBottom: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <Container style={{ position: 'relative', zIndex: 1 }}>
          {/* Header section */}
          <Row className="mb-5">
            <Col className="text-center">
              <h3 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                Consultoría JAS
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#94A3B8',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Tu socio de confianza en consultoría especializada y procesos de visado
              </p>
            </Col>
          </Row>

          <Row>
            {/* Contact Section */}
            <Col lg={6} className="mb-4">
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%'
              }}>
                <h5 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '25px',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Icon icon="material-symbols:contact-phone" width="28" height="28" />
                  Contacto
                </h5>

                {/* Phone numbers */}
                <div style={{ marginBottom: '25px' }}>
                  {[
                    '(777) 983-57-82 Telefono fijo Jiutepec',
                    '(777) 219-36-13 Whatsapp Jiutepec',
                    '(777) 992-80-09 Telefono fijo Cuernavaca',
                    '(777) 301-34-99 Whatsapp Cuernavaca',

                  ].map((phone, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      padding: '8px 0',
                      borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}>
                      <Icon icon="material-symbols:phone" width="18" height="18" style={{ color: '#60A5FA', marginRight: '12px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#E2E8F0' }}>{phone}</span>
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div style={{ marginBottom: '25px' }}>
                  <a
                    href="mailto:consultoriacomercializacionjas@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: '#60A5FA',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(96, 165, 250, 0.1)',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(96, 165, 250, 0.2)';
                      e.target.style.transform = 'translateX(5px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(96, 165, 250, 0.1)';
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    <Icon icon="skill-icons:gmail-light" width="24" height="24" />
                    <span style={{ marginLeft: '12px', fontSize: '0.9rem' }}>
                      consultoriacomercializacionjas@gmail.com
                    </span>
                  </a>
                </div>

                {/* Maps */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: '2px solid rgba(96, 165, 250, 0.3)'
                  }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d471.95396808502073!2d-99.175762!3d18.859035!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce77d2ecc4620f%3A0x4b24c3ee3c11823c!2sCONSULTOR%C3%8DA%20JAS!5e0!3m2!1ses!2sus!4v1749226877006!5m2!1ses!2sus"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación Consultoría JAS"
                    />
                  </div>
                  <div style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: '2px solid rgba(96, 165, 250, 0.3)'
                  }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d235.8978879221942!2d-99.18634366883958!3d18.915178042630195!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce756057cc2e47%3A0x1aba5bfb8855eb3e!2sCONSULTOR%C3%8DA%20JAS!5e0!3m2!1ses!2sus!4v1749487537955!5m2!1ses!2sus"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación Plaza Novum"
                    />
                  </div>
                </div>
              </div>
            </Col>

            {/* Social Media & Resources Section */}
            <Col lg={6} className="mb-4">
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%'
              }}>
                <h5 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '25px',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Icon icon="material-symbols:share" width="28" height="28" />
                  Síguenos
                </h5>

                {/* Social Media Links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                  {[
                    { icon: 'logos:facebook', url: 'https://www.facebook.com/AsesoriaEspecializadaConsultoriaJAS', name: 'Facebook' },
                    { icon: 'skill-icons:instagram', url: 'https://www.instagram.com/somosconsultoriajas', name: 'Instagram' },
                    { icon: 'logos:tiktok-icon', url: 'https://www.tiktok.com/@consultoriajas', name: 'TikTok Principal' },
                    { icon: 'logos:tiktok-icon', url: 'https://www.tiktok.com/@consultoriajhonric', name: 'TikTok Secundario' },
                    { icon: 'logos:whatsapp-icon', url: 'https://wa.me/message/KXGI4YPWAQ3GC1', name: 'WhatsApp' },
                    { icon: 'bi:threads-fill', url: 'https://www.threads.net/@somosconsultoriajas', name: 'Threads' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: '#E2E8F0',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(96, 165, 250, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Icon icon={social.icon} width="24" height="24" style={{ marginRight: '12px' }} />
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>

                {/* Resources Section */}
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '25px'
                }}>
                  <h6 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '20px',
                    color: '#60A5FA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Icon icon="material-symbols:library-books" width="24" height="24" />
                    Recursos
                  </h6>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <a
                      href="https://www.canva.com/design/DAGZeEd0ITA/XUMr9VAQxncvoI1_XiJFxg/view?utm_content=DAGZeEd0ITA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h8c04945ce4"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: '#E2E8F0',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Icon icon="material-symbols:monitoring" width="24" height="24" style={{ color: '#22C55E', marginRight: '12px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Porcentaje de Aprobación</span>
                    </a>

                    <a
                      href="https://www.canva.com/design/DAGbpOhHsh4/E0JuiDkBo7NEopyKalACEg/view?utm_content=DAGbpOhHsh4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h13366f006e"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '15px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: '#E2E8F0',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Icon icon="mingcute:paper-line" width="24" height="24" style={{ color: '#A855F7', marginRight: '12px', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px' }}>Manual de Visado</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.4' }}>
                          "¿Cómo llevar un proceso de visado exitoso?"
                        </div>
                      </div>
                    </a>
                    {/* Tabla de horarios con estilos CSS módulo */}
                    <div className={styles.scheduleContainer}>
                      <h6 className={styles.scheduleTitle}>
                        <Icon icon="material-symbols:schedule" width="20" height="20" />
                        Horarios de Atención
                      </h6>

                      <div className={styles.tableWrapper}>
                        <table className={styles.scheduleTable}>
                          <thead>
                            <tr className={styles.tableHeader}>
                              <th className={styles.headerCellLeft}>
                                Día
                              </th>
                              <th className={styles.headerCellCenter}>
                                Horario de Oficinas
                              </th>
                              <th className={styles.headerCellCenter}>
                                Horario Online
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { dia: 'Lunes', oficina: '9:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Martes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Miércoles', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Jueves', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Viernes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Sábado', oficina: '8:00 am - 12:00 pm', online: 'Cerrado' }
                            ].map((horario, index) => (
                              <tr key={index} className={styles.tableRow}>
                                <td className={styles.dayCell}>
                                  <div className={horario.dia === 'Sábado' ? styles.dayIndicatorSpecial : styles.dayIndicatorActive}></div>
                                  {horario.dia}
                                </td>
                                <td className={styles.timeCell}>
                                  <div className={styles.officeBadge}>
                                    <Icon icon="material-symbols:business" width="16" height="16" style={{ color: '#60A5FA' }} />
                                    {horario.oficina}
                                  </div>
                                </td>
                                <td className={styles.timeCell}>
                                  {horario.online !== 'Cerrado' ? (
                                    <div className={styles.onlineBadge}>
                                      <Icon icon="material-symbols:wifi" width="16" height="16" />
                                      {horario.online}
                                    </div>
                                  ) : (
                                    <div className={styles.closedBadge}>
                                      <Icon icon="material-symbols:close" width="16" height="16" />
                                      Cerrado
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Nota adicional */}
                      <div className={styles.infoNote}>
                        <Icon icon="material-symbols:info" width="20" height="20" className={styles.infoIcon} />
                        <p className={styles.infoText}>
                          Los horarios pueden variar en días festivos. Contáctanos para confirmar disponibilidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Footer Bottom */}
          <Row className="mt-5">
            <Col className="text-center">
              <div className={styles.foote}>
                <p>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTerminos(); }}>
                    Términos y Condiciones
                  </a>{' '}
                  y{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadPrivacidad(); }}>
                    Política de Privacidad
                  </a>
                </p>
                <p className={styles.texto}>
                  &copy; {new Date().getFullYear()} <span style={{ color: '#60A5FA', fontWeight: '600' }}>Consultoría JAS</span>.
                  Todos los derechos reservados.
                </p>
              </div>
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
          onShowSteps={handleOpenStepsModal}

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