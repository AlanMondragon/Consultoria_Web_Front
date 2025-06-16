import React, { useState, useEffect } from 'react';
import Navbar from './../NavbarAdmin.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { updateService } from './../../api/api.js';
import styles from './../../styles/ActualizarServicio.module.css';
import Swal from 'sweetalert2';

export default function ActualizarServicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;

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
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }
  }, []);

  const truncateFileName = (name) => {
    if (name && name.length > 30) {
      return name.substring(0, 30) + '...';
    }
    return name;
  };

  const [imagenNombre, setImagenNombre] = useState(service?.image || "Ningún archivo seleccionado");
  const [imagenDetalleNombre, setImagenDetalleNombre] = useState(service?.imageDetail || "Ningún archivo seleccionado");
  const [imagenPreview, setImagenPreview] = useState(service?.image || null);
  const [imagenDetallePreview, setImagenDetallePreview] = useState(service?.imageDetail || null);

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
      name: formData.get('description'),
      description: formData.get('name'),
      image: imageFile && imageFile.size > 0 ? await convertToBase64(imageFile) : service?.image,
      imageDetail: imageDetailFile && imageDetailFile.size > 0 ? await convertToBase64(imageDetailFile) : service?.imageDetail,
      simulation: formData.get('simulation') === 'on',
      cas: formData.get('cas') === 'on',
      con: formData.get('con') === 'on',
      cashAdvance: formData.get('cashAdvance'),
    };

    try {
      const response = await updateService(service.idTransact, serviceData);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'El servicio se ha actualizado exitosamente',
          text: 'Servicio actualizado con exito',
          confirmButtonText: 'Continuar',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/ServiciosAdmin");
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar el servicio',
          text: 'Hubo un problema al actualizar el servicio. Por favor, inténtelo de nuevo.',
        });
      }
    } catch (error) {
      alert('Error al actualizar el servicio');
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ marginTop: '100px' }}>
      <div className='fixed-top'>
        <Navbar title={"- Actualizar Servicios"} />
      </div>

      <div className={styles['container-registrar-tramite']}>
        <div className={styles['card-registrar-tramite']}>
          <h2>Actualizar Servicio</h2>
          <form className={styles['form-registrar-tramite']} onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor='nombre'>Nombre del Tramite</label>
              <input type='text' id='nombre' name='name' defaultValue={service?.description} required />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor='descripcion'>Descripción</label>
              <textarea id='descripcion' name='description' defaultValue={service?.name} required></textarea>
            </div>

            {/* Imagen */}
            <div className={styles['form-group']}>
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
                    setImagenNombre(service?.image || "Ningún archivo seleccionado");
                    setImagenPreview(null);
                  }
                }}
              />
              <label htmlFor='imagen' className={styles['custom-file-button']}>Seleccionar imagen</label>
              <span className={styles['file-name']}>{truncateFileName(imagenNombre)}</span>
              {imagenPreview && (
                <img src={imagenPreview} alt="Vista previa" className={styles['preview-img']} />
              )}
            </div>

            {/* Imagen Detalle */}
            <div className={styles['form-group']}>
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
                    setImagenDetalleNombre(service?.imageDetail || "Ningún archivo seleccionado");
                    setImagenDetallePreview(null);
                  }
                }}
              />
              <label htmlFor='imagenDetalle' className={styles['custom-file-button']}>Seleccionar imagen</label>
              <span className={styles['file-name']}>{truncateFileName(imagenDetalleNombre)}</span>
              {imagenDetallePreview && (
                <img src={imagenDetallePreview} alt="Vista previa detalle" className={styles['preview-img']} />
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='anticipoEfectivo'>Anticipo de Efectivo</label>
              <input type='number' id='anticipoEfectivo' name='cashAdvance' step='0.01' defaultValue={service?.cashAdvance} required />
            </div>

            {/* Switches modificados: ahora con las etiquetas arriba y switches abajo */}
            <div className={styles['form-group-switch']}>
              <label htmlFor='simulacion'>Simulación</label>
              <label className={styles['switch']}>
                <input type='checkbox' id='simulacion' name='simulation' defaultChecked={service?.simulation} />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            <div className={styles['form-group-switch']}>
              <label htmlFor='cas'>CAS</label>
              <label className={styles['switch']}>
                <input type='checkbox' id='cas' name='cas' defaultChecked={service?.cas} />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            <div className={styles['form-group-switch']}>
              <label htmlFor='con'>CON</label>
              <label className={styles['switch']}>
                <input type='checkbox' id='con' name='con' defaultChecked={service?.con} />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            <button type='submit' className={styles['button-submit-service']}>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}