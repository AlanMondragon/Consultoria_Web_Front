# Landing Page Components

## Estructura

La landing page se ha refactorizado en componentes modulares para mejorar la mantenibilidad y organización del código:

### Componentes Principales

```
components/Landing/
├── index.js                  # Archivo de exportación
├── LandingPage.jsx          # Componente principal que coordina todos los demás
├── LandingNavbar.jsx        # Barra de navegación
├── HeroSection.jsx          # Sección hero/inicio
├── ServicesSection.jsx      # Sección de servicios con slider
├── AboutSection.jsx         # Sección sobre nosotros (misión, visión, valores)
├── TestimonialsSection.jsx  # Sección de testimonios con videos
├── FAQSection.jsx           # Sección de preguntas frecuentes
└── FooterSection.jsx        # Footer con contacto, redes sociales y horarios
```

### Uso

El componente principal `Page0.jsx` ahora simplemente importa y renderiza `LandingPage`:

```jsx
import React from "react";
import { LandingPage } from './Landing';

export default function Page0() {
  return <LandingPage />;
}
```

### Componentes Separados

#### 1. **LandingNavbar.jsx**
- Maneja la navegación principal
- Props: `isScrolled`, `activeSection`, `navSections`, `handleNavClick`, `showNavbar`

#### 2. **HeroSection.jsx**
- Sección de bienvenida con título y descripción
- Componente independiente sin props

#### 3. **ServicesSection.jsx**
- Slider de servicios con botones de acción
- Props: `services`, `handleOpenDetailsModal`, `handleOpenStepsModal`, `singint`

#### 4. **AboutSection.jsx**
- Misión, visión y valores de la empresa
- Componente independiente sin props

#### 5. **TestimonialsSection.jsx**
- Grid de testimonios con videos de Google Drive
- Componente independiente sin props

#### 6. **FAQSection.jsx**
- Sección de preguntas frecuentes con acordeón
- Props: `faqActiveIndex`, `handleFaqToggle`

#### 7. **FooterSection.jsx**
- Información de contacto, redes sociales, horarios y mapas
- Componente independiente sin props

### Ventajas de la Refactorización

1. **Mantenibilidad**: Cada sección está en su propio archivo
2. **Reutilización**: Los componentes pueden ser reutilizados en otras partes
3. **Claridad**: Es más fácil entender y modificar cada sección
4. **Colaboración**: Diferentes desarrolladores pueden trabajar en diferentes secciones
5. **Testing**: Cada componente puede ser probado individualmente

### Estado y Lógica

El estado principal se mantiene en `LandingPage.jsx` y se pasa a los componentes hijos según sea necesario. Esto incluye:

- Gestión de servicios (fetch de API)
- Estados de modales
- Navegación y scroll
- Estados de FAQ

### Estilos

Cada componente ahora utiliza su propio módulo CSS:
- `LandingNavbar` → `../../styles/Landing/LandingNavbar.module.css`
- `HeroSection` → `../../styles/Landing/HeroSection.module.css`
- `ServicesSection` → `../../styles/Landing/ServicesSection.module.css`
- `AboutSection` → `../../styles/Landing/AboutSection.module.css`
- `TestimonialsSection` → `../../styles/Landing/TestimonialsSection.module.css`
- `FAQSection` → `../../styles/Landing/FAQSection.module.css`
- `FooterSection` → `../../styles/Landing/FooterSection.module.css`

### Dependencias

Los componentes mantienen todas las dependencias originales:
- React Bootstrap
- Lucide React (iconos)
- React Slick (slider)
- Iconify React
- Leaflet (mapas)
