import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Icon } from '@iconify/react';
import Logo from '../img/logo.png';
import logoutImg from '../img/salida.gif';
import '../styles/Sidebar.css';

export default function NavbarAdmin({ title }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : true;
  });

  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [id3, setId3] = useState("");
  const [id4, setId4] = useState("");
  const [id5, setId5] = useState("");
  const [id6, setId6] = useState("");
  const [id7, setId7] = useState("");

  // Manejo de rutas responsivas
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

  // Guarda el estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  function cerrarSesion() {
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro que quieres cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Cancelar',
      cancelButtonText: 'Aceptar',
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = '/';
      }
    });
  }

  return (
    <div className="layout">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-logo">
          <img src={Logo} alt="logo" />
        </div>
        <div className="navbar-title">
          <h1>Consultoría JAS {title}</h1>
        </div>
        <div className="navbar-logout" onClick={cerrarSesion}>
          <Icon icon="line-md:logout" className='icono' />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${!collapsed ? 'collapsed' : ''}`}>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <Icon icon="mdi:menu" color="#fff" width="35" />
        </button>

        <nav className="sidebar-nav">
          <a href={id4}><Icon icon="material-symbols:dashboard" className='icon' /> {collapsed && 'Dashboard'}</a>
          <a href={id1}><Icon icon="mdi:shopping-outline" className='icon' /> {collapsed && 'Servicios'}</a>
          <a href={id2}><Icon icon="carbon:document" className='icon' /> {collapsed && 'Trámites'}</a>
          <a href={id3}><Icon icon="mdi:account-group" className='icon' /> {collapsed && 'Clientes'}</a>
          <a href={id5}><Icon icon="mdi:cash" className='icon' /> {collapsed && 'Pagos'}</a>
          <a href={id7}><Icon icon="mdi:calendar-month" className='icon' /> {collapsed && 'Calendario'}</a>
          <a href={id6}><Icon icon="mdi:account" className='icon' /> {collapsed && 'Mi Perfil'}</a>
          <a onClick={cerrarSesion}><Icon icon="line-md:logout" className='icon' /> {collapsed && 'Cerrar sesión'}</a>
        </nav>
      </div>
    </div>
  );
}
