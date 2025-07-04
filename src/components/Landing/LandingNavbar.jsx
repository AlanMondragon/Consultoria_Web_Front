import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Home, Briefcase, Users, MessageSquare, HelpCircle, Mail, Phone, LogInIcon } from "lucide-react";
import Logo from "./../../img/logo.png";
import styles from '../../styles/Landing/LandingNavbar.module.css';

export default function LandingNavbar({ 
  isScrolled, 
  activeSection, 
  navSections, 
  handleNavClick, 
  showNavbar 
}) {
  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`${styles.modernNavbar} ${isScrolled ? styles.scrolled : ''}`}
      style={{ top: showNavbar ? '0' : '-120px' }}
    >
      <Container fluid>
        <Navbar.Brand href="#" className={styles.navbarBrand}>
          <div className={styles.logoContainer}>
            <img 
              src={Logo} 
              className={styles.navbarLogo} 
              alt="Consultoría JAS Logo" 
            />
          </div>
          <div className="d-none d-md-block">
            <h1 className={styles.navbarTitle}>Consultoría JAS</h1>
            <p className={styles.navbarSubtitle}>JOHNRIC</p>
          </div>
        </Navbar.Brand>

        <div className="d-none d-lg-flex align-items-center ms-auto">
          <Button
            className={`${styles.ctaButton} me-3`}
            onClick={() => window.location.href = 'tel:+527779835782'}
          >
            <Phone size={16} />
            Cotizar
          </Button>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className={styles.navbarToggle} />

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
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <IconComponent size={16} className={styles.navIcon} />
                  {section.label}
                </Nav.Link>
              );
            })}
            <Button
              className={styles.sessionButton}
              onClick={() => window.location.href = '/Login'}
            >
              <LogInIcon size={16} />
              Iniciar sesión
            </Button>
          </Nav>

          <div className="d-lg-none mt-3">
            <Button
              className={`${styles.ctaButton} w-100`}
            >
              <Phone size={16} />
              Solicitar Cotización
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
