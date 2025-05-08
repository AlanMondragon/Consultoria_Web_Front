import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './../../styles/RegistrarPasos.css';
import { createSteps } from '../../api/api.js';

export default function RegistrarPasos() {
  const location = useLocation();
  const idTransact = location.state?.idTransact;

  const [steps, setSteps] = useState([
    {
      name: '',
      description: '',
      stepNumber: '',
      needCalendar: false,
      id: idTransact,
    },
  ]);

  const [message, setMessage] = useState('');

  const handleStepChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        [name]: type === 'checkbox' ? checked : value,
      };
      return updatedSteps;
    });
  };

  const addStep = () => {
    setSteps((prevSteps) => [
      ...prevSteps,
      {
        name: '',
        description: '',
        stepNumber: '',
        needCalendar: false,
        id: idTransact,
      },
    ]);
  };

  const removeStep = (index) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paso?')) {
      setSteps((prevSteps) => prevSteps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createSteps(steps);
      if (!response.some((res) => res.error)) {
        setMessage('✅ Todos los pasos fueron registrados exitosamente.');
        setSteps([
          {
            name: '',
            description: '',
            stepNumber: '',
            needCalendar: false,
            id: idTransact,
          },
        ]);
      } else {
        setMessage('❌ Error al registrar algunos pasos.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error al registrar los pasos.');
    }
  };

  return (
    <div className="container-registrar-tramite">
      <div className="card-registrar-tramite">
        <h2>Registrar pasos para el trámite</h2>
        <form onSubmit={handleSubmit} className="form-registrar-tramite">
          {steps.map((step, index) => (
            <div key={index} className="step-form" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Nombre del paso</label>
                <input
                  type="text"
                  name="name"
                  value={step.name}
                  onChange={(e) => handleStepChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={step.description}
                  onChange={(e) => handleStepChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Número del paso</label>
                <input
                  type="number"
                  name="stepNumber"
                  value={step.stepNumber}
                  onChange={(e) => handleStepChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label>¿Requiere calendario?</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="needCalendar"
                    checked={step.needCalendar}
                    onChange={(e) => handleStepChange(index, e)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <button
                type="button"
                onClick={() => removeStep(index)}
                style={{
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  marginTop: '10px',
                  cursor: 'pointer',
                }}
              >
                Eliminar Paso
              </button>
            </div>
          ))}

          <button type="button" onClick={addStep} className="custom-file-button" style={{ marginTop: '10px' }}>
            ➕ Agregar Paso
          </button>

          <button type="submit" className="button-submit-service">
            Registrar Todos los Pasos
          </button>
        </form>

        {message && <p style={{ color: '#2c5282', marginTop: '16px' }}>{message}</p>}
      </div>
    </div>
  );
}