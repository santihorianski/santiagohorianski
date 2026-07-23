import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const InstagramIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color}}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsAppIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function SocialBento({ hideHeader = false }) {
  return (
    <section className="bento-section" style={{ padding: hideHeader ? '2rem 0 6rem' : '6rem 0', background: hideHeader ? 'transparent' : 'var(--bg-dark)' }}>
      <div className="container">
        {!hideHeader && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Conectemos <span className="gradient-text">directo</span>
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              La política real se hace escuchando. Seguime para ver el trabajo del día a día o escribime para tomar un café (aunque sea virtual).
            </p>
          </div>
        )}

        <div className="bento-grid">
          {/* Tarjeta Instagram (Grande) */}
          <a href="https://instagram.com/santi.horianski" className="bento-card bento-ig glass-panel" target="_blank" rel="noreferrer">
            <div className="bento-icon-wrapper ig-gradient">
              <InstagramIcon size={24} color="white" />
            </div>
            <div className="bento-content">
              <h3>Instagram</h3>
              <p>Mirá cómo digo la verdad y las cosas que muchos no se animan a decir de frente.</p>
            </div>
            <div className="bento-arrow">
              <ArrowUpRight size={20} />
            </div>
          </a>

          {/* Tarjeta WhatsApp (Horizontal) */}
          <a href="#" className="bento-card bento-wsp glass-panel" target="_blank" rel="noreferrer">
            <div className="bento-icon-wrapper wsp-gradient">
              <WhatsAppIcon size={28} color="white" />
            </div>
            <div className="bento-content">
              <h3>Línea Directa</h3>
              <p>Escribime por WhatsApp. Sin filtros ni intermediarios, como tiene que ser.</p>
            </div>
            <div className="bento-arrow">
              <ArrowUpRight size={20} />
            </div>
          </a>

          {/* Tarjeta Facebook (Pequeña) */}
          <a href="https://www.facebook.com/p/Santiago-Horianski-61575924643898/" className="bento-card bento-fb glass-panel" target="_blank" rel="noreferrer">
            <div className="bento-icon-wrapper fb-gradient">
              <FacebookIcon size={24} color="white" />
            </div>
            <div className="bento-content">
              <h4>Facebook</h4>
            </div>
          </a>

          {/* Tarjeta TikTok (Pequeña) */}
          <a href="https://www.tiktok.com/@santiagohorianski" className="bento-card bento-tiktok glass-panel" target="_blank" rel="noreferrer">
            <div className="bento-icon-wrapper tiktok-gradient">
              <TikTokIcon size={24} color="white" />
            </div>
            <div className="bento-content">
              <h4>TikTok</h4>
            </div>
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .bento-section {
          position: relative;
          overflow: hidden;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 160px);
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .bento-card {
          border-radius: 20px;
          padding: 1.5rem;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
        }

        .bento-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.05);
        }

        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .bento-card:hover::before {
          opacity: 1;
        }

        .bento-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          transition: transform 0.4s ease;
        }

        .bento-card:hover .bento-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .bento-card h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .bento-card h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .bento-card p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .bento-arrow {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          color: rgba(255,255,255,0.3);
          transition: all 0.3s ease;
        }

        .bento-card:hover .bento-arrow {
          color: white;
          transform: translate(5px, -5px);
        }

        /* Gradients */
        .ig-gradient {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        }

        .wsp-gradient {
          background: linear-gradient(135deg, #25D366, #128C7E);
        }

        .fb-gradient {
          background: linear-gradient(135deg, #1877F2, #0d5ea6);
        }

        .tiktok-gradient {
          background: linear-gradient(135deg, #00f2fe, #4facfe, #ff0844); /* Un gradiente vibrante que recuerda a TikTok */
        }

        /* Grid Placement */
        .bento-ig {
          grid-column: span 2;
          grid-row: span 2;
        }
        
        .bento-ig:hover {
          box-shadow: 0 20px 40px rgba(220, 39, 67, 0.2);
          border-color: rgba(220, 39, 67, 0.4);
        }

        .bento-wsp {
          grid-column: span 2;
          grid-row: span 1;
        }
        
        .bento-wsp:hover {
          box-shadow: 0 20px 40px rgba(37, 211, 102, 0.2);
          border-color: rgba(37, 211, 102, 0.4);
        }

        .bento-fb {
          grid-column: span 1;
          grid-row: span 1;
        }
        
        .bento-fb:hover {
          box-shadow: 0 20px 40px rgba(24, 119, 242, 0.2);
          border-color: rgba(24, 119, 242, 0.4);
        }

        .bento-tiktok {
          grid-column: span 1;
          grid-row: span 1;
        }
        
        .bento-tiktok:hover {
          box-shadow: 0 20px 40px rgba(0, 242, 254, 0.2);
          border-color: rgba(0, 242, 254, 0.4);
        }

        [data-theme='light'] .bento-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        
        [data-theme='light'] .bento-card:hover {
          background: white;
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        [data-theme='light'] .bento-arrow {
          color: rgba(0,0,0,0.2);
        }
        
        [data-theme='light'] .bento-card:hover .bento-arrow {
          color: var(--primary);
        }

        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
          }
          .bento-ig {
            grid-column: span 2;
            grid-row: span 1;
            min-height: 250px;
          }
          .bento-wsp {
            grid-column: span 2;
          }
        }

        @media (max-width: 500px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .bento-ig, .bento-wsp, .bento-fb, .bento-tiktok {
            grid-column: span 1;
            min-height: 200px;
          }
        }
      `}} />
    </section>
  );
}
