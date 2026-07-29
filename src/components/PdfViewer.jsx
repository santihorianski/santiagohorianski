import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PdfViewer({ pdfUrl, title, images = [] }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 9999, backgroundColor: '#f5f5f5' }}>
      <div style={{ padding: '1rem', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => navigate('/inicio')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <span style={{ fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 1rem' }}>
          {title}
        </span>
        {pdfUrl && (
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> <span className="d-none d-sm-inline">Descargar PDF</span>
          </a>
        )}
      </div>
      
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {images && images.length > 0 ? (
          images.map((imgSrc, idx) => (
            <img 
              key={idx} 
              src={imgSrc} 
              alt={`Página ${idx + 1}`} 
              style={{ maxWidth: '100%', width: '800px', height: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '4px', backgroundColor: '#fff' }} 
            />
          ))
        ) : (
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', backgroundColor: '#fff', minHeight: '800px', width: '100%', maxWidth: '1000px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            title="Visualizador PDF" 
          />
        )}
      </div>
    </div>
  );
}
