import React, { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    // Detectar movimiento del mouse
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    // Detectar si el mouse sale de la ventana del navegador
    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
    };

    // Agregar listeners globales
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Detección de Hover en elementos interactivos
    const handleMouseOver = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.card') || 
        target.closest('.btn') || 
        target.closest('.filter-btn') || 
        target.closest('.brand-container') || 
        target.closest('.social-icon-btn') || 
        target.closest('.poll-option-btn');

      if (isClickable) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Animación del aro seguidor (Estela)
  useEffect(() => {
    let requestRef;
    
    const updateTrail = () => {
      setTrailPosition(prev => {
        // Interpolar suavemente hacia la posición real del mouse (lag del 15%)
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16
        };
      });
      requestRef = requestAnimationFrame(updateTrail);
    };

    requestRef = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(requestRef);
  }, [position]);

  // Si no hay mouse (ej. pantallas táctiles móviles), no renderizar nada
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <div 
        className={`custom-cursor-dot ${isHovered ? 'hovered' : ''} ${isHidden ? 'hidden' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div 
        className={`custom-cursor-trail ${isHovered ? 'hovered' : ''} ${isHidden ? 'hidden' : ''}`}
        style={{ left: `${trailPosition.x}px`, top: `${trailPosition.y}px` }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        /* Ocultar el cursor por defecto en computadoras de escritorio */
        @media (pointer: fine) {
          body, html, a, button, select, input, textarea, .card, .btn {
            cursor: none !important;
          }
        }

        .custom-cursor-dot {
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease, background-color 0.2s ease;
        }

        .custom-cursor-dot.hovered {
          transform: translate(-50%, -50%) scale(0.5);
          background-color: var(--secondary);
        }

        .custom-cursor-trail {
          width: 36px;
          height: 36px;
          border: 1.5px solid var(--primary);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, width 0.2s ease, height 0.2s ease;
          background: transparent;
          box-shadow: 0 0 10px rgba(217, 160, 36, 0.1);
        }

        .custom-cursor-trail.hovered {
          width: 50px;
          height: 50px;
          border-color: var(--secondary);
          background: rgba(254, 240, 138, 0.04);
          box-shadow: 0 0 20px rgba(254, 240, 138, 0.2);
        }

        .custom-cursor-dot.hidden,
        .custom-cursor-trail.hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}} />
    </>
  );
}
