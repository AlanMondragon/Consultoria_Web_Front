/**
 * Utilidades para manejo inteligente de modales de Bootstrap
 * Ayuda a prevenir conflictos cuando hay múltiples modales abiertos
 */

export const modalUtils = {
  /**
   * Limpia modales de manera inteligente, respetando múltiples modales abiertos
   */
  smartCleanup: (delay = 150) => {
    setTimeout(() => {
      const activeModals = document.querySelectorAll('.modal.show').length;
      const backdrops = document.querySelectorAll('.modal-backdrop');
      
      // Solo limpiar si no hay modales activos
      if (activeModals === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Remover todos los backdrops si no hay modales
        backdrops.forEach(backdrop => backdrop.remove());
      } else {
        // Si hay modales activos, solo remover backdrops excesivos
        const modals = document.querySelectorAll('.modal.show');
        if (backdrops.length > modals.length) {
          for (let i = modals.length; i < backdrops.length; i++) {
            if (backdrops[i]) {
              backdrops[i].remove();
            }
          }
        }
      }
    }, delay);
  },

  /**
   * Cuenta los modales actualmente abiertos
   */
  getActiveModalsCount: () => {
    return document.querySelectorAll('.modal.show').length;
  },

  /**
   * Verifica si hay modales activos
   */
  hasActiveModals: () => {
    return document.querySelectorAll('.modal.show').length > 0;
  },

  /**
   * Fuerza la limpieza completa (usar con cuidado)
   */
  forceCleanup: () => {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
  }
};

export default modalUtils;
