import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getStepById } from '../../../api/api';

export default function VerPasosTramite() {
  const location = useLocation();
  const { id } = location.state || {};
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (id) {
      fetchStepsById(id);
    }
  }, [id]);

  const fetchStepsById = async (stepId) => {
    try {
      const data = await getStepById(stepId);
      setSteps(data.response.StepsTransacts || []);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  return (
    <div>
      {steps.length > 0 ? (
        <div>
          <h1>Pasos del Trámite</h1>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>
                <h2>{step.name}</h2>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading steps...</p>
      )}
    </div>
  );
}
