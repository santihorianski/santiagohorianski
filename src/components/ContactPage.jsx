import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SocialBento from './SocialBento';
import { Sparkles, Megaphone } from 'lucide-react';

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>Contacto | Santiago Horianski</title>
      </Helmet>
      
      <div className="contact-page-wrapper" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated Background Elements */}
        <div className="contact-blob blob-1"></div>
        <div className="contact-blob blob-2"></div>
        
        {/* Hero Section for Contact */}
        <div className={`contact-hero-container ${mounted ? 'fade-in-up' : ''}`} style={{ textAlign: 'center', padding: '2rem 2rem 1rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '50px', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Megaphone size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Hablemos de frente</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.1 }}>
            Tus ideas <span className="gradient-text">importan.</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Elegí la plataforma que más te guste y contactame directamente. Estoy acá para escucharte y llevar los problemas de tu barrio al recinto sin filtros.
          </p>
        </div>

        {/* The Social Bento Component */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SocialBento hideHeader={true} />
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .contact-blob {
            position: absolute;
            filter: blur(100px);
            opacity: 0.4;
            z-index: 0;
            border-radius: 50%;
            animation: float-blob 10s ease-in-out infinite alternate;
          }
          
          .blob-1 {
            top: -10%;
            left: -10%;
            width: 50vw;
            height: 50vw;
            background: rgba(217, 160, 36, 0.15); /* Primary Gold */
          }
          
          .blob-2 {
            bottom: -20%;
            right: -10%;
            width: 60vw;
            height: 60vw;
            background: rgba(188, 24, 136, 0.1); /* Instagram pinkish */
            animation-delay: -5s;
          }
          
          @keyframes float-blob {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(5%, 10%) scale(1.1); }
          }
          
          .contact-hero-container {
            opacity: 0;
            transform: translateY(30px);
          }

          .fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}} />
      </div>
    </>
  );
}
