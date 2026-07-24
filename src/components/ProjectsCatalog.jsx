import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Grid, List, Wrench, Laptop, CheckSquare, BarChart3, AlertCircle, FileText, Send, X } from 'lucide-react';

// Catálogo completo de los proyectos del HCD Misiones (Concejo Deliberante de Posadas)
const PROJECTS_DATA = [
  {
    id: 101,
    title: 'Normas de Transparencia y Datos Abiertos en el HCD',
    summary: 'Proyecto de Resolución para establecer normas de transparencia, publicidad, datos abiertos y control en absolutamente todos los procesos de contratación, adquisición, locación y provisión que realice el Honorable Concejo Deliberante.',
    category: 'Transparencia'
  },
  {
    id: 102,
    title: 'Programa "Posadas Libre para Emprender"',
    summary: 'Proyecto de Ordenanza para crear el programa "Posadas Libre para Emprender", facilitando y promoviendo el desarrollo de nuevos emprendimientos en la ciudad.',
    category: 'Desarrollo Económico'
  },
  {
    id: 103,
    title: 'Balance Digital de Sumas y Saldos 2025',
    summary: 'Proyecto de Resolución para requerir al DEM que remita en formato digital el Balance de Sumas y Saldos al 31/12/2025 con toda la documentación respaldatoria.',
    category: 'Economía'
  },
  {
    id: 104,
    title: 'Informe sobre Multa Infundada a Comercio Local',
    summary: 'Proyecto de Resolución pidiendo informes al DEM sobre el cobro infundado de una multa de $190.000.000 al local comercial LE UTTHE.',
    category: 'Control'
  },
  {
    id: 105,
    title: 'Rendición de Fondos en Eventos Masivos (2025-2026)',
    summary: 'Proyecto de Comunicación solicitando al DEM informe detallado sobre planificación, contratación, ejecución y rendición de fondos destinados a eventos masivos.',
    category: 'Transparencia'
  },
  {
    id: 106,
    title: 'Ejecución de Gastos de Cortesía y Homenajes 2025',
    summary: 'Proyecto de Comunicación para solicitar al DEM un informe detallado sobre la ejecución de la partida "Gastos de Cortesía y Homenajes" del ejercicio 2025.',
    category: 'Economía'
  },
  {
    id: 107,
    title: 'Prohibición de Fotomultas Automáticas sin Constatación Humana',
    summary: 'Proyecto de Ordenanza para prohibir la utilización de radares o fotomultas cuya configuración sea estrictamente algorítmica, careciendo de constatación humana en tiempo real.',
    category: 'Tránsito'
  },
  {
    id: 108,
    title: 'Informes y Expedientes del Sistema de Estacionamiento Medido (SEM)',
    summary: 'Proyecto de Comunicación exigiendo al DEM toda la información, antecedentes y expedientes vinculados al Sistema de Estacionamiento Medido (SEM).',
    category: 'Tránsito'
  },
  {
    id: 109,
    title: 'Puesta en Funcionamiento de la Junta Electoral Municipal',
    summary: 'Proyecto de Comunicación para que el DEM arbitre las medidas necesarias para la constitución e integración de la Junta Electoral Municipal.',
    category: 'Institucional'
  },
  {
    id: 110,
    title: 'Informe sobre el evento "UNA + FAN FEST — Edición Mundial"',
    summary: 'Proyecto de Comunicación para solicitar al DEM un informe completo sobre la finalización y realización del evento "UNA + FAN FEST".',
    category: 'Transparencia'
  },
  {
    id: 111,
    title: 'Autorización y Fondos de la "Casa del Streaming de Posadas"',
    summary: 'Proyecto de Comunicación solicitando información documentada sobre la autorización municipal de los eventos realizados en calle Colón bajo la denominación "Casa del Streaming".',
    category: 'Transparencia'
  },
  {
    id: 112,
    title: 'Contrataciones de Volquetes y Camiones Volcadores',
    summary: 'Proyecto de Comunicación solicitando informes vinculados a las contrataciones, alquileres y locaciones de volquetes y servicios de camiones volcadores.',
    category: 'Control'
  },
  {
    id: 113,
    title: 'Eliminación de Tasas Específicas para Volquetes',
    summary: 'Proyecto de Ordenanza para modificar la Ord. XVI-N° 119 y eliminar la posibilidad de establecer tasas específicas vinculadas a la autorización e instalación de volquetes.',
    category: 'Desarrollo Económico'
  },
  {
    id: 1,
    title: 'Pedido de Informes sobre Alquileres de Edificios Municipales',
    summary: 'Auditoría y control de los contratos de alquiler vigentes de dependencias municipales para optimizar recursos públicos.',
    category: 'Economía'
  },
  {
    id: 2,
    title: 'Auditoría y Padrón de Proveedores del Estado',
    summary: 'Solicitud de informes sobre las contrataciones y compras realizadas a proveedores y contratistas directos.',
    category: 'Economía'
  },
  {
    id: 3,
    title: 'Control de Gastos en Publicidad y Propaganda Oficial',
    summary: 'Pedido de aclaraciones sobre el presupuesto asignado a pautas publicitarias y propaganda institucional de Posadas.',
    category: 'Economía'
  },
  {
    id: 4,
    title: 'Auditoría de Aportes Previsionales al IPS',
    summary: 'Control del estado de transferencias de aportes jubilatorios de los empleados municipales al IPS Misiones.',
    category: 'Economía'
  },
  {
    id: 5,
    title: 'Registro de Donaciones y Legados Municipales',
    summary: 'Solicitud de informe detallado de las donaciones aceptadas por la comuna y su asignación patrimonial.',
    category: 'Economía'
  },
  {
    id: 6,
    title: 'Gastos de Urgencia sin Licitación Pública',
    summary: 'Pedido de informes sobre contrataciones directas encuadradas bajo régimen de urgencia o fuerza mayor.',
    category: 'Economía'
  },
  {
    id: 7,
    title: 'Estado de Juicios contra el Municipio',
    summary: 'Requerimiento de información sobre litigios judiciales activos y provisiones para fallos en contra del erario público.',
    category: 'Economía'
  },
  {
    id: 8,
    title: 'Rendición de Subsidios Otorgados a Terceros',
    summary: 'Control de las rendiciones de cuentas de los subsidios financieros otorgados a entidades civiles y comisiones.',
    category: 'Economía'
  },
  {
    id: 9,
    title: 'Auditoría de Subsidios al Transporte Urbano (SIT)',
    summary: 'Pedido de informes sobre los fondos y subsidios públicos distribuidos a empresas de transporte de Posadas.',
    category: 'Economía'
  },
  {
    id: 10,
    title: 'Gratuidades y Control del Boleto Estudiantil Estatal',
    summary: 'Requerimiento de datos sobre la cobertura, uso y financiamiento del boleto gratuito estudiantil (BEEG).',
    category: 'Juventud'
  },
  {
    id: 11,
    title: 'Emisión de Licencias de Conducir y Descentralización de Trámites',
    summary: 'Proyecto para auditar los costos de emisión, exámenes médicos y descentralización del trámite del carnet.',
    category: 'Modernización'
  },
  {
    id: 12,
    title: 'Recaudación y Gestión del Estacionamiento Medido (SEM)',
    summary: 'Pedido de informes sobre los fondos recaudados por la aplicación del SEM y su destino presupuestario.',
    category: 'Urbanismo'
  },
  {
    id: 13,
    title: 'Cobro de Multas y Funcionamiento del Tribunal de Faltas',
    summary: 'Solicitud de estadísticas de infracciones labradas y la recaudación neta del Tribunal de Faltas municipal.',
    category: 'Modernización'
  },
  {
    id: 14,
    title: 'Estado del Parque Vial y Maquinaria Municipal',
    summary: 'Control de inventario, mantenimiento y horas de uso de las máquinas viales del municipio.',
    category: 'Urbanismo'
  },
  {
    id: 15,
    title: 'Simplificación de Habilitaciones Comerciales y Bajas',
    summary: 'Informe solicitado sobre la demora de habilitaciones comerciales y propuestas de trámites exprés.',
    category: 'Economía'
  },
  {
    id: 16,
    title: 'Tasa a Salas de Juego y Casinos de Posadas',
    summary: 'Control tributario y auditoría sobre los cánones abonados por salas de apuestas ubicadas en la ciudad.',
    category: 'Economía'
  },
  {
    id: 17,
    title: 'Infraestructura del Parque Industrial Posadas',
    summary: 'Estado de radicación de empresas y beneficios fiscales aplicados para el desarrollo industrial.',
    category: 'Economía'
  },
  {
    id: 18,
    title: 'Tasa de Espectáculos Públicos y Eventos Comerciales',
    summary: 'Auditoría sobre la exención o cobro de tasas a eventos comerciales y recitales de Posadas.',
    category: 'Economía'
  },
  {
    id: 19,
    title: 'Inspecciones Bromatológicas y Multas a Comercios',
    summary: 'Pedido de datos sobre actas labradas, decomisos y multas en comercios gastronómicos locales.',
    category: 'Economía'
  },
  {
    id: 20,
    title: 'Publicidad en Vía Pública y Cánones de Cartelería',
    summary: 'Control del cobro de derechos por carteles comerciales instalados en espacios públicos.',
    category: 'Economía'
  },
  {
    id: 21,
    title: 'Concesiones de Locales en la Costanera y Espacios Públicos',
    summary: 'Pedido de informes sobre pliegos, cánones mensuales y adjudicaciones de paradores municipales.',
    category: 'Urbanismo'
  },
  {
    id: 22,
    title: 'Fondo de Compensaciones de la Entidad Binacional Yacyretá',
    summary: 'Solicitud de informe sobre las regalías y obras compensatorias pendientes de la EBY en la ciudad.',
    category: 'Economía'
  },
  {
    id: 23,
    title: 'Avance del Plan Estratégico Posadas 2010-2035',
    summary: 'Control de las metas viales y de planificación territorial cumplidas dentro del plan rector.',
    category: 'Urbanismo'
  },
  {
    id: 24,
    title: 'Regularización Dominial y Ocupación de Tierras Fiscales',
    summary: 'Relevamiento de asentamientos y proyectos para la titulación y urbanización de terrenos.',
    category: 'Urbanismo'
  },
  {
    id: 25,
    title: 'Tasas Punitorias a Terrenos Baldíos Abandonados',
    summary: 'Control del cobro de tasas punitivas y multas por malezas y abandono de terrenos privados.',
    category: 'Urbanismo'
  },
  {
    id: 26,
    title: 'Eliminación de Barreras Arquitectónicas y Accesibilidad',
    summary: 'Proyecto para auditar la accesibilidad (rampas, sendas) en veredas y edificios del microcentro.',
    category: 'Urbanismo'
  },
  {
    id: 27,
    title: 'Servicio de Agua Potable, Falta de Presión y Suministro',
    summary: 'Pedido de informes sobre cortes recurrentes y falta de presión de agua en Itaembé Miní.',
    category: 'Urbanismo'
  },
  {
    id: 28,
    title: 'Gestión de Residuos Sólidos Urbanos (GIRSU)',
    summary: 'Control del sistema de recolección diferenciada y funcionamiento del relleno sanitario.',
    category: 'Urbanismo'
  },
  {
    id: 29,
    title: 'Plan de Arbolado e Inventario Forestal Urbano',
    summary: 'Solicitud de informes sobre el reemplazo de especies exóticas y censo de árboles urbanos.',
    category: 'Urbanismo'
  },
  {
    id: 30,
    title: 'Control y Medición de Ruidos Molestos',
    summary: 'Estadísticas de denuncias a locales nocturnos, escapes libres y sonómetros homologados.',
    category: 'Urbanismo'
  },
  {
    id: 31,
    title: 'Erradicación de Microbasurales en Barrios',
    summary: 'Solicitud de informes sobre focos crónicos de basura acumulada en avenidas periféricas.',
    category: 'Urbanismo'
  },
  {
    id: 32,
    title: 'Presupuesto y Cobertura del IMuSA',
    summary: 'Pedido de informes sobre campañas de castración, vacunación y presupuesto del instituto de salud animal.',
    category: 'Urbanismo'
  },
  {
    id: 33,
    title: 'Control de Contaminación de Efluentes en Arroyos',
    summary: 'Auditoría ambiental de efluentes arrojados a los arroyos Mártires y El Zaimán.',
    category: 'Urbanismo'
  },
  {
    id: 34,
    title: 'Ejecución del Presupuesto Participativo',
    summary: 'Pedido de informes sobre el estado de obras votadas por los vecinos que aún no se iniciaron.',
    category: 'Modernización'
  },
  {
    id: 35,
    title: 'Padrones y Elecciones de Comisiones Vecinales',
    summary: 'Control de los llamados a elecciones y padrones de las comisiones en las delegaciones.',
    category: 'Modernización'
  },
  {
    id: 36,
    title: 'Provisión de Medicamentos e Insumos en los CAPS',
    summary: 'Pedido de informes sobre insumos y médicos de guardia en los Centros de Atención Primaria.',
    category: 'Modernización'
  },
  {
    id: 37,
    title: 'Gastos y Contrataciones en Eventos Culturales',
    summary: 'Auditoría de fondos destinados a festivales artísticos municipales y ferias culturales.',
    category: 'Juventud'
  },
  {
    id: 38,
    title: 'Funcionamiento del Concejo Municipal de Turismo',
    summary: 'Pedido de informes sobre el uso del fondo de promoción turística y la agenda de la ciudad.',
    category: 'Economía'
  },
  {
    id: 39,
    title: 'Ingresos de Personal y Concursos de Oposición',
    summary: 'Auditoría sobre la designación de personal en planta permanente contratado sin concurso previo.',
    category: 'Modernización'
  },
  {
    id: 40,
    title: 'Gasto en Software y Licencias Tecnológicas del Municipio',
    summary: 'Control del costo de licencias de software y desarrollos a medida de la web municipal.',
    category: 'Modernización'
  },
  {
    id: 41,
    title: 'Transparencia en la Contratación de Cooperativas de Trabajo',
    summary: 'Pedido de informes sobre montos abonados a cooperativas para barrido y mantenimiento de plazas.',
    category: 'Economía'
  },
  {
    id: 42,
    title: 'Inventario General de Bienes Muebles Estatales',
    summary: 'Control de bajas, robos o pérdidas de computadoras y mobiliario de las oficinas del estado.',
    category: 'Modernización'
  },
  {
    id: 43,
    title: 'Radares de Velocidad y Fotomultas',
    summary: 'Auditoría sobre convenios de radares colocados en avenidas clave y reparto de la recaudación.',
    category: 'Modernización'
  },
  {
    id: 44,
    title: 'Cupo Laboral de Personas con Discapacidad en el Municipio',
    summary: 'Pedido de informes sobre el porcentaje de empleados con discapacidad contratados por la comuna.',
    category: 'Juventud'
  },
  {
    id: 45,
    title: 'Registro de Antenas de Telecomunicaciones y Tasa Ambiental',
    summary: 'Relevamiento de antenas habilitadas y el cobro de la tasa ambiental por radiación.',
    category: 'Urbanismo'
  },
  {
    id: 46,
    title: 'Capacidad e Infraestructura del Cementerio La Piedad',
    summary: 'Estado de columbarios, parcelas y proyectos para la construcción de un crematorio público.',
    category: 'Urbanismo'
  },
  {
    id: 47,
    title: 'Fideicomisos y Sociedades Estatales con Participación Municipal',
    summary: 'Auditoría de cuentas y balances de las sociedades con participación municipal mayoritaria.',
    category: 'Economía'
  },
  {
    id: 48,
    title: 'Distribución de Recursos del Honorable Concejo Deliberante',
    summary: 'Control presupuestario de las dietas, contratos políticos y partidas presupuestarias del Concejo.',
    category: 'Economía'
  },
  {
    id: 49,
    title: 'Publicación Digital del Boletín Oficial de Posadas',
    summary: 'Pedido de informes sobre demoras en la digitalización y publicación de ordenanzas aprobadas.',
    category: 'Modernización'
  },
  {
    id: 50,
    title: 'Consumo de Combustible y Gastos de la Flota Oficial',
    summary: 'Auditoría de los gastos de mantenimiento y vales de combustible de la flota de vehículos oficiales.',
    category: 'Economía'
  }
];

