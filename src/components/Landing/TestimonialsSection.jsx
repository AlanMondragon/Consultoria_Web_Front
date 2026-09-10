import React, { useEffect, useState } from "react";
import useReveal from "../../hooks/useReveal";
import { getTestimonios } from "../../api/api.js";
import styles from '../../styles/landing/TestimonialsSection.module.css';

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconArrowLeft() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>;
}
function IconArrowRight() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>;
}

const POR_PAGINA = 8;

export default function TestimonialsSection() {
  const [headerRef, headerIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [testimonios, setTestimonios] = useState([]);
  const [zoomImg, setZoomImg] = useState(null);
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    let activo = true;
    getTestimonios()
      .then((response) => {
        if (!activo) return;
        const lista = response.success && Array.isArray(response.response?.testimonios) ? response.response.testimonios : [];
        setTestimonios(lista);
      })
      .catch((error) => {
        console.error('Error al obtener testimonios:', error);
        if (activo) setTestimonios([]);
      });
    return () => { activo = false; };
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(testimonios.length / POR_PAGINA));

  return (
    <section className={styles.testimonials} id="testimonios" style={testimonios.length === 0 ? { display: 'none' } : undefined}>
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.testimonialsHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <h2 className="jas-display jas-light">
            Mira las historias<br />de quienes ya <em>cruzaron.</em>
          </h2>
          <div className={styles.testimonialsMeta}>
            <p>
              Testimonios reales de nuestros clientes.
            </p>
            <div className={styles.testimonialsStats}>
              <div>
                <div className={styles.ts}>{testimonios.length}</div>
                <div className={styles.tl}>Testimonios</div>
              </div>
              <div>
                <div className={styles.ts}>100<em>%</em></div>
                <div className={styles.tl}>Reales · sin actores</div>
              </div>
            </div>
          </div>
        </div>

        <div ref={gridRef} className={`${styles.videoGrid} jas-reveal ${gridIn ? 'jas-in' : ''}`}>
          {testimonios.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA).map((t) => (
            <div key={t.idTestimonio} className={styles.videoCard} onClick={() => setZoomImg(t.image)}>
              <div className={styles.vtImg} style={{ backgroundImage: `url("${t.image}")` }}></div>
              <div className={styles.videoPlay}><IconPlay /></div>
              <div className={styles.vtInfo}>
                <span className={styles.vtTag}>{t.tag}</span>
              </div>
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className={styles.testNav}>
            <button
              className={styles.tnavBtn}
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              aria-label="Anteriores"
            >
              <IconArrowLeft />
            </button>
            <button
              className={styles.tnavBtn}
              onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina === totalPaginas - 1}
              aria-label="Siguientes"
            >
              <IconArrowRight />
            </button>
          </div>
        )}
      </div>

      {zoomImg && (
        <div className={styles.testimonialZoomOverlay} onClick={() => setZoomImg(null)}>
          <div className={styles.testimonialZoomHeader}>
            <span className={styles.testimonialZoomTitle}>Testimonio</span>
            <button className={styles.testimonialZoomClose} onClick={() => setZoomImg(null)}>&times;</button>
          </div>
          <img src={zoomImg} alt="Testimonio de cliente" className={styles.testimonialZoomImage} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
