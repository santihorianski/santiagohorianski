import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeaturedProject() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    '/proyectos/emprender/1.jpeg',
    '/proyectos/emprender/2.jpeg',
    '/proyectos/emprender/3.jpeg'
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="featured-project-container glass-panel">
      <div className="featured-project-grid">
        <div className="featured-content">
          <div className="featured-badge">PROYECTO DESTACADO</div>
          <h2 className="featured-title">Posadas Libre para Emprender</h2>
          <p className="featured-subtitle">Expediente: 936-C - 2026</p>
          
          <p className="featured-desc">
            Un régimen integral de desregulación administrativa y libertad económica. 
            Proponemos sustituir la lógica del control preventivo asfixiante por el 
            <strong> principio de Confianza en el Individuo</strong>.
          </p>

          <ul className="featured-benefits">
            <li>
              <CheckCircle2 size={20} className="text-success" />
              <span><strong>Habilitación Inmediata</strong> para comercios de bajo riesgo.</span>
            </li>
            <li>
              <CheckCircle2 size={20} className="text-success" />
              <span><strong>Gasto Público Cero</strong> ($0 en tasas de habilitación).</span>
            </li>
            <li>
              <CheckCircle2 size={20} className="text-success" />
              <span><strong>Alivio Fiscal de Lanzamiento</strong> (12 meses sin tasas).</span>
            </li>
            <li>
              <CheckCircle2 size={20} className="text-success" />
              <span><strong>Portabilidad Técnica</strong> para evitar dobles trámites.</span>
            </li>
          </ul>

          <a 
            href="/proyectos/emprender/SANTIAGO HORIANSKI - EMPRENDER LIBRE POSADAS (1).pdf" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary featured-btn"
          >
            <FileText size={20} /> Ver Proyecto Completo <ArrowRight size={18} />
          </a>
        </div>

        <div className="featured-carousel-wrapper">
          <div className="featured-carousel">
            <img 
              src={images[currentSlide]} 
              alt="Posadas Libre para Emprender" 
              className="featured-image" 
            />
            
            <div className="carousel-controls">
              <button onClick={prevSlide} className="carousel-btn"><ChevronLeft size={24} /></button>
              <button onClick={nextSlide} className="carousel-btn"><ChevronRight size={24} /></button>
            </div>
            
            <div className="carousel-indicators">
              {images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`carousel-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .featured-project-container {
          margin-bottom: 3rem;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(116, 59, 188, 0.3);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          position: relative;
        }
        
        .featured-project-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: var(--gradient-primary);
        }

        .featured-project-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 0;
        }

        .featured-content {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .featured-badge {
          display: inline-block;
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          align-self: flex-start;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }

        .featured-title {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .featured-subtitle {
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .featured-desc {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .featured-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 2.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .featured-benefits li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .text-success {
          color: #25D366;
          flex-shrink: 0;
        }

        .featured-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
        }

        .featured-carousel-wrapper {
          position: relative;
          background-color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .featured-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0; left: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .featured-carousel {
          width: 100%;
          padding-bottom: 100%; /* 1:1 Aspect Ratio */
          position: relative;
        }

        .carousel-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 1rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .featured-carousel-wrapper:hover .carousel-controls {
          opacity: 1;
        }

        .carousel-btn {
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: background 0.3s;
        }

        .carousel-btn:hover {
          background: var(--primary);
        }

        .carousel-indicators {
          position: absolute;
          bottom: 1.5rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dot.active {
          background: white;
          transform: scale(1.3);
        }

        @media (max-width: 992px) {
          .featured-project-grid {
            grid-template-columns: 1fr;
          }
          .featured-carousel {
            padding-bottom: 75%;
          }
          .featured-content {
            padding: 2rem;
          }
        }

        @media (max-width: 576px) {
          .featured-title { font-size: 1.8rem; }
          .featured-content { padding: 1.5rem; }
          .featured-btn { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
}
