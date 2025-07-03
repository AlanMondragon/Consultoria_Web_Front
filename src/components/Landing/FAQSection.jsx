import React from "react";
import { HelpCircle } from "lucide-react";
import { Icon } from '@iconify/react';
import styles from '../../styles/Landing/FAQSection.module.css';

export default function FAQSection({ faqActiveIndex, handleFaqToggle }) {
  const faqData = [
    {
      question: "¿Cuánto tiempo tarda el proceso de visa?",
      answer: "El tiempo de procesamiento varía según el tipo de visa y el país de destino. Generalmente, las visas de turista pueden tardar entre 15-30 días, mientras que las visas de trabajo o estudio pueden tomar de 1-3 meses. Te mantendremos informado durante todo el proceso."
    },
    {
      question: "¿Qué documentos necesito para solicitar una visa?",
      answer: "Los documentos requeridos dependen del tipo de visa y país de destino. Generalmente incluyen: pasaporte vigente, fotografías, formularios completados, comprobantes financieros, carta de invitación (si aplica), y documentos específicos según el propósito del viaje. Te proporcionaremos una lista detallada personalizada."
    },
    {
      question: "¿Ofrecen garantía de aprobación?",
      answer: "Si bien tenemos una alta tasa de éxito, no podemos garantizar la aprobación al 100% ya que la decisión final es de las autoridades consulares. Sin embargo, nos comprometemos a preparar tu solicitud de la mejor manera posible y te acompañamos en todo el proceso."
    },
    {
      question: "¿Cuáles son sus tarifas y métodos de pago?",
      answer: "Nuestras tarifas varían según el tipo de servicio y complejidad del caso. Ofrecemos precios competitivos y transparentes. Aceptamos pagos en efectivo, transferencias bancarias y tarjetas de crédito. Solicita una cotización gratuita para conocer el costo específico de tu trámite."
    },
    {
      question: "¿Qué pasa si mi visa es rechazada?",
      answer: "En caso de rechazo, analizamos las razones y te asesoramos sobre las opciones disponibles, que pueden incluir una nueva solicitud con documentación adicional o una apelación si es posible. Nuestro equipo te apoyará para mejorar las posibilidades de éxito en futuros intentos."
    },
    {
      question: "¿Atienden casos de emergencia o urgentes?",
      answer: "Sí, ofrecemos servicios de procesamiento urgente cuando es posible. Evaluamos cada caso individualmente y te informamos sobre las opciones de servicio rápido disponibles, aunque esto puede implicar costos adicionales por los trámites expresos."
    }
  ];

  return (
    <section id="faq" className={styles.testimoniosSection}>
      <div className={styles.faqContainer}>
        <div className={styles.faqHeader}>
          <div className={styles.sectionIcon}>
            <HelpCircle size={40} color="#3B82F6" />
          </div>
          <h2 className={styles.testimoniosTitle}>Preguntas Frecuentes</h2>
          <p className={styles.testimoniosDescription}>
            Resolvemos tus dudas más comunes sobre nuestros servicios y procesos,
            para que tengas toda la información que necesitas.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div key={index} className={`${styles.faqItem} ${styles.fadeInUp}`}>
              <button
                className={`${styles.faqQuestion} ${faqActiveIndex === index ? 'active' : ''}`}
                onClick={() => handleFaqToggle(index)}
              >
                <span>{faq.question}</span>
                <Icon
                  icon="mdi:chevron-down"
                  className={`${styles.faqIcon} ${faqActiveIndex === index ? styles.active : ''}`}
                />
              </button>
              <div className={`${styles.faqAnswer} ${faqActiveIndex === index ? styles.active : ''}`}>
                <div className={styles.faqAnswerContent}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