// Top 3 Proyectos Bandera Destacados
const FEATURED_PROJECTS = [
  {
    id: 'feat-1',
    title: 'Transparencia Legislativa',
    summary: 'Auditoría y optimización de recursos.',
    details: 'Llevamos a cabo una auditoría exhaustiva en el Concejo Deliberante de Posadas, consolidando más de 100 proyectos de pedido de informes y ordenanzas para transparentar contrataciones directas, compras públicas, viáticos y el uso de vales de combustible de la flota municipal.',
    badge: 'Auditoría y Control',
    color: 'var(--primary)'
  },
  {
    id: 'feat-2',
    title: 'Eliminar el SEM',
    summary: 'Pedido de informes para la eliminación del estacionamiento medido.',
    details: 'Presentamos un exhaustivo pedido de informes sobre la recaudación y gestión del Sistema de Estacionamiento Medido (SEM) en Posadas, con la propuesta y el objetivo final de eliminarlo para aliviar la carga económica sobre los vecinos y comerciantes del centro.',
    badge: 'Tránsito y Gestión',
    color: 'var(--secondary)'
  },
  {
    id: 'feat-3',
    title: 'Fomento al Emprendedurismo Local',
    summary: 'Apoyo y simplificación de recursos.',
    details: 'Proyecto legislativo para crear un Régimen Simplificado de Habilitación Comercial exprés, exención de tasas por 6 meses para nuevos comercios familiares, y la provisión de microcréditos municipales para potenciar a emprendedores locales.',
    badge: 'Economía y Empleo',
    color: 'var(--accent)'
  }
];

