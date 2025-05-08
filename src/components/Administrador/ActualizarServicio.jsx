import React, { useState, useEffect } from 'react';
import Navbar from './../NavbarAdmin.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { updateService } from './../../api/api.js';

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
      name: formData.get('name'),
      description: formData.get('description'),
      image: imageFile && imageFile.size > 0 ? await convertToBase64(imageFile) : service?.image,
      imageDetail: imageDetailFile && imageDetailFile.size > 0 ? await convertToBase64(imageDetailFile) : service?.imageDetail,
      simulation: formData.get('simulation') === 'on',
      cas: formData.get('cas') === 'on',
      con: formData.get('con') === 'on',
      cashAdvance: formData.get('cashAdvance'),
    };

    try {
      const response = await updateService(service.idTransact, serviceData);
      alert('Servicio actualizado exitosamente');
      console.log('Response:', response);
    } catch (error) {
      alert('Error al actualizar el servicio');
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <div className='fixed-top'>
        <Navbar title={"-Actualizar Servicios"} />
      </div>

      <div className='container-registrar-tramite'>
        <div className='card-registrar-tramite'>
          <h2>Actualizar Servicio</h2>
          <form className='form-registrar-tramite' onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='nombre'>Nombre del Tramite</label>
              <input type='text' id='nombre' name='name' defaultValue={service?.description} required />
            </div>
            <div className='form-group'>
              <label htmlFor='descripcion'>Descripción</label>
              <textarea id='descripcion' name='description' defaultValue={service?.name} required></textarea>
            </div>

            {/* Imagen */}
            <div className='form-group'>
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
              <label htmlFor='imagen' className='custom-file-button'>Seleccionar imagen</label>
              <span className='file-name'>{truncateFileName(imagenNombre)}</span>
              {imagenPreview && (
                <img src={imagenPreview} alt="Vista previa" className='preview-img' />
              )}
            </div>

            {/* Imagen Detalle */}
            <div className='form-group'>
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
              <label htmlFor='imagenDetalle' className='custom-file-button'>Seleccionar imagen</label>
              <span className='file-name'>{truncateFileName(imagenDetalleNombre)}</span>
              {imagenDetallePreview && (
                <img src={imagenDetallePreview} alt="Vista previa detalle" className='preview-img' />
              )}
            </div>

            <div className='form-group'>
              <label htmlFor='anticipoEfectivo'>Anticipo de Efectivo</label>
              <input type='number' id='anticipoEfectivo' name='cashAdvance' step='0.01' defaultValue={service?.cashAdvance} required />
            </div>

            <div className='form-group'>
              <label htmlFor='simulacion'>Simulación</label>
              <label className='switch'>
                <input type='checkbox' id='simulacion' name='simulation' defaultChecked={service?.simulation} />
                <span className='slider round'></span>
              </label>
            </div>

            <div className='form-group'>
              <label htmlFor='cas'>CAS</label>
              <label className='switch'>
                <input type='checkbox' id='cas' name='cas' defaultChecked={service?.cas} />
                <span className='slider round'></span>
              </label>
            </div>

            <div className='form-group'>
              <label htmlFor='con'>CON</label>
              <label className='switch'>
                <input type='checkbox' id='con' name='con' defaultChecked={service?.con} />
                <span className='slider round'></span>
              </label>
            </div>

            <button type='submit' className='button-submit-service'>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
