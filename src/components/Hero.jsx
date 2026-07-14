import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ShieldCheck, Heart, Sparkles, ArrowRight, MessageSquare, Instagram, Edit3, CheckCircle } from 'lucide-react';
import santiagoImg from '../assets/santiago.jpg';

const TypewriterText = ({ text, delay = 60 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  const isWriting = currentIndex < text.length;

  return (
    <span>
      {currentText}
      <span className={`typewriter-cursor ${isWriting ? 'writing' : 'done'}`}>
        <Edit3 size={14} style={{ display: 'inline', verticalAlign: 'baseline', marginBottom: '-2px' }} />
      </span>
    </span>
  );
};

const CountUp = ({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(easeProgress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  const displayCount = decimals > 0 
    ? count.toFixed(decimals).replace('.', ',') 
    : Math.floor(count);

  return <span>{prefix}{displayCount}{suffix}</span>;
};

export default function Hero({ reportsCount }) {
  return (
    <>
      <Helmet>
        <title>Inicio | Santiago Horianski</title>
        <meta name="description" content="Concejal de Posadas. Tu voz construye el municipio que mereces. Portal interactivo de proyectos y reclamos vecinales." />
      </Helmet>
      <section className="hero-section">
      <div className="container hero-container-grid">
        {/* Left: Branding & Message */}
        <div className="hero-content" data-aos="fade-right">
          <h1 className="hero-title">
            Tu voz <span className="gradient-text">construye</span> el municipio que mereces.
          </h1>
          <p className="hero-subtitle">
            Hola, soy <strong>Santiago Javier Horianski</strong>. Nací y crecí recorriendo estas mismas calles, y por eso sé lo frustrante que es cuando los problemas del barrio quedan cajoneados. Estoy convencido de que la política tiene que <span className="highlight-marker" style={{ '--delay': '0.8s' }}>salir de las oficinas</span> y estar al servicio de los vecinos. Pensando en eso, diseñé este portal. Quiero que tengas un canal rápido, simple y directo para reclamar por baches, luminarias rotas o cualquier inconveniente que afecte tu día a día. Llegó el momento de dejar de lado la vieja política de escritorio. Escribime, <span className="highlight-marker" style={{ '--delay': '1.8s' }}>hagamos que tu voz cuente</span>.
          </p>
          
          <div className="hero-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/gestion" 
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <span>Hacer un Reclamo</span>
              <MessageSquare size={18} />
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="hero-stats">
            <div className="stat-card glass-panel">
              <span className="stat-num gradient-text">
                <CountUp end={reportsCount + 82} />
              </span>
              <span className="stat-label">Reportes Recibidos</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-num gradient-text-accent">
                <CountUp end={85} suffix="%" />
              </span>
              <span className="stat-label">Casos Resueltos</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-num" style={{ color: 'var(--secondary)' }}>
                <CountUp end={3.4} decimals={1} prefix="+" suffix="k" />
              </span>
              <span className="stat-label">Votos de Apoyo</span>
            </div>
          </div>
        </div>

        {/* Right: Premium Candidate Profile Card */}
        <div className="hero-profile-container" data-aos="fade-left" data-aos-delay="200">
          <div className="profile-wrapper">
            <div className="glow-effect"></div>
            <div className="profile-card glass-panel">
              <img 
                src={santiagoImg} 
                alt="Santiago Javier Horianski" 
                className="profile-image" 
                fetchPriority="high"
                loading="eager"
              />
              <div className="profile-info">
                <h3>Santiago Javier Horianski</h3>
                <p className="profile-role">Concejal de Posadas</p>
                <div className="profile-badges">
                  <span className="profile-tag">Transparencia Total</span>
                  <span className="profile-tag">Reglas Claras</span>
                  <span className="profile-tag">Basta de CURROS</span>
                  <span className="profile-tag">Basta de Privilegios</span>
                </div>
                <div className="quote-box">
                  <p>
                    <TypewriterText text="“Con el voto que me confiaste, hoy me planto acá para ser la voz de todos los que están hartos pero no se animan a decirlo. Ya estamos dando pelea por el municipio que exigimos, pero esto recién empieza: no nos podemos relajar. Tenemos que seguir metiendo presión para que, en las próximas elecciones, vayamos a patear el tablero y logremos de una vez por todas los cambios que este Concejo necesita”" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Marquee - Prueba Social */}
      <div className="marquee-wrapper">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-item"><CheckCircle size={16} /> Luminaria reparada en Villa Urquiza</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Bache tapado en Av. San Martín</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Proyecto de Seguridad aprobado</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Microbasural eliminado en Itaembé Miní</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Garita de colectivo instalada en Ruta 12</span>
            <span className="marquee-dot">•</span>
          </div>
          <div className="marquee-content" aria-hidden="true">
            <span className="marquee-item"><CheckCircle size={16} /> Luminaria reparada en Villa Urquiza</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Bache tapado en Av. San Martín</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Proyecto de Seguridad aprobado</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Microbasural eliminado en Itaembé Miní</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><CheckCircle size={16} /> Garita de colectivo instalada en Ruta 12</span>
            <span className="marquee-dot">•</span>
          </div>
        </div>
      </div>

      {/* Hero-specific styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hero-section {
          padding: 6rem 0 6rem 0;
          position: relative;
          overflow: hidden;
        }

        .hero-container-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-pretitle {
          display: inline-block;
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 800;
          color: var(--bg-dark);
          background: var(--gradient-primary);
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1.5rem;
          box-shadow: 0 5px 20px rgba(217, 160, 36, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 2.2rem;
          max-width: 600px;
          line-height: 1.6;
        }

        .highlight-marker {
          position: relative;
          display: inline;
          z-index: 1;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .highlight-marker::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: -2px;
          right: -2px;
          height: 35%;
          background-color: var(--primary);
          opacity: 0.25;
          z-index: -1;
          border-radius: 4px;
          transform: scaleX(0);
          transform-origin: left;
          animation: highlight-draw 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: var(--delay, 0s);
        }

        @keyframes highlight-draw {
          to {
            transform: scaleX(1);
          }
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 3.5rem;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .hero-actions .btn-primary {
          animation: pulse-glow 2.5s infinite;
          transition: all 0.3s ease;
        }

        .hero-actions .btn-primary:hover {
          animation: none;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 30px rgba(116, 59, 188, 0.5);
        }

        .hero-actions .btn-primary svg {
          transition: transform 0.3s ease;
        }

        .hero-actions .btn-primary:hover svg {
          transform: translateX(4px) scale(1.1);
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(116, 59, 188, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(116, 59, 188, 0); }
          100% { box-shadow: 0 0 0 0 rgba(116, 59, 188, 0); }
        }
        
        .social-btn {
          padding: 0.65rem !important;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          background: var(--primary);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(116, 59, 188, 0.3);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-card {
          padding: 1.25rem 1rem;
          text-align: center;
          border-radius: 12px;
        }

        .stat-num {
          display: block;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Profile Card Styling */
        .hero-profile-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          perspective: 1000px; /* Habilita el efecto 3D */
        }

        .profile-wrapper {
          position: relative;
          width: 100%;
          max-width: 380px;
        }

        .glow-effect {
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          background: radial-gradient(circle, rgba(116, 59, 188, 0.45) 0%, rgba(217, 160, 36, 0.1) 50%, transparent 70%);
          filter: blur(30px);
          z-index: 0;
          border-radius: 40px;
        }

        .profile-card {
          position: relative;
          z-index: 1;
          padding: 1.25rem;
          border-radius: 24px;
          background: var(--glass-bg) !important;
          border: 1.5px solid #743bbc !important;
          box-shadow: 0 10px 30px rgba(116, 59, 188, 0.25) !important;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.5s ease;
          transform-style: preserve-3d;
        }

        .profile-card:hover {
          transform: translateY(-10px) scale(1.02) rotateX(4deg) rotateY(-4deg);
          box-shadow: 0 25px 50px rgba(116, 59, 188, 0.4) !important;
        }

        .profile-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 18px;
          margin-bottom: 1.25rem;
          box-shadow: var(--shadow-lg);
          border: var(--glass-border);
        }

        .profile-info {
          text-align: center;
        }

        .profile-info h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
          color: var(--text-primary);
        }

        .profile-role {
          display: inline-block;
          font-size: 0.9rem;
          color: var(--bg-dark);
          background: var(--gradient-primary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.85rem;
          padding: 0.35rem 1rem;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(217, 160, 36, 0.4);
        }

        .profile-badges {
          display: flex;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .profile-tag {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: var(--overlay-light);
          color: var(--text-secondary);
          border-radius: 6px;
          font-weight: 500;
        }

        .quote-box {
          border-top: var(--glass-border);
          padding-top: 0.8rem;
        }

        .quote-box p {
          font-size: 0.85rem;
          font-style: italic;
          color: var(--text-muted);
          min-height: 120px; /* Previene saltos mientras escribe */
        }
        
        .typewriter-cursor {
          display: inline-block;
          color: var(--primary);
          margin-left: 4px;
        }
        
        .typewriter-cursor.writing {
          animation: scribble 0.15s infinite alternate ease-in-out;
        }

        .typewriter-cursor.done {
          animation: blink 0.8s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes scribble {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-2px) rotate(15deg); }
        }

        .marquee-wrapper {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.4);
          border-top: 1px solid var(--overlay-light);
          padding: 0.75rem 0;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .marquee-container {
          display: flex;
          width: max-content;
        }

        .marquee-content {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: space-around;
          animation: marquee 20s linear infinite;
        }

        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          padding: 0 1.5rem;
          white-space: nowrap;
        }

        .marquee-dot {
          color: rgba(116, 59, 188, 0.4);
          font-size: 0.75rem;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        @media (max-width: 992px) {
          .hero-container-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .hero-content {
            text-align: center;
          }
          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-stats {
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 768px) {
          .marquee-content {
            animation-duration: 35s;
          }
          .marquee-item {
            font-size: 0.75rem;
            padding: 0 1rem;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          .hero-stats .stat-card:last-child {
            grid-column: span 2;
          }
          .stat-card {
            padding: 1rem 0.5rem;
          }
          .stat-num {
            font-size: 1.25rem;
          }
          .stat-label {
            font-size: 0.75rem;
            letter-spacing: 0.01em;
          }
          .hero-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          .hero-actions .btn {
            width: 100%;
          }
        }
      `}} />
    </section>
    </>
  );
}
