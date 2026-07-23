import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, ThumbsUp, Check, MessageSquare, AlertCircle, Calendar, PlusCircle, Filter } from 'lucide-react';
import santiagoImg from '../assets/santiago.jpg';

const formatAnonymousName = (fullName) => {
  if (!fullName) return 'Vecino Anónimo';
  const nameTrimmed = fullName.trim();
  if (nameTrimmed.toLowerCase().includes('anónimo') || nameTrimmed.toLowerCase().includes('anonimo')) {
    return 'Vecino Anónimo';
  }
  const parts = nameTrimmed.split(/\s+/);
  if (parts.length === 1) {
    const name = parts[0];
    return name.length > 2 ? `${name[0]}***` : name;
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName[0]}.`;
};

// Helper para obtener detalles dinámicos del estado legislativo del Concejo
const getStatusDetails = (report) => {
  const status = report.status;
  switch (status) {
    case 'recibido':
      return {
        text: 'Recibido por secretaría del Concejo para armar el proyecto',
        badgeClass: 'badge-recibido',
        shortText: 'Recibido',
        style: { background: 'rgba(150, 150, 150, 0.12)', color: '#b0b0b0', border: '1px solid rgba(150, 150, 150, 0.25)' }
      };
    case 'presentado':
      return {
        text: 'Proyecto presentado',
        badgeClass: 'badge-secondary', // cobre
        shortText: 'Presentado'
      };
    case 'en_comision':
      const comision = report.comisionName || '[Pendiente]';
      const concejal = report.comisionConcejal || '[Pendiente]';
      return {
        text: `Proyecto en comisión de ${comision} a cargo del Concejal ${concejal}`,
        badgeClass: 'badge-warning', // ámbar
        shortText: 'En Comisión'
      };
    case 'en_votacion':
      const sesion = report.sesionNumber || '[Pendiente]';
      return {
        text: `Proyecto en votación en la sesión N° ${sesion}`,
        badgeClass: 'badge-warning', // ámbar
        shortText: 'En Votación'
      };
    case 'aprobado':
      return {
        text: 'Proyecto Aprobado - A esperar que el EJECUTIVO (La Municipalidad) lo haga',
        badgeClass: 'badge-success', // éxito verde
        shortText: 'Aprobado'
      };
    default:
      return {
        text: 'Recibido por secretaría del Concejo para armar el proyecto',
        badgeClass: 'badge-recibido',
        shortText: 'Recibido',
        style: { background: 'rgba(150, 150, 150, 0.12)', color: '#b0b0b0', border: '1px solid rgba(150, 150, 150, 0.25)' }
      };
  }
};

export default function ReportsPortal({ reports, onUpvote }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const reportsListRef = useRef(null);

  const scrollToReports = () => {
    if (reportsListRef.current) {
      const elementRect = reportsListRef.current.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      // Restar un offset mayor en móviles (130px) y computadoras (170px) para que no haga scroll de más
      const offset = window.innerWidth < 768 ? 130 : 170;
      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  // Auto-cargar código de seguimiento desde la URL (?codigo=XXXX)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('codigo');
    if (code) {
      setTrackingInput(code);
      setSearchTerm(code);
      setTimeout(() => {
        scrollToReports();
      }, 600);
    }
  }, [location.search]);
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'upvotes'

  const categories = ['Todas', 'Infraestructura', 'Seguridad', 'Basura y Medioambiente', 'Transparencia', 'Otro'];
  const statuses = ['Todos', 'recibido', 'presentado', 'en_comision', 'en_votacion', 'aprobado'];

  // Filtrar y ordenar reportes
  const filteredReports = reports
    .filter(rep => {
      const searchTermLower = searchTerm.toLowerCase().trim();
      const cleanSearch = searchTermLower.replace('#', '');
      
      const isExactTrackingSearch = cleanSearch !== '' && rep.trackingCode?.toString() === cleanSearch;
      
      // Ocultar si no está aprobado y no es una búsqueda directa por código
      if (rep.status !== 'aprobado' && !isExactTrackingSearch) {
        return false;
      }

      // Filtro por Estado (ignorar si es búsqueda directa por código de seguimiento)
      if (selectedStatus !== 'Todos' && rep.status !== selectedStatus && !isExactTrackingSearch) {
        return false;
      }
      
      // Filtro por Categoría (ignorar si es búsqueda directa por código de seguimiento)
      if (selectedCategory !== 'Todas' && rep.category !== selectedCategory && !isExactTrackingSearch) {
        return false;
      }

      const matchesSearch = rep.title.toLowerCase().includes(searchTermLower) || 
                            rep.description.toLowerCase().includes(searchTermLower) ||
                            rep.location.toLowerCase().includes(searchTermLower) ||
                            (rep.trackingCode && rep.trackingCode.toString().includes(cleanSearch) && cleanSearch !== '');
      
      const matchesCategory = selectedCategory === 'Todas' || rep.category === selectedCategory || isExactTrackingSearch;
      const matchesStatus = selectedStatus === 'Todos' || rep.status === selectedStatus || isExactTrackingSearch;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>Gestión Territorial | Santiago Horianski</title>
        <meta name="description" content="Reporta problemas barriales y realiza un seguimiento en tiempo real de las gestiones territoriales ante el municipio." />
      </Helmet>
      <section className="reports-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-pre">Gestión del Concejo</span>
            <h2 className="section-title">
              Buzón de <span className="gradient-text">Gestión Territorial</span>
            </h2>
            <p className="section-desc" style={{ marginBottom: '2rem' }}>
              Tu reclamo será auditado directamente por el equipo del Concejo del concejal Santiago Horianski.
            </p>

            <div className="portal-action-banner glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderRadius: '16px', background: 'rgba(217, 160, 36, 0.08)', border: '1px solid rgba(217, 160, 36, 0.2)', marginBottom: '3rem' }}>
              <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: '800' }}>¿Problemas en tu barrio?</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hacé tu reclamo ahora mismo de forma simple y nosotros lo gestionamos ante la municipalidad.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (trackingInput.trim()) {
                      setSearchTerm(trackingInput);
                      setTimeout(() => {
                        scrollToReports();
                      }, 100);
                    }
                  }} 
                  className="tracking-mini-form" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                >
                  <Search size={16} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }} />
                  <input 
                    type="text" 
                    placeholder="N° de seguimiento..." 
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value.replace(/#/g, ''))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '130px', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="submit"
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Rastrear
                  </button>
                </form>
                <button 
                  onClick={() => navigate('/reclamo')}
                  className="btn btn-primary" 
                  style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', boxShadow: '0 4px 15px rgba(217, 160, 36, 0.3)' }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span> Nuevo Reclamo
                </button>
              </div>
            </div>
          </div>

          {/* Live Progress Metrics Bar */}
          <div className="portal-metrics-bar glass-panel" data-aos="zoom-in">
            <div className="metric-item">
              <span className="metric-value">{reports.length + 82}</span>
              <span className="metric-title">Reclamos Recibidos</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-value" style={{ color: 'var(--warning)' }}>
                {reports.filter(r => r.status === 'en_comision' || r.status === 'en_votacion' || r.status === 'presentado').length + 12}
              </span>
              <span className="metric-title">En Trámite Legislativo</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-value" style={{ color: 'var(--success)' }}>
                {reports.filter(r => r.status === 'aprobado').length + 70}
              </span>
              <span className="metric-title">Solucionados / Respuestas</span>
            </div>
          </div>
        </div>

        <div className="portal-grid" style={{ display: 'flex', justifyContent: 'center' }}>

          {/* Feed list & Filters */}
          <div className="portal-feed-container" style={{ width: '100%', maxWidth: '1000px' }}>
            
            {/* Filter and search bar */}
            <div className="feed-controls glass-panel" data-aos="fade-up">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Buscar reportes por título, calle o descripción..." 
                  className="search-input"
                />
              </div>

              <div className="filter-group-container">
                <div className="filter-label-icon">
                  <Filter size={14} />
                  <span>Filtrar:</span>
                </div>
                <div className="filter-scrollable">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="feed-footer-controls">
                {/* Status filters removidos porque la vista pública sólo muestra reclamos aprobados */}

                <div className="sort-box">
                  <label>Ordenar:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="upvotes">Más apoyados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div ref={reportsListRef} className="reports-list">
              {filteredReports.length === 0 ? (
                <div className="empty-feed-card glass-panel">
                  <AlertCircle size={40} className="empty-icon" />
                  <h4>No se encontraron reportes</h4>
                  <p>Intenta cambiar los filtros de búsqueda o sé el primero en reportar un problema del barrio.</p>
                </div>
              ) : (
                filteredReports.map((rep) => {
                  const statusDetails = getStatusDetails(rep);
                  const isUpvoted = sessionStorage.getItem(`upvoted_${rep.id}`) === 'true';
                  const statusClass = `status-${rep.status}`;
                  
                  return (
                    <div key={rep.id} className={`report-card-item card ${statusClass}`}>
                      {/* Top Info row */}
                      <div className="report-card-top">
                        <div className="report-meta">
                          <span className="badge badge-secondary">{rep.category}</span>
                          <span 
                            className={`badge ${statusDetails.badgeClass}`}
                            style={statusDetails.style}
                          >
                            {statusDetails.shortText}
                          </span>
                        </div>
                        <div className="report-date">
                          <Calendar size={12} />
                          <span>{formatDate(rep.createdAt)}</span>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <h3 className="report-card-title">
                        {rep.status === 'aprobado' && <Check size={18} style={{ color: 'var(--success)', marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />}
                        <span style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '0.95em', fontFamily: 'var(--font-display)', fontWeight: '700' }}>#{rep.trackingCode || '----'}</span>
                        <span style={{ verticalAlign: 'middle' }}>{rep.title}</span>
                      </h3>
                      <div className="report-location">
                        <MapPin size={14} />
                        <span>{rep.location}</span>
                      </div>

                      {/* Description */}
                      <p className="report-card-desc">{rep.description}</p>

                      {/* Fotos de Evidencia (Removidas de la vista pública por pedido de privacidad) */}

                      {/* Footer Actions / Author */}
                      <div className="report-card-footer">
                        <div className="report-author">
                          <span>Publicado por: <strong>{formatAnonymousName(rep.anonymousName)}</strong></span>
                        </div>
                        
                        <button 
                          onClick={() => onUpvote(rep.id)} 
                          className={`btn-upvote ${isUpvoted ? 'voted' : ''}`}
                          disabled={isUpvoted}
                        >
                          <ThumbsUp size={16} />
                          <span>{isUpvoted ? 'Apoyado' : 'Apoyar Reclamo'} ({rep.upvotes})</span>
                        </button>
                      </div>

                      {/* Official Candidate Response */}
                      {rep.candidateResponse ? (
                        <div className={`candidate-response-box glass-panel ${rep.status === 'aprobado' ? 'resolved-box' : ''}`}>
                          {rep.status === 'aprobado' && (
                            <div className="resolved-status-tag">
                              <Check size={12} />
                              <span>Solución Aplicada</span>
                            </div>
                          )}
                          <div className="response-header">
                            <img 
                              src={santiagoImg} 
                              alt="Santiago Javier Horianski" 
                              className="response-avatar"
                            />
                            <div className="response-avatar-info">
                              <span className="response-name">Santiago Javier Horianski</span>
                              <span className="response-role-badge">Concejal Oficial ✔</span>
                            </div>
                          </div>
                          <p className="response-text">“{rep.candidateResponse}”</p>
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--overlay-medium)', fontSize: '0.82rem', color: 'var(--secondary)' }}>
                            <strong>Estado Legislativo:</strong> {statusDetails.text}
                          </div>
                        </div>
                      ) : (
                        <div className="no-response-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={14} />
                            <span>Reporte registrado. Esperando análisis técnico de Santiago.</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <strong>Estado Legislativo:</strong> {statusDetails.text}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      {/* Styles for Reports Portal */}
      <style dangerouslySetInnerHTML={{__html: `
        .reports-section {
          padding: 3.5rem 0;
        }

        /* Live Metrics Bar */
        .portal-metrics-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1.5rem 2.5rem;
          max-width: 850px;
          margin: 2rem auto 0 auto;
          background: var(--glass-bg) !important;
          border: 1px solid rgba(217, 160, 36, 0.25) !important;
          border-radius: 20px;
          box-shadow: 0 15px 35px var(--overlay-inverted), 0 0 25px rgba(217, 160, 36, 0.05);
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-value {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--primary);
          text-shadow: 0 0 10px rgba(217, 160, 36, 0.2);
        }

        .metric-title {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
        }

        .metric-divider {
          width: 1px;
          height: 35px;
          background: var(--overlay-medium);
        }

        /* Resolved feedback box styles */
        .candidate-response-box.resolved-box {
          border-color: rgba(16, 185, 129, 0.25) !important;
          background: rgba(16, 185, 129, 0.04) !important;
        }

        .resolved-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.65rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 6px;
          color: var(--success);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.75rem;
        }

        @media (max-width: 576px) {
          .portal-metrics-bar {
            flex-direction: row;
            justify-content: space-around;
            gap: 0.5rem;
            padding: 1rem 0.5rem;
            border-radius: 12px;
          }
          .metric-value {
            font-size: 1.35rem;
          }
          .metric-title {
            font-size: 0.65rem;
            text-align: center;
          }
          .metric-divider {
            width: 1px;
            height: 25px;
          }
        }

        .portal-grid {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
          width: 100%;
        }

        .portal-form-container {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
        }

        .portal-feed-container {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
        }

        .form-sticky-card {
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid rgba(217, 160, 36, 0.2) !important;
          background: var(--glass-bg) !important;
          box-shadow: 0 20px 45px var(--overlay-inverted);
        }

        .form-header {
          margin-bottom: 1.5rem;
        }

        .form-header h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }

        .form-header p {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .submit-success-card {
          text-align: center;
          padding: 2.5rem 1rem;
        }

        .success-icon-ring {
          width: 70px;
          height: 70px;
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid var(--success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        .success-icon {
          color: var(--success);
        }

        .submit-success-card h4 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .submit-success-card p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        /* Feed controls */
        .feed-controls {
          padding: 1.25rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 10px;
          color: var(--text-primary);
          outline: none;
          font-size: 0.92rem;
        }

        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(217, 160, 36, 0.25);
        }

        .filter-group-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-label-icon {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .filter-scrollable {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none; /* Hide scrollbar Firefox */
        }

        .filter-scrollable::-webkit-scrollbar {
          display: none; /* Hide scrollbar Chrome/Safari */
        }

        .filter-btn {
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .filter-btn.active {
          background: rgba(217, 160, 36, 0.12);
          border-color: var(--primary);
          color: var(--primary);
          font-weight: 600;
        }

        .feed-footer-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--overlay-light);
          padding-top: 0.8rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .status-filters {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          scrollbar-width: none;
          width: 100%;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
        }

        .status-filters::-webkit-scrollbar {
          display: none;
        }

        .status-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .status-btn:hover {
          color: var(--text-primary);
        }

        .status-btn.active {
          color: var(--primary);
          background: rgba(116, 59, 188, 0.12);
        }

        .sort-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .sort-select {
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          outline: none;
          font-weight: 500;
          cursor: pointer;
        }

        /* Reports Feed List */
        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .report-card-item {
          border: 1px solid var(--overlay-light);
          background: var(--bg-card);
        }

        .report-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .report-meta {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .report-date {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .report-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          color: var(--text-primary);
        }

        .report-location {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--secondary);
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        .report-card-desc {
          font-size: 0.94rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .report-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--overlay-light);
          padding-top: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .report-author {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .btn-upvote {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: rgba(116, 59, 188, 0.05);
          border: 1px solid rgba(116, 59, 188, 0.15);
          color: var(--text-primary);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-upvote:hover {
          background: rgba(116, 59, 188, 0.15);
          border-color: #743bbc;
          transform: translateY(-1px);
        }

        .btn-upvote.voted {
          background: #743bbc;
          color: #ffffff;
          border-color: transparent;
          cursor: default;
          box-shadow: 0 0 15px rgba(116, 59, 188, 0.4);
        }

        /* Candidate response */
        .candidate-response-box {
          background: rgba(116, 59, 188, 0.04) !important;
          border: 1px solid rgba(116, 59, 188, 0.15) !important;
          padding: 1.25rem;
          border-radius: 12px;
          margin-top: 1rem;
        }

        .response-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .response-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--primary);
        }

        .response-avatar-info {
          display: flex;
          flex-direction: column;
        }

        .response-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .response-role-badge {
          font-size: 0.68rem;
          color: var(--primary);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .response-text {
          font-size: 0.88rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .no-response-placeholder {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: var(--overlay-light);
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px dashed var(--overlay-light);
        }

        .empty-feed-card {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }

        .empty-feed-card h4 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .empty-feed-card p {
          color: var(--text-muted);
          font-size: 0.88rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .btn-icon-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 992px) {
          .portal-grid {
            gap: 2.5rem;
          }
        }

        /* Colores específicos de las publicaciones por Estado */
        .report-card-item {
          border: 1.5px solid rgba(116, 59, 188, 0.25);
          border-left: 6px solid var(--border-color);
          background: var(--bg-card);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .report-card-item.status-recibido {
          border-left-color: #969696 !important;
        }
        .report-card-item.status-recibido:hover {
          border-color: #743bbc !important;
          box-shadow: 0 10px 25px rgba(116, 59, 188, 0.15);
        }

        .report-card-item.status-presentado {
          border-left-color: #cc6614 !important;
        }
        .report-card-item.status-presentado:hover {
          border-color: #743bbc !important;
          box-shadow: 0 10px 25px rgba(116, 59, 188, 0.15);
        }

        .report-card-item.status-en_comision {
          border-left-color: var(--primary) !important;
        }
        .report-card-item.status-en_comision:hover {
          border-color: #743bbc !important;
          box-shadow: 0 10px 25px rgba(116, 59, 188, 0.15);
        }

        .report-card-item.status-en_votacion {
          border-left-color: var(--primary) !important;
        }
        .report-card-item.status-en_votacion:hover {
          border-color: #743bbc !important;
          box-shadow: 0 10px 25px rgba(116, 59, 188, 0.15);
        }

        .report-card-item.status-aprobado {
          border-left-color: var(--success) !important;
        }
        .report-card-item.status-aprobado:hover {
          border-color: #743bbc !important;
          box-shadow: 0 10px 25px rgba(116, 59, 188, 0.15);
        }

        @media (max-width: 480px) {
          .form-sticky-card {
            padding: 1.25rem 0.85rem;
          }
        }
      `}} />
      </section>
    </>
  );
}
