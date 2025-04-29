import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Logo from '../img/logo.jpg';
import '../styles/Navbar.css';

export default function NavbarAdmin() {
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [id3, setId3] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setId1("/ServiciosAdmin-sm");
        setId2("/TramitesAdmin-sm");
        setId3("/ClientesAdmin-sm");
      } else {
        setId1("/ServiciosAdmin");
        setId2("/TramitesAdmin");
        setId3("/ClientesAdmin");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Navbar fixed="top" expand="lg" className="encabezado-navbar">
      <Container className="contenedor-navbar">
        <Button variant="link" className="boton-menu" onClick={toggleMenu}>
          <span className="navbar-toggler-icon"></span>
        </Button>

        <h1 className="titulo-navbar">Consultoria Jas</h1>

        <a href="/">
          <img src={Logo} alt="Logo" className="logo-navbar" />
        </a>
      </Container>

      {/* Opcional: aquí puedes meter el Nav de links si quieres que se despliegue */}
      {menuOpen && (
        <div className="menu-lateral">
          <Nav className="flex-column">
            <Nav.Link href={id1} className="link-menu">Servicios</Nav.Link>
            <Nav.Link href={id2} className="link-menu">Trámites</Nav.Link>
            <Nav.Link href={id3} className="link-menu">Clientes</Nav.Link>
          </Nav>
        </div>
      )}
    </Navbar>
  );
}
