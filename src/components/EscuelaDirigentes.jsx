import React, { useEffect } from 'react';
import { GraduationCap, Briefcase, Flag, Users, MapPin, Target, Eye, Instagram, ChevronDown, Facebook, ArrowRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Helmet } from 'react-helmet-async';

export default function EscuelaDirigentes() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  const scrollToInfo = (e) => {
    e.preventDefault();
    if (window.innerWidth <= 768) {
      document.getElementById('mobile-team-img')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="escuela-page">
      <Helmet>
        <title>Escuela de Dirigentes - LLA Misiones</title>
        <meta name="description" content="Formamos dirigentes para liderar, escuchar y transformar Misiones." />
      </Helmet>

      {/* Hero Section */}
      <section className="escuela-hero has-bg-image">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-content-inner" data-aos="fade-right">
            <img 
              src="/escuela/LOGO DIRIGENTES OK JULIO 2026 LETRAS BLANCAS.png" 
              alt="Logo Escuela de Dirigentes" 
              className="hero-logo-modern"
            />
            <h1 className="hero-title-solid">
              ESCUELA DE DIRIGENTES<br />
              <span className="text-accent-gold">LA LIBERTAD AVANZA MISIONES</span>
            </h1>
            <p className="hero-subtitle-solid">
              Formamos dirigentes para liderar, escuchar y transformar Misiones.
            </p>
            <div className="hero-cta-wrap">
              <button onClick={scrollToInfo} className="btn-modern-solid">
                Súmate a la Escuela <ChevronDown size={20} className="icon-bounce" />
              </button>
            </div>
            <img src="/escuela/equipocelular.jpg" alt="Equipo Misiones" className="mobile-team-img" id="mobile-team-img" />
          </div>
        </div>
      </section>

      {/* Introducción BOLD */}
      <section id="info-section" className="escuela-intro-solid">
        <div className="container">
          <div className="text-block-bold text-center" data-aos="fade-up">
            <h2 className="display-heading">
              CONSTRUIMOS una nueva fuerza política en tiempo récord.
            </h2>
            <p className="lead-text">
              El desafío ahora es <strong>"CONSOLIDARLA"</strong> para sostener <strong>"LOS LOGROS"</strong> en el tiempo.
            </p>
          </div>

          <div className="intro-grid-modern mt-5">
            <div className="intro-card-solid" data-aos="fade-right">
              <h3>¿Qué hacemos?</h3>
              <p className="highlight-text">"Formamos a quienes van a gobernar"</p>
              <p>
                La Escuela de Dirigentes nace como un espacio de formación integral. Creemos que transformar la realidad exige preparación, conocimiento técnico, comprensión del territorio y una sólida base de principios y valores.
              </p>
            </div>
            
            <div className="intro-card-solid dark-gold" data-aos="fade-left">
              <h3>VAMOS A FORMAR:</h3>
              <ul className="modern-list">
                <li><ArrowRight size={20} className="text-accent-gold"/> Dirigentes</li>
                <li><ArrowRight size={20} className="text-accent-gold"/> Equipos Técnicos</li>
                <li><ArrowRight size={20} className="text-accent-gold"/> Referentes</li>
                <li><ArrowRight size={20} className="text-accent-gold"/> La Próxima Generación</li>
              </ul>
            </div>
          </div>
          
          <div className="batalla-cultural-banner mt-5" data-aos="zoom-in">
            <Flag size={48} strokeWidth={2.5} className="banner-icon" />
            <p>
              "Al mismo tiempo, sabemos que las transformaciones profundas también se construyen desde las ideas; 
              por eso, la batalla cultural es el pilar transversal que atraviesa cada uno de nuestros programas."
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="escuela-mv-solid bg-alt">
        <div className="container">
          <div className="mv-grid-modern">
            <div className="mv-box" data-aos="fade-up">
              <div className="mv-header">
                <Target size={36} strokeWidth={2.5} />
                <h3>Nuestra Misión</h3>
              </div>
              <p>
                Formar líderes con excelencia académica, capacidad de gestión y compromiso social, 
                brindándoles las herramientas necesarias para diseñar e implementar políticas 
                públicas efectivas basadas en las ideas de la libertad.
              </p>
            </div>

            <div className="mv-box" data-aos="fade-up" data-aos-delay="200">
              <div className="mv-header">
                <Eye size={36} strokeWidth={2.5} />
                <h3>Nuestra Visión</h3>
              </div>
              <p>
                Consolidar una comunidad de dirigentes de toda la provincia, preparados para 
                enfrentar los desafíos del siglo XXI y promover el desarrollo integral de Misiones, 
                siendo el semillero de los futuros representantes de nuestra sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="escuela-pilares-solid">
        <div className="container">
          <h2 className="section-title-modern text-center" data-aos="fade-up">Nuestros Pilares</h2>
          <div className="pilares-grid-solid">
            {[
              { icon: GraduationCap, title: "Formación Académica", desc: "Contenidos técnicos y teóricos de excelencia." },
              { icon: Briefcase, title: "Liderazgo y Gestión", desc: "Herramientas prácticas para la toma de decisiones." },
              { icon: Flag, title: "Batalla Cultural", desc: "Defensa y promoción de las ideas de la libertad." },
              { icon: Users, title: "Escuchar para Transformar", desc: "Empatía y comprensión de las necesidades reales." },
              { icon: MapPin, title: "Trabajo Territorial", desc: "Presencia activa y soluciones en cada municipio." }
            ].map((pilar, idx) => (
              <div className="pilar-card-interactive" data-aos="zoom-in" data-aos-delay={idx * 50} key={idx}>
                <div className="pilar-card-inner">
                  <div className="pilar-card-front">
                    <div className="pilar-icon-wrap"><pilar.icon size={48} strokeWidth={2.5} /></div>
                    <h4>{pilar.title}</h4>
                  </div>
                  <div className="pilar-card-back">
                    <p>{pilar.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Autoridades - Mayor impacto visual */}
      <section className="escuela-autoridades-premium bg-darker">
        <div className="container">
          <div className="section-header-accent text-center" data-aos="fade-up">
            <h2>Autoridades</h2>
            <div className="accent-line"></div>
          </div>
          
          <div className="autoridades-hero-grid">
            <div className="aut-hero-card" data-aos="fade-right">
              <span className="aut-tag">Director Ejecutivo</span>
              <h3>Adrián Núñez</h3>
              <p className="aut-subtitle">Presidente de LLA Misiones</p>
              <a href="https://www.instagram.com/adriannunezmisiones" target="_blank" rel="noopener noreferrer" className="btn-ig-solid">
                <Instagram size={20} /> @adriannunezmisiones
              </a>
            </div>
            
            <div className="aut-hero-card" data-aos="fade-left">
              <span className="aut-tag">Coordinadora General</span>
              <h3>Valeria Soczyuk</h3>
              <p className="aut-subtitle">Abogada</p>
              <a href="https://www.instagram.com/valeria_soczyuk" target="_blank" rel="noopener noreferrer" className="btn-ig-solid">
                <Instagram size={20} /> @valeria_soczyuk
              </a>
            </div>
          </div>

          <div className="section-header-accent small text-center mt-6" data-aos="fade-up">
            <h3>Dirección Académica</h3>
            <div className="accent-line small"></div>
          </div>
          
          <div className="autoridades-academica-grid">
            {[
              { cargo: "Economía", nombre: "Gerardo Alonso Schwarz", ig: "gerardoschwarz" },
              { cargo: "Educación", nombre: "Eduardo Cazenave", ig: "cazenedu" },
              { cargo: "Desregulación", nombre: "Daniel Ricardo García", ig: "danielricardogarcia" },
              { cargo: "Rol del Estado, Seg. y Legislación", nombre: "Martín Ayala", ig: "drmartinayala" }
            ].map((prof, idx) => (
              <div className="aut-regular-card" data-aos="fade-up" data-aos-delay={idx * 100} key={idx}>
                <div className="aut-cargo-line"></div>
                <span className="aut-reg-cargo">{prof.cargo}</span>
                <h4>{prof.nombre}</h4>
                <a href={`https://www.instagram.com/${prof.ig}`} target="_blank" rel="noopener noreferrer" className="aut-reg-link">
                  <Instagram size={16} /> @{prof.ig}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final y Redes */}
      <section className="escuela-cta-final">
        <div className="container text-center">
          <h2 className="cta-huge-text" data-aos="fade-up">Sé parte del cambio</h2>
          <p className="cta-subtext" data-aos="fade-up" data-aos-delay="100">
            Seguinos en nuestras redes oficiales y enterate de todas las novedades y aperturas de inscripciones.
          </p>
          
          <div className="social-cta-grid" data-aos="fade-up" data-aos-delay="200">
            <a href="https://www.instagram.com/escueladirigentesllamisiones/" target="_blank" rel="noopener noreferrer" className="social-big-btn ig">
              <Instagram size={32} />
              <div className="social-btn-content">
                <span>Seguinos en</span>
                <strong>Instagram</strong>
              </div>
            </a>
            
            <a href="https://www.facebook.com/escueladirigentesllamisiones" target="_blank" rel="noopener noreferrer" className="social-big-btn fb">
              <Facebook size={32} />
              <div className="social-btn-content">
                <span>Seguinos en</span>
                <strong>Facebook</strong>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="escuela-footer-solid">
        <div className="container text-center">
          <p className="footer-compromiso-solid">
            "La Escuela de Dirigentes es nuestro compromiso con el futuro: formar a quienes tendrán 
            la responsabilidad de escuchar a los vecinos, representar sus intereses y construir un Estado 
            eficiente que mejore su calidad de vida."
          </p>
        </div>
      </footer>
    </div>
  );
}
