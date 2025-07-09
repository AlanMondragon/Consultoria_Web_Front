import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from '../../styles/Landing/HeroSection.module.css';

export default function HeroSection() {
  return (
    <section id="inicio" className={styles.inicio}>
      <div className={styles.overlay}></div>

      <Container className={styles.heroContainer} fluid>
        <Row className="align-items-center w-100 justify-content-center">
          <Col xs={12} sm={11} md={10} lg={10} xl={8} className="text-white text-center">
            <div className={styles.heroContent}>
              <h1 className={styles.mainTitle}>
                CONSULTORÍA JAS
              </h1>
              <h2 className={styles.subtitle}>
                Trámites migratorios con confianza y excelencia
              </h2>
              <p className={styles.description}>
                En Consultoría JAS, somos especialistas en trámites migratorios.
                Nuestro compromiso es brindarte un servicio de calidad, transparente
                y enfocado en tus necesidades.
              </p>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureColumn}>
                  <h3 className={styles.featureTitle}>Nos distingue:</h3>
                  <ul className={styles.featureList}>
                    <li>Profesionalismo</li>
                    <li>Atención personalizada</li>
                    <li>Orientación clara</li>
                    <li>Satisfacción total del cliente</li>
                  </ul>
                </div>
                
                <div className={styles.featureColumn}>
                  <h3 className={styles.featureTitle}>Trabajamos con base en valores sólidos:</h3>
                  <div className={styles.valuesList}>
                    <div className={styles.valueItem}>
                      <span className={styles.valueIcon}>✓</span>
                      <span>Honestidad</span>
                    </div>
                    <div className={styles.valueItem}>
                      <span className={styles.valueIcon}>✓</span>
                      <span>Confianza</span>
                    </div>
                    <div className={styles.valueItem}>
                      <span className={styles.valueIcon}>👥</span>
                      <span>Trabajo en equipo</span>
                    </div>
                    <div className={styles.valueItem}>
                      <span className={styles.valueIcon}>💡</span>
                      <span>Innovación</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className={styles.ctaText}>
                Confía en nosotros para acompañarte en cada paso de tu proceso migratorio.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
