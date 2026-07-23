import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Twitter, Video } from 'lucide-react';

export default function Footer() {
  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-panel glass-panel">
      <div className="container footer-container">
        
        {/* Left Column: Brand */}
        <div className="footer-brand">
          <div className="brand-logo-footer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/logo-santi.png" alt="Logo" style={{ width: '65px', height: '65px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
            <h3 style={{ margin: 0 }}>Santiago Javier Horianski</h3>
          </div>
          <p className="footer-brand-desc">
            Un espacio simple y directo para que tu voz se escuche y juntos mejoremos nuestra ciudad, sin vueltas ni burocracia.
          </p>
          <div className="social-icons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/santi.horianski" target="_blank" rel="noopener noreferrer" className="btn btn-secondary social-pill-btn" aria-label="Instagram">
              <Instagram size={18} />
              <span>@santi.horianski</span>
            </a>
            <a href="https://www.tiktok.com/@santi.horianski" target="_blank" rel="noopener noreferrer" className="btn btn-secondary social-pill-btn" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
              <span>@santi.horianski</span>
            </a>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Secciones</h4>
            <ul className="footer-ul">
              <li><Link to="/inicio" onClick={handleNavClick}>Inicio</Link></li>
              <li><Link to="/proyectos" onClick={handleNavClick}>Propuestas</Link></li>
              <li><Link to="/gestion" onClick={handleNavClick}>Gestión Territorial</Link></li>
              <li><Link to="/noticias" onClick={handleNavClick}>Prensa / Descargables</Link></li>
              <li><Link to="/privacidad" onClick={handleNavClick}>Políticas de Privacidad</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Ejes de Campaña</h4>
            <ul className="footer-ul text-muted-ul">
              <li>Transparencia Total</li>
              <li>Reglas Claras</li>
              <li>Basta de CURROS</li>
              <li>Basta de Privilegios</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <p className="footer-contact-info">
              ¿Querés sumarte a la juventud?<br />
              <a href="https://www.instagram.com/juventudmisioneslibertadavanza/?hl=en" target="_blank" rel="noopener noreferrer" className="gradient-text-accent" style={{ textDecoration: 'none' }}>@juventudmisioneslibertadavanza</a>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>© 2026 Santiago Javier Horianski. Todos los derechos reservados.</p>
          <p className="footer-tech-stamp">Desarrollado por Carlos Bolivar</p>
        </div>
      </div>

      {/* Local Styles for Footer */}
      <style dangerouslySetInnerHTML={{__html: `
        .footer-panel {
          background: var(--glass-bg) !important;
          border-left: none;
          border-right: none;
          border-bottom: none;
          border-radius: 24px 24px 0 0;
          padding: 4rem 0 0 0;
          margin-top: auto;
        }

        .footer-container {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 4rem;
          padding-bottom: 3.5rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .brand-logo-footer {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .brand-logo-footer h3 {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .logo-image-container-footer {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          background: #ffffff;
          border: 1.5px solid var(--primary);
          box-shadow: 0 0 10px rgba(116, 59, 188, 0.4);
        }

        .logo-character-footer {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .footer-brand-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .social-icons {
          display: flex;
          gap: 0.6rem;
        }

        .social-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1rem !important;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-pill-btn:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(116, 59, 188, 0.3);
        }

        /* Right grid */
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-col h4 {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .footer-ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .footer-ul button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s ease;
          padding: 0;
        }

        .footer-ul button:hover {
          color: var(--secondary);
        }

        .text-muted-ul li {
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        .footer-contact-info {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .footer-bottom {
          border-top: 1px solid var(--overlay-light);
          padding: 1.5rem 0;
          background: var(--overlay-medium);
        }

        .footer-bottom-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .footer-tech-stamp {
          font-weight: 500;
          color: var(--text-muted);
        }

        @media (max-width: 992px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
          }
        }

        @media (max-width: 576px) {
          .footer-links-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom-container {
            flex-direction: column;
            text-align: center;
          }
        }
      `}} />
    </footer>
  );
}
