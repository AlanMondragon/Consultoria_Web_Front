import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar modales de Bootstrap de manera más robusta
 * Soluciona problemas comunes como:
 * - Backdrop que no desaparece
 * - Body con scroll bloqueado
 * - Z-index conflicts
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  // Limpiar cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (isOpen) {
        cleanupModal();
      }
    };
  }, []);

  // Limpiar cuando el modal se cierre
  useEffect(() => {
    if (!isOpen) {
      cleanupModal();
    }
  }, [isOpen]);

  const cleanupModal = () => {
    // Remover clase modal-open del body
    document.body.classList.remove('modal-open');
    
    // Remover cualquier backdrop residual
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Delay para permitir que la animación termine
    setTimeout(cleanupModal, 150);
  };

  // Función para cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return {
    isOpen,
    openModal,
    closeModal,
    setIsOpen: closeModal // Para compatibilidad con onHide de Bootstrap
  };
};

export default useModal;
