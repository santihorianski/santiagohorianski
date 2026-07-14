import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Copy, CheckCircle, FileText, Image as ImageIcon, Share2 } from 'lucide-react';
import semImage from '../assets/sem.jpg';

export default function PressKit({ newsList }) {
  const [copiedId, setCopiedId] = useState(null);

  const fallbackText = "No hay noticias recientes cargadas en este momento.";

  // Safe sort of news by date, and filter out hidden news
  // Backward compatibility: if isVisible is undefined, treat as true
  const sortedNews = [...(newsList || [])]
    .filter(n => n.isVisible !== false)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  const renderContent = (text) => {
    if (!text) return <p>{fallbackText}</p>;
    
    // Separamos por dobles saltos de línea para sacar los bloques (párrafos/listas)
    const blocks = text.split(/\n\s*\n/);
    
    return blocks.map((block, index) => {
      const trimmedBlock = block.trim();
      
      // Blockquote
      if (trimmedBlock.startsWith('> ')) {
        return <blockquote key={index} className="news-quote">{trimmedBlock.replace(/^>\s*/, '')}</blockquote>;
      }
      
      // Listas
      if (trimmedBlock.includes('\n- ') || trimmedBlock.startsWith('- ')) {
        const lines = trimmedBlock.split('\n');
        const listItems = lines.filter(l => l.trim().startsWith('- ')).map((l, i) => {
          const content = l.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <li key={i} dangerouslySetInnerHTML={{__html: content}}></li>;
        });
        
        const titleLines = lines.filter(l => !l.trim().startsWith('- '));
        const titleContent = titleLines.join(' ').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return (
          <div key={index}>
            {titleContent && <h5 dangerouslySetInnerHTML={{__html: titleContent}}></h5>}
            <ul>{listItems}</ul>
          </div>
        );
      }
      
      // Párrafos normales con bold
      const htmlContent = trimmedBlock.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={index} dangerouslySetInnerHTML={{__html: htmlContent}}></p>;
    });
  };

  const handleShare = async (news) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title || 'Noticias de Santiago Horianski',
          text: news.title ? `Gacetilla de Prensa: ${news.title}` : 'Mirá esta noticia oficial del Buzón Ciudadano',
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled share or it failed
      }
    } else {
      alert('Tu navegador o conexión actual (HTTP) no soporta la función de compartir nativa. ¡Usa el botón de copiar el texto!');
    }
  };

  const copyText = (text, id) => {
    const fallbackCopy = (textToCopy) => {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback error', err);
      }
      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopy(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    }).catch((err) => {
      fallbackCopy(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <>
      <Helmet>
        <title>Noticias y Prensa | Santiago Horianski</title>
        <meta name="description" content="Enterate de las últimas novedades, gacetillas de prensa y noticias del equipo del Concejal Santiago Horianski." />
      </Helmet>
      <section className="press-section" id="prensa">
      <div className="container">
        
        <div className="section-header" data-aos="fade-down">
          <span className="section-pre">Transparencia y Difusión</span>
          <h2 className="section-title">
            Noticias y <span className="gradient-text">Prensa</span>
          </h2>
          <p className="section-desc">
            Enterate de las últimas novedades de gestión y accedé al material oficial de campaña.
          </p>
        </div>

        <div className="press-grid">
          {sortedNews.map((news, idx) => {
            const headline = news.title || "Noticias del Concejo";
            const dateStr = news.date || new Date().toISOString();
            const formattedDate = new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
            const copyContent = `GACETILLA DE PRENSA - SANTIAGO HORIANSKI\n\n${headline}\n\n${news.content || fallbackText}`;

            return (
              <div key={news.id} className="press-card glass-panel">
                <div className="press-card-header">
                  <div className="press-card-title">
                    <FileText className="press-icon" size={24} />
                    <h3>{idx === 0 ? 'Última Gacetilla Oficial' : 'Archivo de Prensa'}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className={`btn-copy ${copiedId === news.id ? 'copied' : ''}`}
                      onClick={() => copyText(copyContent, news.id)}
                      aria-label="Copiar Gacetilla"
                    >
                      {copiedId === news.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                      <span>{copiedId === news.id ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>
                    <button 
                      className="btn-copy"
                      onClick={() => handleShare(news)}
                      aria-label="Compartir"
                      title="Compartir en redes sociales"
                    >
                      <Share2 size={18} />
                      <span className="hide-on-mobile">Compartir</span>
                    </button>
                  </div>
                </div>
                
                <div className="gacetilla-content news-article-view">
                  <div className="news-image-container">
                    {idx === 0 && <div className="news-badge">ÚLTIMA NOTICIA</div>}
                    <img src={news.image || semImage} alt="Noticia portada" className="news-image" />
                    <div className="news-image-overlay"></div>
                  </div>
                  
                  <h4 className="news-headline">{headline}</h4>
                  <p className="news-date" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: '-0.5rem', fontWeight: '500' }}>
                    Publicado el: {formattedDate}
                  </p>
                  
                  <div className="news-body">
                    {renderContent(news.content)}
                  </div>
                </div>

                {/* Descargables dentro de la tarjeta */}
                <div className="downloads-section" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--overlay-medium)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Material Descargable</h5>
                  <a href={news.image || semImage} download={`Gacetilla_${dateStr}.jpg`} className="download-btn glass-panel" style={{ width: '100%', maxWidth: '350px' }}>
                    <div className="download-icon-wrapper image-wrapper">
                      <ImageIcon size={24} />
                    </div>
                    <div className="download-text">
                      <h4>Foto Oficial</h4>
                      <span>Imagen Alta Resolución (JPG)</span>
                    </div>
                    <Download className="download-action-icon" size={20} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .press-section {
          padding: 5rem 0 8rem 0;
          position: relative;
        }

        .press-grid {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-top: 3rem;
          max-width: 850px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Press Card (Gacetilla) */
        .press-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .press-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--overlay-medium);
          padding-bottom: 1rem;
        }

        .press-card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .press-card-title h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .press-icon {
          color: var(--primary);
        }

        .btn-copy {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(217, 160, 36, 0.1);
          border: 1px solid rgba(217, 160, 36, 0.3);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-copy:hover {
          background: rgba(217, 160, 36, 0.2);
          transform: translateY(-2px);
        }

        .btn-copy.copied {
          background: rgba(37, 211, 102, 0.2);
          border-color: rgba(37, 211, 102, 0.5);
          color: #25d366;
        }

        .gacetilla-content {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--overlay-light);
          overflow-y: auto;
          max-height: 500px;
          position: relative;
        }

        .news-article-view {
          padding: 0;
        }

        .news-image-container {
          width: 100%;
          height: 340px; /* Aumentado para mejor visualización */
          position: relative;
          border-bottom: 2px solid var(--primary);
          overflow: hidden;
        }

        .news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          transition: transform 0.5s ease;
        }
        
        .press-card:hover .news-image {
          transform: scale(1.03);
        }

        .news-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background: linear-gradient(to top, var(--bg-card) 0%, transparent 100%);
          pointer-events: none;
        }

        .news-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
          animation: pulseRed 2s infinite;
        }

        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        @keyframes pulseBanner {
          0% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.6); }
          100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
        }

        .placeholder-text {
          font-size: 0.8rem;
          margin-top: 0.5rem;
          font-family: var(--font-display);
        }

        .news-headline {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          padding: 1.5rem 1.5rem 0.5rem 1.5rem;
          line-height: 1.3;
        }

        .news-body {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }

        .news-body p {
          font-size: 1.05rem;
          color: var(--text-primary);
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .news-body h5 {
          font-size: 1.15rem;
          color: var(--primary);
          margin: 1.5rem 0 1rem 0;
          font-weight: 700;
        }

        .news-body ul {
          padding-left: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .news-body li {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 0.85rem;
        }

        .news-body li strong {
          color: var(--text-primary);
        }

        .news-quote {
          border-left: 4px solid var(--primary);
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          background: var(--overlay-light);
          font-size: 1.1rem;
          font-style: italic;
          color: var(--text-primary);
          border-radius: 0 8px 8px 0;
          font-weight: 500;
          line-height: 1.6;
        }

        /* Downloads Col */
        .downloads-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .downloads-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid var(--overlay-medium);
        }

        .download-btn:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 10px 20px rgba(217, 160, 36, 0.1);
        }

        .download-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pdf-wrapper {
          background: rgba(220, 38, 38, 0.1);
          color: #ef4444;
        }

        .image-wrapper {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .download-text {
          flex-grow: 1;
        }

        .download-text h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .download-text span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .download-action-icon {
          color: var(--text-secondary);
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .download-btn:hover .download-action-icon {
          opacity: 1;
          color: var(--primary);
          transform: translateY(2px);
        }

        @media (max-width: 992px) {
          .press-grid {
            grid-template-columns: 1fr;
          }
          .gacetilla-content {
            max-height: none;
          }
        }
      `}} />
      </section>
    </>
  );
}
