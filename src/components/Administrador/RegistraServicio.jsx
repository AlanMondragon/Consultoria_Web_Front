import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';
import styles from './../../styles/RegistrarServicio.module.css';
import { createService } from '../../api/api';
import Swal from 'sweetalert2';

export default function RegistrarServicio() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        navigate("/");
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }
  }, []);

  const [imagenNombre, setImagenNombre] = useState("Ningún archivo seleccionado");
  const [imagenDetalleNombre, setImagenDetalleNombre] = useState("Ningún archivo seleccionado");
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenDetallePreview, setImagenDetallePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const imageFile = formData.get('image');
    const imageDetailFile = formData.get('imageDetail');

    const serviceData = {
      name: formData.get('name'),
      description: formData.get('description'),
      image: imageFile ? await convertToBase64(imageFile) : '',
      imageDetail: imageDetailFile ? await convertToBase64(imageDetailFile) : '',
      simulation: formData.get('simulation') === 'on',
      cas: formData.get('cas') === 'on',
      con: formData.get('con') === 'on',
      cashAdvance: formData.get('cashAdvance'),
    };

    try {
      const response = await createService(serviceData);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'El servicio se ha registrado exitosamente',
          text: 'Servicio registrado con exito',
          confirmButtonText: 'Continuar',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/ServiciosAdmin");
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar el servicio',
          text: 'Hubo un problema al registrar el servicio. Por favor, inténtelo de nuevo.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar el servicio',
        text: 'Hubo un problema al registrar el servicio. Por favor, inténtelo de nuevo.',
      });
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <div className='fixed-top'>
        <Navbar title={"- Registrar Servicios"} />
      </div>

      <div className={styles.containerRegistrarTramite}>
        <div className={styles.cardRegistrarTramite}>
          <h2>Registrar Servicio</h2>
          <form className={styles.formRegistrarTramite} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor='nombre'>Nombre del Tramite</label>
              <input type='text' id='nombre' name='name' required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='descripcion'>Descripción</label>
              <textarea id='descripcion' name='description' required></textarea>
            </div>
            {/* Imagen */}
            <div className={styles.formGroup}>
              <label htmlFor='imagen'>Imagen</label>
              <input
                type='file'
                id='imagen'
                name='image'
                accept='image/*'
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImagenNombre(file.name);
                    setImagenPreview(URL.createObjectURL(file));
                  } else {
                    setImagenNombre("Ningún archivo seleccionado");
                    setImagenPreview(null);
                  }
                }}
              />
              <label htmlFor='imagen' className={styles.customFileButton}>Seleccionar imagen</label>
              <span className={styles.fileName}>{imagenNombre}</span>
              {imagenPreview && (
                <img src={imagenPreview} alt="Vista previa" className={styles.previewImg} />
              )}
            </div>

            {/* Imagen Detalle */}
            <div className={styles.formGroup}>
              <label htmlFor='imagenDetalle'>Imagen de detalles</label>
              <input
                type='file'
                id='imagenDetalle'
                name='imageDetail'
                accept='image/*'
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImagenDetalleNombre(file.name);
                    setImagenDetallePreview(URL.createObjectURL(file));
                  } else {
                    setImagenDetalleNombre("Ningún archivo seleccionado");
                    setImagenDetallePreview(null);
                  }
                }}
              />
              <label htmlFor='imagenDetalle' className={styles.customFileButton}>Seleccionar imagen</label>
              <span className={styles.fileName}>{imagenDetalleNombre}</span>
              {imagenDetallePreview && (
                <img src={imagenDetallePreview} alt="Vista previa detalle" className={styles.previewImg} />
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='anticipoEfectivo'>Anticipo de Efectivo</label>
              <input type='number' id='anticipoEfectivo' name='cashAdvance' step='0.01' required />
            </div>
            <div className={styles.switchContainer}>
              <label htmlFor='simulacion'>Requiere datos de acceso</label>
              <label className={styles.switch}>
                <input type='checkbox' id='simulacion' name='simulation' />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.switchContainer}>
              <label htmlFor='cas'>CAS</label>
              <label className={styles.switch}>
                <input type='checkbox' id='cas' name='cas' />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.switchContainer}>
              <label htmlFor='con'>CON</label>
              <label className={styles.switch}>
                <input type='checkbox' id='con' name='con' />
                <span className={styles.slider}></span>
              </label>
            </div>
            <button type='submit' className={styles.buttonSubmitService}>Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}