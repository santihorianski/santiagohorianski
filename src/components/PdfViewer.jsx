import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PdfViewer({ pdfUrl, title }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 9999, backgroundColor: '#000' }}>
      <div style={{ padding: '1rem', background: '#111', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #333' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => navigate('/inicio')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> Volver al menú
        </button>
        <span style={{ fontWeight: 'bold', color: '#fff' }}>{title}</span>
      </div>
      <iframe 
        src={pdfUrl} 
        width="100%" 
        height="100%" 
        style={{ border: 'none', flexGrow: 1, backgroundColor: '#fff' }} 
        title="Visualizador PDF" 
      />
    </div>
  );
}
