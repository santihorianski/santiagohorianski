import React from 'react';
import { Instagram, Video, ExternalLink } from 'lucide-react';

export default function SocialFeed() {
  const instagramUrl = "https://www.instagram.com/santi.horianski/";
  const tiktokUrl = "https://www.tiktok.com/@santiagohorianski";

  return (
    <section className="social-section" id="redes">
      <div className="container">
        
        {/* Header */}
        <div className="section-header" data-aos="fade-down">
          <span className="section-pre">Conectados 24/7</span>
          <h2 className="section-title">
            Mis Redes <span className="gradient-text">Sociales</span>
          </h2>
          <p className="section-desc">
            Seguí el día a día de la gestión, enterate de las últimas novedades y sumate a la conversación en nuestras plataformas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="social-actions" data-aos="fade-up">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn instagram-btn">
            <Instagram size={24} />
            <div className="social-btn-text">
              <span className="social-platform">Instagram</span>
              <span className="social-handle">@santi.horianski</span>
            </div>
            <ExternalLink size={18} className="external-icon" />
          </a>
          
          <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="social-btn tiktok-btn">
            <Video size={24} />
            <div className="social-btn-text">
              <span className="social-platform">TikTok</span>
              <span className="social-handle">@santiagohorianski</span>
            </div>
            <ExternalLink size={18} className="external-icon" />
          </a>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .social-section {
          padding: 5rem 0;
          position: relative;
        }

        .social-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 4rem;
          flex-wrap: wrap;
        }

        .social-btn {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 2rem;
          border-radius: 20px;
          text-decoration: none;
          min-width: 280px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background: var(--glass-bg);
          border: 1px solid var(--border-color);
          box-shadow: 0 8px 25px var(--overlay-light);
          position: relative;
          overflow: hidden;
        }

        .instagram-btn {
          border-color: rgba(220, 39, 67, 0.25);
        }
        
        .instagram-btn:hover {
          border-color: #dc2743;
          background: rgba(220, 39, 67, 0.05);
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(220, 39, 67, 0.2);
        }

        .instagram-btn svg:first-child {
          color: #dc2743;
          transition: transform 0.3s ease;
        }

        .instagram-btn:hover svg:first-child {
          transform: scale(1.1);
        }

        .tiktok-btn {
          border-color: rgba(0, 242, 254, 0.25);
        }

        .tiktok-btn:hover {
          border-color: #00f2fe;
          background: rgba(0, 242, 254, 0.05);
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(0, 242, 254, 0.2);
        }

        .tiktok-btn svg:first-child {
          color: var(--text-primary);
          filter: drop-shadow(2px 2px 0px #fe0979) drop-shadow(-2px -2px 0px #00f2fe);
          transition: transform 0.3s ease;
        }

        .tiktok-btn:hover svg:first-child {
          transform: scale(1.1);
        }

        .social-btn-text {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .social-platform {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: var(--text-muted);
        }

        .social-handle {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .external-icon {
          color: var(--text-muted);
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .social-btn:hover .external-icon {
          opacity: 1;
          transform: translateX(3px) translateY(-3px);
        }

        @media (max-width: 768px) {
          .social-btn {
            width: 100%;
          }
        }
      `}} />
    </section>
  );
}
