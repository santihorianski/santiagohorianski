import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, MapPin, Tag, Calendar, FileText, CheckCircle2, User, Clock, Check } from 'lucide-react';

const ReportFichaPDF = React.forwardRef(({ report, getStatusDetails }, ref) => {
  if (!report) return null;

  const statusInfo = getStatusDetails ? getStatusDetails(report) : { text: report.status, shortText: report.status };
  const trackingUrl = `https://buzon-ciudadano.posadas.gov.ar/rastreo?codigo=${report.trackingCode || ''}`; // URL ficticia para el QR

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      ref={ref} 
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: '#ffffff',
        padding: '20mm',
        boxSizing: 'border-box',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#1e293b',
        position: 'relative',
        zIndex: 1,
        lineHeight: 1.5,
      }}
    >
      {/* Marca de Agua */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.03,
        zIndex: -1,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ShieldCheck size={400} color="#000000" />
      </div>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px' }}>
            <ShieldCheck size={40} color="#475569" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>BUZÓN CIUDADANO</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Honorable Concejo Deliberante</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Ciudad de Posadas, Misiones</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', textAlign: 'right' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Cód. Seguimiento</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace' }}>#{report.trackingCode || '----'}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Generado el {formatDate(new Date().toISOString())}</p>
          </div>
          <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
            <QRCodeSVG value={trackingUrl} size={70} level={"L"} />
          </div>
        </div>
      </div>

      {/* Título y Estado Principal */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 15px 0', lineHeight: 1.3 }}>
          {report.title}
        </h2>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #cbd5e1', 
          borderRadius: '8px', 
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <CheckCircle2 size={28} color="#3b82f6" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Estado de Gestión Actual</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{statusInfo.text}</p>
          </div>
        </div>
      </div>

      {/* Detalles del Reclamo en Grilla */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Calendar size={18} color="#64748b" />
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Fecha de Ingreso</span>
          </div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{formatDate(report.date)}</p>
        </div>
        
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Tag size={18} color="#64748b" />
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Categoría Temática</span>
          </div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{report.category}</p>
        </div>
        
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <MapPin size={18} color="#64748b" />
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Ubicación Declarada</span>
          </div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{report.location}</p>
          {report.coordinates && report.coordinates.lat && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
              GPS: {report.coordinates.lat}, {report.coordinates.lng}
            </p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fcfcfc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={18} color="#64748b" />
          <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Descripción del Vecino</span>
        </div>
        <p style={{ margin: 0, fontSize: '15px', color: '#334155', fontStyle: 'italic', paddingLeft: '12px', borderLeft: '3px solid #cbd5e1' }}>
          "{report.description || 'Sin descripción detallada.'}"
        </p>
      </div>

      {/* Historial de Movimientos */}
      {report.statusHistory && report.statusHistory.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
            Línea de Tiempo de Gestión
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {report.statusHistory.map((history, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: idx === report.statusHistory.length - 1 ? '#3b82f6' : '#cbd5e1' }}></div>
                  {idx !== report.statusHistory.length - 1 && <div style={{ width: '2px', height: '30px', backgroundColor: '#e2e8f0', marginTop: '4px' }}></div>}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'capitalize' }}>{history.status.replace(/_/g, ' ')}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>{formatDate(history.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de Firmas (Empujada hacia abajo) */}
      <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
        <div style={{ textAlign: 'center', width: '250px' }}>
          <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '10px' }}></div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#334155' }}>Firma de Recepción</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>Aclaración y DNI</p>
        </div>
        
        <div style={{ textAlign: 'center', width: '250px' }}>
          <div style={{ borderBottom: '1px dotted #94a3b8', height: '40px', marginBottom: '10px' }}></div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#334155' }}>Sello Institucional</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>Honorable Concejo Deliberante</p>
        </div>
      </div>
      
      {/* Pie de página con folio */}
      <div style={{ position: 'absolute', bottom: '10mm', left: '0', right: '0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '9px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Documento Generado Electrónicamente - Buzón Ciudadano Posadas - ID Interno: {report.id}
        </p>
      </div>

    </div>
  );
});

export default ReportFichaPDF;