export default function ProjectsCatalog({ hideBandera = false }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProjectTitle, setModalProjectTitle] = useState('');
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

  const handleOpenModal = (projectTitle) => {
    // Redirección directa a WhatsApp sin pasar por el formulario modal
    const adminPhone = "5493764515738"; // Número de la campaña
    const textMessage = `Hola Santiago, me pongo en contacto para solicitar el expediente completo o sumar una idea respecto al proyecto: "${projectTitle}".`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(textMessage)}`;
    
    window.open(whatsappUrl, '_blank');
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

        {/* Sección Proyectos Bandera (Top 3 destacados) */}
        {!hideBandera && (
        <div className="featured-section" data-aos="fade-up">
          <h3 className="section-subtitle-small">
            <span className="bullet-glow"></span>
            Proyectos Bandera
          </h3>
          <div className="featured-grid">
            {FEATURED_PROJECTS.map((feat) => (
              <div 
                key={feat.id} 
                className="featured-card card glass-panel"
                style={{ '--feat-color': feat.color }}
              >
                <div className="feat-header">
                  <span className="badge badge-primary feat-badge" style={{ color: feat.color, borderColor: feat.color, backgroundColor: 'transparent' }}>
                    {feat.badge}
                  </span>
                  <span className="feat-highlight-dot" style={{ backgroundColor: feat.color }}></span>
                </div>
                <h4 className="feat-title">{feat.title}</h4>
                <p className="feat-summary">{feat.summary}</p>
                <p className="feat-details">{feat.details}</p>
                <button 
                  onClick={() => handleOpenModal(feat.title)} 
                  className="btn btn-primary btn-sm feat-cta"
                  style={{ marginTop: 'auto' }}
                >
                  <span>Solicitar proyecto completo</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

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
                const isOrdenanza = proj.summary.toLowerCase().includes('ordenanza') || proj.title.toLowerCase().includes('ordenanza');
                return (
                <div key={proj.id} className={`project-grid-card card glass-panel ${isOrdenanza ? 'ordenanza-highlight' : ''}`}>
                  <div className="proj-card-header">
                    <span className="proj-id-badge">#{proj.id}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {isOrdenanza && <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#000', fontWeight: 'bold', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>⭐ ORDENANZA</span>}
                      <span className="badge badge-accent proj-cat-badge">{proj.category}</span>
                    </div>
                  </div>
                  <h4 className="proj-card-title">{proj.title}</h4>
                  <p className="proj-card-summary">{proj.summary}</p>
                  <div className="proj-card-actions">
                    <button 
                      onClick={() => handleOpenModal(proj.title)}
                      className="btn btn-secondary btn-sm proj-card-cta"
                    >
                      <span>Solicitar completo</span>
                    </button>
                    <button 
                      onClick={() => handleOpenModal(`Aporte para: ${proj.title}`)}
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
                  const isOrdenanza = proj.summary.toLowerCase().includes('ordenanza') || proj.title.toLowerCase().includes('ordenanza');
                  return (
                  <div key={proj.id} className={`list-row ${isOrdenanza ? 'ordenanza-row-highlight' : ''}`}>
                    <span className="td-id">#{proj.id}</span>
                    <div className="td-title-wrapper">
                      <span className="td-title">
                        {isOrdenanza && <span style={{ color: 'var(--primary)', marginRight: '0.4rem' }}>⭐</span>}
                        {proj.title}
                      </span>
                      <span className="td-summary-inline">{proj.summary}</span>
                    </div>
                    <span className="td-category">
                      {isOrdenanza && <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#000', fontWeight: 'bold', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px', marginBottom: '0.2rem', display: 'inline-block' }}>ORDENANZA</span>}
                      <span className="badge badge-accent proj-cat-badge-small">{proj.category}</span>
                    </span>
                    <div className="td-actions">
                      <button 
                        onClick={() => handleOpenModal(proj.title)}
                        className="btn btn-secondary btn-xs-table"
                      >
                        Solicitar
                      </button>
                      <button 
                        onClick={() => handleOpenModal(`Idea sobre: ${proj.title}`)}
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
          <div className="modal-content glass-panel animate-fade-in">
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            {modalSent ? (
              <div className="modal-success">
                <div className="success-icon-ring">
                  <Send size={32} style={{ color: 'var(--success)' }} />
                </div>
                <h3>¡Solicitud Recibida!</h3>
                <p>Nos pondremos en contacto con vos a la brevedad para enviarte el expediente oficial del proyecto o coordinar tu propuesta legislativa.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="modal-form">
                <h3>Contacto Vecinal Directo</h3>
                <p className="modal-subtitle-form">
                  Estás solicitando el proyecto completo o sumando ideas para:<br />
                  <strong>{modalProjectTitle}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Juan Pérez" 
                    required 
                    value={modalForm.name}
                    onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número de WhatsApp *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. 3764-XXXXXX" 
                    required 
                    value={modalForm.contact}
                    onChange={(e) => setModalForm(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensaje / Idea</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3} 
                    value={modalForm.message}
                    onChange={(e) => setModalForm(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-full-width" style={{ marginTop: '1rem' }}>
                  <span>Enviar mensaje a Santiago</span>
                </button>
              </form>
            )}
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
          gap: 1rem;
          border-top: 1px solid var(--overlay-light);
          padding-top: 1rem;
        }

        .filter-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .filter-pills {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
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

        .modal-subtitle-form {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          background: var(--overlay-light);
          border-radius: 10px;
          border-left: 3px solid var(--primary);
        }

        .modal-success {
          text-align: center;
          padding: 2rem 0;
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
          .modal-subtitle-form {
            font-size: 0.78rem;
            padding: 0.5rem 0.75rem;
            margin-bottom: 1rem;
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
