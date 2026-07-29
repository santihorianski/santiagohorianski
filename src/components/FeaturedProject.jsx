import React from 'react';
import { FileText, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturedProject({ onClose }) {
  return (
    <div className="featured-project-container glass-panel">
      <div className="featured-content">
        <div className="featured-badge">PROYECTO DESTACADO</div>
        <h2 className="featured-title">Posadas Libre para Emprender</h2>
        <p className="featured-subtitle">Expediente: 936-C - 2026</p>
        
        <p className="featured-desc">
          Un régimen integral de desregulación administrativa y libertad económica. 
          Proponemos sustituir la lógica del control preventivo asfixiante por el 
          <strong> principio de Confianza en el Individuo</strong>. A través de este programa buscamos fomentar el desarrollo económico local eliminando barreras y costos innecesarios, para que abrir un negocio en Posadas deje de ser una carrera de obstáculos.
        </p>

        <ul className="featured-benefits">
          <li>
            <CheckCircle2 size={20} className="text-success" />
            <span><strong>Habilitación Inmediata:</strong> Categoría A automática mediante Declaración Jurada para comercios de bajo riesgo.</span>
          </li>
          <li>
            <CheckCircle2 size={20} className="text-success" />
            <span><strong>Gasto Público Cero:</strong> Costo $0 en todo trámite de habilitación, bajas, transferencias y renovaciones.</span>
          </li>
          <li>
            <CheckCircle2 size={20} className="text-success" />
            <span><strong>Alivio Fiscal de Lanzamiento:</strong> 12 meses de exención de tasas municipales para nuevos pequeños contribuyentes.</span>
          </li>
          <li>
            <CheckCircle2 size={20} className="text-success" />
            <span><strong>Portabilidad Técnica:</strong> Se terminan los estudios técnicos redundantes si no hay cambio de riesgo.</span>
          </li>
        </ul>

        <div className="featured-timeline">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Historial del Expediente</h3>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date">14/04/2026</div>
                <div className="timeline-text">Departamento de Mesa de Entradas y Salidas</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date">14/04/2026</div>
                <div className="timeline-text">Dirección General de Asuntos Legislativos y Comisiones</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date">16/04/2026</div>
                <div className="timeline-text">Comisión de Hacienda y Presupuesto (Sesión Ordinaria Nº 5)</div>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-dot active"></div>
              <div className="timeline-content">
                <div className="timeline-date" style={{color: 'var(--primary)', fontWeight: 'bold'}}>16/04/2026 (Actual)</div>
                <div className="timeline-text">
                  <strong>Comisión de Asuntos Sociales y Desarrollo Vecinal</strong><br/>
                  <span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>Comisión de Cabecera</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="featured-actions">
          <Link 
            to="/ver-pdf/emprender"
            className="btn btn-primary featured-btn"
          >
            <FileText size={20} /> Ver Proyecto Completo <ArrowRight size={18} />
          </Link>
          <button onClick={onClose} className="btn btn-secondary featured-btn">
            <ArrowLeft size={18} /> Cerrar destacado
          </button>
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
          max-width: 900px;
        }

        .featured-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 2.5rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .featured-benefits li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-success {
          color: #25D366;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .featured-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .featured-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
        }

        .featured-timeline {
          margin-bottom: 2.5rem;
        }
        
        .timeline-container {
          position: relative;
          padding-left: 20px;
          border-left: 2px solid var(--border-color);
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        .timeline-dot {
          position: absolute;
          left: -27px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--text-muted);
          border: 2px solid var(--bg-card);
        }
        
        .timeline-dot.active {
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }
        
        .timeline-date {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
          font-family: var(--font-mono);
        }
        
        .timeline-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        @media (max-width: 576px) {
          .featured-title { font-size: 1.8rem; }
          .featured-content { padding: 1.5rem; }
          .featured-btn { width: 100%; justify-content: center; }
          .featured-benefits { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}
