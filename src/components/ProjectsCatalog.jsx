import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Grid, List, Wrench, Laptop, CheckSquare, BarChart3, AlertCircle, FileText, Send, X, MessageSquare } from 'lucide-react';

// Catálogo completo de los proyectos del HCD Misiones (Concejo Deliberante de Posadas)
import { PROJECTS_DATA } from '../utils/projectsData';

  const getProjectType = (proj) => {
  if (!proj) return '';
  const text = (proj.title + ' ' + proj.summary).toLowerCase();
  if (text.includes('ordenanza')) return 'Ordenanza';
  if (text.includes('resolución') || text.includes('resolucion')) return 'Resolución';
  if (text.includes('comunicación') || text.includes('comunicacion')) return 'Comunicación';
  if (text.includes('pedido de informe')) return 'Pedido de Informe';
  if (text.includes('declaración') || text.includes('declaracion')) return 'Declaración';
  return 'Proyecto';
};

export default function ProjectsCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState(null);
  const [modalSent, setModalSent] = useState(false);
  const [modalForm, setModalForm] = useState({ name: '', contact: '', message: '' });

  const categories = ['Todos', 'Urbanismo', 'Modernización', 'Juventud', 'Economía'];

  // Typewriter effect para el placeholder del buscador
  const searchExamples = ["'pavimentación'", "'seguridad'", "'iluminación'", "'basura'", "'transporte'", "'habilitaciones'"];
  const [placeholderWord, setPlaceholderWord] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    let typingSpeed = isDeleting ? 40 : 100;
    
    if (!isDeleting && placeholderWord === searchExamples[exampleIndex]) {
      typingSpeed = 2000; // Pausa cuando termina de escribir
      const timeout = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && placeholderWord === '') {
      setIsDeleting(false);
      setExampleIndex((prev) => (prev + 1) % searchExamples.length);
      typingSpeed = 500; // Pausa antes de la siguiente palabra
    }

    const timeout = setTimeout(() => {
      const currentWord = searchExamples[exampleIndex];
      if (isDeleting) {
        setPlaceholderWord(currentWord.substring(0, placeholderWord.length - 1));
      } else {
        setPlaceholderWord(currentWord.substring(0, placeholderWord.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderWord, isDeleting, exampleIndex]);

  // Helper para asignar prioridad de orden
  const getProjectTypeWeight = (proj) => {
    const text = (proj.title + " " + proj.summary).toLowerCase();
    if (text.includes("ordenanza")) return 1;
    if (text.includes("resolución") || text.includes("resolucion")) return 2;
    if (text.includes("comunicación") || text.includes("comunicacion")) return 3;
    if (text.includes("interés") || text.includes("interes")) return 4;
    return 5; // Default para otros
  };

  // Filtrar los proyectos de la grilla y ordenarlos
  const filteredProjects = PROJECTS_DATA.filter((proj) => {
    const matchesCategory = selectedCategory === 'Todos' || proj.category === selectedCategory;
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const weightDiff = getProjectTypeWeight(a) - getProjectTypeWeight(b);
    if (weightDiff !== 0) return weightDiff;
    // Si son del mismo tipo, ordenarlos por ID descendente (más nuevos primero)
    return b.id - a.id;
  });

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  const getDaysInComision = (project) => {
    if (!project) return null;
    
    let cabeceraEntry = null;
    
    if (project.history && project.history.length > 0) {
      for (let i = project.history.length - 1; i >= 0; i--) {
        const entry = project.history[i].toLowerCase();
        if (entry.includes('comisión de cabecera') || entry.includes('comision de cabecera')) {
          cabeceraEntry = project.history[i];
          break;
        }
      }
    } else if (project.status) {
      const entry = project.status.toLowerCase();
      if (entry.includes('comisión de cabecera') || entry.includes('comision de cabecera')) {
        cabeceraEntry = project.status;
      }
    }
    
    if (!cabeceraEntry) return null;
    
    const match = cabeceraEntry.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    
    const [_, day, month, year] = match;
    const statusDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    
    const diffTime = Math.abs(today - statusDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays;
  };

  const handleOpenModal = (proj) => {
    setModalProject(proj);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <Helmet>
        <title>Proyectos y Ordenanzas | Santiago Horianski</title>
        <meta name="description" content="Audita y descarga los proyectos de ordenanza y pedidos de informes presentados en el Concejo Deliberante de Posadas." />
      </Helmet>
      <section className="catalog-section">
      <div className="container">
        
        {/* Hero Section */}
        <div className="section-header catalog-hero" data-aos="fade-down">
          <span className="section-pre">Concejo Deliberante de Posadas</span>
          <h2 className="section-title">
            Mis <span className="gradient-text">Proyectos en el Concejo</span>
          </h2>
          <p className="section-desc">
            Como Concejal de Posadas, mi compromiso es fiscalizar los recursos públicos y proponer soluciones reales. Aquí podés auditar y descargar los más de 100 proyectos presentados en nuestro primer año legislativo.
          </p>
        </div>



        {/* Separator / Subtitle */}
        <div className="catalog-controls-title" data-aos="fade-right">
          <h3 className="section-subtitle-small">
            <span className="bullet-glow"></span>
            Proyectos presentados en el CONCEJO DE POSADAS
          </h3>
        </div>

        {/* Filtros, Buscador y Alternador de Vistas */}
        <div className="catalog-controls glass-panel" data-aos="fade-up">
          
          {/* Fila superior: Búsqueda y Alternador de vista */}
          <div className="controls-row-top">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder={`Buscar "${placeholderWord}" entre más de 100 proyectos...`}
                className="search-input"
              />
            </div>
            
            <div className="view-toggle-buttons">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`toggle-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Vista Grilla"
                aria-label="Vista Grilla"
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`toggle-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="Vista Lista"
                aria-label="Vista Lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Fila inferior: Filtros por Ejes */}
          <div className="controls-row-bottom">
            <span className="filter-label">Ejes temáticos:</span>
            <div className="filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grilla / Lista del Catálogo */}
        <div className="catalog-results" data-aos="fade-up">
          {filteredProjects.length === 0 ? (
            <div className="empty-results card glass-panel">
              <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h4>No se encontraron proyectos</h4>
              <p>Intenta ajustar el filtro temático o escribir otra palabra en el buscador.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* VISTA GRILLA */
            <div className="projects-grid-layout">
              {visibleProjects.map((proj) => {
                const projectType = getProjectType(proj);
                return (
                <div key={proj.id} className={`project-grid-card card glass-panel ${projectType === 'Ordenanza' ? 'ordenanza-highlight' : ''}`}>
                  <div className="proj-card-header">
                    <span className="proj-id-badge">#{proj.id}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#000', fontWeight: 'bold', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>⭐ {projectType.toUpperCase()}</span>
                      <span className="badge badge-accent proj-cat-badge">{proj.category}</span>
                        
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <h4 className="proj-card-title" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }} title={proj.original_title || proj.title}>{proj.title}</h4>
                    <span onClick={(e) => { e.stopPropagation(); handleOpenModal(proj); }} style={{color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem'}}>ver más</span>
                  </div>
                  <p className="proj-card-summary">{proj.summary}</p>
                  <div className="proj-card-actions">
                    <button 
                      onClick={() => handleOpenModal(proj)}
                      className="btn btn-secondary btn-sm proj-card-cta"
                    >
                      <span>Solicitar completo</span>
                    </button>
                    <button 
                      onClick={() => handleOpenModal(proj)}
                      className="btn-link-action"
                    >
                      <span>Sumar mi idea</span>
                    </button>
                  </div>
                </div>
                )})}
            </div>
          ) : (
            /* VISTA LISTA (Modelo Híbrido tipo Dashboard) */
            <div className="projects-list-layout glass-panel">
              <div className="list-table-header">
                <span className="th-id">ID</span>
                <span className="th-title">Título del Proyecto</span>
                <span className="th-category">Eje Temático</span>
                <span className="th-actions">Acciones</span>
              </div>
              <div className="list-table-body">
                {visibleProjects.map((proj) => {
                  const projectType = getProjectType(proj);
                  return (
                  <div key={proj.id} className={`list-row ${projectType === 'Ordenanza' ? 'ordenanza-row-highlight' : ''}`}>
                    <span className="td-id">#{proj.id}</span>
                    <div className="td-title-wrapper">
                      <span className="td-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }} title={proj.original_title || proj.title}>
                        <span style={{ color: 'var(--primary)', marginRight: '0.4rem' }}>⭐</span>
                        {proj.title}
                      </span>
                      <span onClick={(e) => { e.stopPropagation(); handleOpenModal(proj); }} style={{color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginTop: '0.2rem'}}>ver más</span>
                      <span className="td-summary-inline">{proj.summary}</span>
                    </div>
                    <span className="td-category">
                      <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#000', fontWeight: 'bold', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px', marginBottom: '0.2rem', display: 'inline-block' }}>{projectType.toUpperCase()}</span>
                      <span className="badge badge-accent proj-cat-badge-small">{proj.category}</span>
                        
                    </span>
                    <div className="td-actions">
                      <button 
                        onClick={() => handleOpenModal(proj)}
                        className="btn btn-secondary btn-xs-table"
                      >
                        Solicitar
                      </button>
                      <button 
                        onClick={() => handleOpenModal(proj)}
                        className="btn-xs-link"
                      >
                        Sumar idea
                      </button>
                  </div>
                  </div>
                )})}
              </div>
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button 
                onClick={() => setVisibleCount(prev => prev + 15)} 
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}
              >
                Ver más proyectos
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal Glassmorphism de Solicitud */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '5px', zIndex: 10 }}>
              <X size={20} color="#fff" />
            </button>
            <div className="modal-form" style={{ padding: '1rem 0', width: '100%' }}>
              <h3 style={{ paddingRight: '2rem' }}>{modalProject?.title}</h3>
              <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--overlay-light)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Categoría:</strong> {modalProject?.category}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Tipo:</strong> {modalProject ? getProjectType(modalProject) : ''}</p>
                
                {/* Render Expediente if it exists, otherwise just show summary */}
                {modalProject?.summary && modalProject.summary.toLowerCase().includes('expediente') ? (
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}><strong>Nº de {modalProject.summary.replace(/Expediente:\s*/i, 'Expediente: ')}</strong></p>
                ) : (
                  modalProject?.summary && <p style={{ margin: '0 0 0.5rem 0' }}><strong>Resumen:</strong> {modalProject.summary}</p>
                )}
                
                {modalProject?.history && modalProject.history.length > 0 ? (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '1rem', color: 'var(--primary)' }}>Historial del Expediente:</strong>
                    <div className="history-timeline">
                      {modalProject.history.map((h, i) => {
                        const match = h.match(/^(\d{2}\/\d{2}\/\d{4}):?\s*(.*)$/);
                        const date = match ? match[1] : '';
                        const desc = match ? match[2] : h;
                        return (
                          <div key={i} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              {date && <span className="timeline-date">{date}</span>}
                              <span className="timeline-desc">{desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Estado actual:</strong> 
                    <span className="badge" style={{ backgroundColor: 'var(--success)', color: '#000', fontWeight: 'bold', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      {modalProject?.status?.toUpperCase()}
                    </span>
                  </p>
                )}
                
                {(() => {
                  const days = getDaysInComision(modalProject);
                  if (days !== null) {
                    return (
                      <div style={{ marginTop: '1.5rem', color: '#ff4d4d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 77, 77, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ff4d4d' }}>
                        <AlertCircle size={20} />
                        Lleva {days} días en comisión de cabecera
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Si querés acceder al texto completo del expediente o sumar tu idea sobre este proyecto, contactate por WhatsApp de manera directa.
              </p>
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25D366', boxShadow: '0 0 15px rgba(37, 211, 102, 0.4)' }}
                onClick={() => {
                  window.open(`https://wa.me/5493764515738?text=Hola Santiago, quisiera pedirte más información o aportar sobre el proyecto: ${modalProject?.title}`, '_blank');
                }}
              >
                <MessageSquare size={18} /> Solicitar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos locales para el Catálogo Legislativo */}
      <style dangerouslySetInnerHTML={{__html: `
        .catalog-section {
          padding: 3.5rem 0;
        }

        .catalog-hero {
          margin-bottom: 3rem;
        }

        .bullet-glow {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: var(--glow-primary);
          margin-right: 0.5rem;
        }

        .section-subtitle-small {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Proyectos Bandera Grid */
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
          margin-bottom: 4rem;
        }

        .featured-card {
          border-radius: 20px;
          padding: 1.75rem;
          background: var(--glass-bg) !important;
          border: 1px solid var(--overlay-light) !important;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .featured-card:hover {
          border-color: var(--feat-color) !important;
          transform: translateY(-4px);
          box-shadow: 0 15px 35px var(--overlay-inverted), 0 0 20px rgba(217, 160, 36, 0.1);
        }

        .feat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 1.25rem;
        }

        .feat-highlight-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .feat-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .feat-summary {
          font-size: 0.88rem;
          color: var(--secondary);
          font-weight: 600;
          margin-bottom: 0.8rem;
          line-height: 1.3;
        }

        .feat-details {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.75rem;
        }

        .feat-cta {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.65rem;
          border-radius: 8px;
        }

        /* Controls Panel */
        .catalog-controls {
          padding: 1.5rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid var(--overlay-medium);
        }

        .controls-row-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .controls-row-top .search-box {
          flex-grow: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--overlay-medium);
          border: 1px solid var(--border-color);
          padding: 0.8rem 1rem;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .controls-row-top .search-box:focus-within {
          border-color: var(--primary);
          background: var(--overlay-heavy);
          box-shadow: 0 0 12px rgba(217, 160, 36, 0.25);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          outline: none;
          width: 100%;
        }
        
        .search-input::placeholder {
          color: var(--text-muted);
        }

        .view-toggle-buttons {
          display: flex;
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 2px;
        }

        .toggle-view-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-view-btn:hover {
          color: var(--text-primary);
        }

        .toggle-view-btn.active {
          background: #743bbc;
          color: #ffffff;
        }

        .controls-row-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          border-top: 1px solid var(--overlay-light);
          padding-top: 1rem;
        }

        .filter-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .filter-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.6rem;
          width: 100%;
        }

        .filter-pills::-webkit-scrollbar {
          display: none;
        }

        .pill-btn {
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .pill-btn:hover {
          color: var(--text-primary);
          border-color: var(--overlay-heavy);
        }

        .pill-btn.active {
          background: rgba(217, 160, 36, 0.12);
          border-color: var(--primary);
          color: var(--primary);
          font-weight: 600;
        }

        /* Grid Layout Results */
        .projects-grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .project-grid-card {
          border-radius: 16px;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--overlay-light);
          display: flex;
          flex-direction: column;
          min-height: 180px;
        }

        .ordenanza-highlight {
          border: 1px solid var(--primary);
          box-shadow: 0 4px 12px rgba(217, 160, 36, 0.15);
        }

        .ordenanza-row-highlight {
          background-color: rgba(217, 160, 36, 0.05) !important;
          border-left: 3px solid var(--primary) !important;
        }

        .proj-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .proj-id-badge {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--secondary);
        }

        .proj-cat-badge {
          font-size: 0.68rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .proj-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          line-height: 1.35;
          color: var(--text-primary);
        }

        .proj-card-summary {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .proj-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--overlay-light);
          padding-top: 0.8rem;
          margin-top: auto;
        }

        .proj-card-cta {
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        .btn-link-action {
          background: transparent;
          border: none;
          color: var(--secondary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .btn-link-action:hover {
          color: var(--primary);
          text-decoration: underline;
        }

        /* List Layout Table Style */
        .projects-list-layout {
          border-radius: 16px;
          border: 1px solid var(--overlay-medium);
          overflow: hidden;
        }

        .list-table-header {
          display: grid;
          grid-template-columns: 80px 1fr 180px 220px;
          padding: 1rem 1.5rem;
          background: var(--overlay-light);
          border-bottom: 1px solid var(--overlay-medium);
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .list-table-body {
          display: flex;
          flex-direction: column;
        }

        .list-row {
          display: grid;
          grid-template-columns: 80px 1fr 180px 220px;
          padding: 1.1rem 1.5rem;
          align-items: center;
          border-bottom: 1px solid var(--overlay-light);
          transition: background 0.2s ease;
        }

        .list-row:last-child {
          border-bottom: none;
        }

        .list-row:hover {
          background: var(--overlay-light);
        }

        .td-id {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--secondary);
        }

        .td-title-wrapper {
          display: flex;
          flex-direction: column;
          padding-right: 2rem;
        }

        .td-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .td-summary-inline {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: 0.2rem;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .proj-cat-badge {
          background: rgba(116, 59, 188, 0.15) !important;
          color: #c4a7e7 !important;
          border: 1px solid rgba(116, 59, 188, 0.3) !important;
          box-shadow: none !important;
        }

        .proj-cat-badge-small {
          font-size: 0.65rem;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          background: rgba(116, 59, 188, 0.15) !important;
          color: #c4a7e7 !important;
          border: 1px solid rgba(116, 59, 188, 0.3) !important;
        }

        .td-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-xs-table {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          border-radius: 6px;
          background: var(--overlay-light);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-xs-table:hover {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.05);
        }

        .btn-xs-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .btn-xs-link:hover {
          color: var(--secondary);
          text-decoration: underline;
        }

        /* Modal Overlay & Card */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-inverted);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--bg-card) !important;
          border: 1.5px solid #743bbc !important;
          box-shadow: 0 20px 50px var(--overlay-inverted), 0 0 30px rgba(116, 59, 188, 0.3);
          border-radius: 24px;
          padding: 2.25rem;
          position: relative;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--primary);
        }

        .modal-form h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .history-timeline {
          margin-left: 0.5rem;
          padding-left: 0.5rem;
        }
        
        .timeline-item {
          display: flex;
          position: relative;
          padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-dot {
          position: absolute;
          left: -4px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary);
          z-index: 2;
          box-shadow: 0 0 8px var(--primary);
        }

        .timeline-content {
          padding-left: 1.5rem;
          border-left: 2px solid rgba(255, 255, 255, 0.1);
          margin-left: 0;
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
          width: 100%;
        }

        .timeline-date {
          font-weight: bold;
          color: var(--primary);
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
        }
        
        .timeline-desc {
          color: var(--text-color);
          line-height: 1.4;
        }

        .timeline-item:last-child .timeline-content {
          border-left-color: transparent;
        }

        @media (max-width: 992px) {
          .featured-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .projects-grid-layout {
            grid-template-columns: 1fr;
          }
          .list-table-header {
            display: none;
          }
          .list-row {
            grid-template-columns: 60px 1fr;
            row-gap: 0.8rem;
            padding: 1.25rem 1rem;
          }
          .td-title-wrapper {
            padding-right: 0;
          }
          .td-category {
            grid-column: 2;
          }
          .td-actions {
            grid-column: 2;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .controls-row-top {
            flex-direction: column;
            gap: 1rem;
          }
          .controls-row-top .search-box {
            width: 100%;
          }
          .view-toggle-buttons {
            align-self: flex-end;
          }
          .controls-row-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .modal-overlay {
            padding: 0.75rem;
          }
          .modal-content {
            padding: 1.5rem 1rem;
            border-radius: 16px;
          }
          .modal-form h3 {
            font-size: 1.25rem;
          }
          .catalog-controls {
            padding: 1rem;
          }
          .featured-card {
            padding: 1.25rem 1rem;
          }
          .feat-title {
            font-size: 1.15rem;
          }
        }
      `}} />
      </section>
    </>
  );
}
