import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Home, Briefcase, Users, MessageSquare, HelpCircle, Mail, Phone } from "lucide-react";
import Logo from "./../img/logo.png";
import Fondo from "./../img/fondo.jpg";

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

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

  return (
    <>
      <style>{`
        .modern-navbar .navbar-nav .nav-link:hover {
          background-color: rgba(71, 85, 105, 0.5) !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }
        
        .modern-navbar .navbar-toggler {
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
        }
        
        .modern-navbar .navbar-toggler:focus {
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }
        
        .cta-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
        }
        
        @media (max-width: 991.98px) {
          .modern-navbar .navbar-collapse {
            background: rgba(19, 46, 60, 0.98);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            margin-top: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
        
        .section-demo {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F8FAFC, #E2E8F0);
          border-bottom: 1px solid #E2E8F0;
        }
        
        .section-content {
          text-align: center;
          max-width: auto;
          padding: 40px 20px;
        }
        
        .section-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1E293B;
          margin-bottom: 16px;
        }
        
        .section-description {
          font-size: 1.1rem;
          color: #64748B;
          line-height: 1.6;
        }
      `}</style>

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

          <div className="d-none d-lg-flex align-items-center">
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

      {/* Spacer */}
      <div style={{ height: '120px' }}></div>

      {/* Secciones */}
      {navSections.map((section) => (
        <section key={section.id} id={section.id} className="section-demo">
          {section.id === 'inicio' ? (
            <div style={{
              width: 'auto',
              minHeight: '100vh',
              backgroundImage: `url(${Fondo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Overlay oscuro para mejor legibilidad del texto */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1
              }}></div>
              
              <div className="section-content" style={{ position: 'relative', zIndex: 2, color: 'white', width: 'auto' }}>
                <div className="section-icon">
                  <section.icon size={40} color="white" />
                </div>
                <h2 className="section-title" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  Bienvenido a Consultoría JAS
                </h2>
                <p className="section-description" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  Subsidiaria TRAMIVISA - Ofrecemos soluciones integrales y consultoría especializada 
                  para impulsar el crecimiento de tu empresa con la más alta calidad y profesionalismo.
                </p>
              </div>
            </div>
          ) : (
            // Otras secciones con el diseño normal
            <div className="section-content">
              <div className="section-icon">
                <section.icon size={40} color="white" />
              </div>
              <h2 className="section-title">Sección {section.label}</h2>
              <p className="section-description">
                Aquí va el contenido de la sección {section.label.toLowerCase()}. 
                Puedes agregar tu propio contenido, imágenes, formularios o cualquier otro elemento 
                que necesites para tu sitio web.
              </p>
            </div>
          )}
        </section>
      ))}
    </>
  );
}