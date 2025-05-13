import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Logo from '../img/logo.jpg';
import '../styles/Navbar.css';
import Swal from 'sweetalert2';
import { Icon } from '@iconify/react';


export default function NavbarAdmin({title}) {
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [id3, setId3] = useState("");
  const [id4, setId4] = useState("");
  const [id5, setId5] = useState("");
  const [id6, setId6] = useState("");
  const [id7, setId7] = useState("");


  const [menuOpen, setMenuOpen] = useState(false);
    const [iconKey, setIconKey] = useState(0);
  
    const recargarIcono = () => {
      setIconKey(prev => prev + 1); // Fuerza nuevo render al cambiar la key
    };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setId1("/ServiciosAdmin-sm");
        setId2("/TramitesAdmin-sm");
        setId3("/ClientesAdmin-sm");
        setId4("/HomeAdmin-sm");
        setId5("/Pagos-sm");
        setId6("/Perfil-sm");
        setId7("/Calendar-sm");

      } else {
        setId1("/ServiciosAdmin");
        setId2("/TramitesAdmin");
        setId3("/ClientesAdmin");
        setId4("/HomeAdmin");
        setId5("/Pagos");
        setId6("/Perfil");
        setId7("/Calendar");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  function cerrarSesion() {
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro que quieres cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Cancelar',
      cancelButtonText: 'Aceptar',
      
      
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Cancelado');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = '/';

      }
    });
  }

  return (
    <Navbar fixed="top" expand="lg" className="encabezado-navbar">
  <Container fluid className="contenedor-navbar">
    
    {/* Botón Hamburguesa */}
    <Button variant="link" className="boton-menu" onClick={toggleMenu}>
      <span className="navbar-toggler-icon"></span>
    </Button>

    {/* Título */}
    <h1 className="titulo-navbar">Consultoría JAS{title}</h1>

    {/* Logo + Botón cerrar sesión */}
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={Logo} alt="Logo" className="logo-navbar" />
        <Icon key={iconKey} icon="line-md:logout" width="50" height="50" color="black" onClick={cerrarSesion} onMouseMove={recargarIcono} style={{ cursor: 'pointer' }}/>      
    </div>

  </Container>

  {/* Menú lateral desplegable */}
  {menuOpen && (
    <div className="menu-lateral">
      <Nav className="flex-column">
        <Nav.Link href={id4} className="link-menu">Home</Nav.Link>
        <Nav.Link href={id7} className="link-menu">Calendario</Nav.Link>
        <Nav.Link href={id1} className="link-menu">Servicios</Nav.Link>
        <Nav.Link href={id2} className="link-menu">Trámites</Nav.Link>
        <Nav.Link href={id3} className="link-menu">Clientes</Nav.Link>
        <Nav.Link href={id5} className="link-menu">Pagos</Nav.Link>
        <Nav.Link href={id6} className="link-menu">Mi Perfil</Nav.Link>



      </Nav>
    </div>
  )}
</Navbar>

  );
}
