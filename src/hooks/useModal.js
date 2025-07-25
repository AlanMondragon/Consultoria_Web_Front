import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar modales de Bootstrap de manera más robusta
 * Soluciona problemas comunes como:
 * - Backdrop que no desaparece
 * - Body con scroll bloqueado  
 * - Z-index conflicts
 * - Múltiples modales abiertos simultáneamente
 */
export const useModal = (initialState = false, modalId = null) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const modalRef = useRef(modalId || `modal-${Math.random().toString(36).substr(2, 9)}`);
  const isCleaningUp = useRef(false);

  // Función para contar modales activos
  const getActiveModalsCount = () => {
    return document.querySelectorAll('.modal.show').length;
  };

  // Limpiar cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (isOpen && !isCleaningUp.current) {
        isCleaningUp.current = true;
        setTimeout(() => cleanupModal(true), 0);
      }
    };
  }, []);

  // NO limpiar automáticamente cuando el modal se cierre
  // La limpieza debe ser manual para evitar conflictos con múltiples modales

  const cleanupModal = (isUnmounting = false) => {
    if (isCleaningUp.current && !isUnmounting) return;
    
    // Solo limpiar si este es el último modal abierto o si se está desmontando
    const activeModals = getActiveModalsCount();
    
    if (activeModals <= 1 || isUnmounting) {
      // Remover clase modal-open del body solo si no hay otros modales activos
      document.body.classList.remove('modal-open');
      
      // Restaurar scroll del body
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Remover backdrops huérfanos (sin modal asociado)
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        const modals = document.querySelectorAll('.modal.show');
        
        if (backdrops.length > modals.length) {
          // Hay más backdrops que modales activos, limpiar exceso
          for (let i = modals.length; i < backdrops.length; i++) {
            backdrops[i].remove();
          }
        }
      }, 100);
    }
  };

  const openModal = () => {
    isCleaningUp.current = false;
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // NO hacer limpieza automática para evitar conflictos con múltiples modales
    // La limpieza se hace solo cuando el componente se desmonta
  };

  // Función manual para forzar limpieza (uso solo en casos específicos)
  const forceCleanup = () => {
    setTimeout(() => cleanupModal(false), 150);
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
    forceCleanup,
    modalId: modalRef.current,
    setIsOpen: closeModal // Para compatibilidad con onHide de Bootstrap
  };
};

export default useModal;
