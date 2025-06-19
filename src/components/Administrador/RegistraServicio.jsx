import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';
import styles from './../../styles/RegistrarServicio.module.css';
import { createService } from '../../api/api';
import Swal from 'sweetalert2';

export default function RegistrarServicio() {
  const navigate = useNavigate();
  const [imagenNombre, setImagenNombre] = useState("Ningún archivo seleccionado");
  const [imagenDetalleNombre, setImagenDetalleNombre] = useState("Ningún archivo seleccionado");
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenDetallePreview, setImagenDetallePreview] = useState(null);  const [tieneOtroCosto, setTieneOtroCosto] = useState(false);
  const [tieneAnticipo, setTieneAnticipo] = useState(false);
  const [esCita, setEsCita] = useState(false);

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
  }, [navigate]);

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
    const totalPayment = parseFloat(formData.get('totalPayment'));

    const serviceData = {
      name: formData.get('name'),
      description: formData.get('description'),
      image: imageFile ? await convertToBase64(imageFile) : '',
      imageDetail: imageDetailFile ? await convertToBase64(imageDetailFile) : '',      simulation: !esCita && formData.get('simulation') === 'on',
      cas: !esCita && formData.get('cas') === 'on',
      con: !esCita && formData.get('con') === 'on',
      status: true, // Un servicio siempre se crea activo
      totalPayment: totalPayment,
      // Si no tiene anticipo, el cashAdvance es igual al totalPayment
      cashAdvance: tieneAnticipo ? parseFloat(formData.get('cashAdvance')) : totalPayment,
      cost: tieneOtroCosto ? (formData.get('cost') ? parseFloat(formData.get('cost')) : null) : totalPayment,
      nameOption: tieneOtroCosto ? formData.get('nameOption') : null,
      optionCost: tieneOtroCosto && formData.get('optionCost') ? parseFloat(formData.get('optionCost')) : null,
      isDateService: formData.get('isDateService') === 'on',
    };

    try {
      const response = await createService(serviceData);
      if (response.success) { 
        Swal.fire({
          icon: 'success',
          title: 'El servicio se ha registrado exitosamente',
          text: 'Servicio registrado con éxito',
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
              <label htmlFor='nombre'>Nombre del Trámite *</label>
              <input type='text' id='nombre' name='name' required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='descripcion'>Descripción *</label>
              <textarea id='descripcion' name='description' required></textarea>
            </div>

            {/* Imagen */}
            <div className={styles.formGroup}>
              <label htmlFor='imagen'>Imagen *</label>
              <input
                type='file'
                id='imagen'
                name='image'
                accept='image/*'
                hidden
                required
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
              <label htmlFor='imagenDetalle'>Imagen de detalles *</label>
              <input
                type='file'
                id='imagenDetalle'
                name='imageDetail'
                accept='image/*'
                hidden
                required
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
              <label htmlFor='totalPayment'>Pago Total *</label>
              <input 
                type='number' 
                id='totalPayment' 
                name='totalPayment' 
                step='0.01'
                required
                onChange={(e) => {
                  if (!tieneAnticipo) {
                    // Si no tiene anticipo, actualizar el campo de anticipo
                    const form = e.target.form;
                    form.cashAdvance.value = e.target.value;
                  }
                }}
              />
            </div>              <div className={styles.switchContainer}>
              <label htmlFor='isDateService'>¿El servicio es una cita?</label>
              <label className={styles.switch}>
                <input 
                  type='checkbox' 
                  id='isDateService' 
                  name='isDateService'
                  checked={esCita}
                  onChange={(e) => {
                    setEsCita(e.target.checked);
                    if (e.target.checked) {
                      // Si es una cita, desactivar y limpiar los otros campos
                      const form = e.target.form;
                      form.simulation.checked = false;
                      form.cas.checked = false;
                      form.con.checked = false;
                    }
                  }}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchContainer}>
              <label htmlFor='tieneAnticipo'>¿Requiere anticipo diferente?</label>
              <label className={styles.switch}>
                <input
                  type='checkbox'
                  id='tieneAnticipo'
                  checked={tieneAnticipo}
                  onChange={(e) => {
                    setTieneAnticipo(e.target.checked);
                    if (!e.target.checked) {
                      const form = e.target.form;
                      form.cashAdvance.value = form.totalPayment.value;
                    }
                  }}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {tieneAnticipo && (
              <div className={styles.formGroup}>
                <label htmlFor='anticipoEfectivo'>Anticipo de Efectivo *</label>
                <input 
                  type='number' 
                  id='anticipoEfectivo' 
                  name='cashAdvance' 
                  step='0.01'
                  required={tieneAnticipo}
                />
              </div>
            )}

            <div className={styles.switchContainer}>
              <label htmlFor='tieneOtroCosto'>¿Tiene otro costo?</label>
              <label className={styles.switch}>
                <input
                  type='checkbox'
                  id='tieneOtroCosto'
                  checked={tieneOtroCosto}
                  onChange={(e) => {
                    setTieneOtroCosto(e.target.checked);
                    if (!e.target.checked) {
                      const form = e.target.form;
                      form.nameOption.value = '';
                      form.optionCost.value = '';
                    }
                  }}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {tieneOtroCosto && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor='nameOption'>Nombre de la Opción *</label>
                  <input 
                    type='text' 
                    id='nameOption' 
                    name='nameOption' 
                    required={tieneOtroCosto}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor='optionCost'>Costo de la Opción *</label>
                  <input 
                    type='number' 
                    id='optionCost' 
                    name='optionCost' 
                    step='0.01'
                    required={tieneOtroCosto}
                  />
                </div>
              </>
            )}            {!esCita && (
              <>
                <div className={styles.switchContainer}>
                  <label htmlFor='simulacion'>Requiere simulación *</label>
                  <label className={styles.switch}>
                    <input 
                      type='checkbox' 
                      id='simulacion' 
                      name='simulation' 
                      required={!esCita}
                      disabled={esCita}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchContainer}>
                  <label htmlFor='cas'>CAS *</label>
                  <label className={styles.switch}>
                    <input 
                      type='checkbox' 
                      id='cas' 
                      name='cas' 
                      required={!esCita}
                      disabled={esCita}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchContainer}>
                  <label htmlFor='con'>CON *</label>
                  <label className={styles.switch}>
                    <input 
                      type='checkbox' 
                      id='con' 
                      name='con' 
                      required={!esCita}
                      disabled={esCita}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </>
            )}

            <p className={styles.requiredFieldsNote}>* Campos obligatorios</p>
            <button type='submit' className={styles.buttonSubmitService}>Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}