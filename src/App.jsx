import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Carga perezosa (Lazy Loading) para optimización de rendimiento
const Hero = lazy(() => import('./components/Hero'));
const ProjectsCatalog = lazy(() => import('./components/ProjectsCatalog'));
const SocialBento = lazy(() => import('./components/SocialBento'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const ReportsPortal = lazy(() => import('./components/ReportsPortal'));
const PressKit = lazy(() => import('./components/PressKit'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ReclamoPage = lazy(() => import('./components/ReclamoPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

// Seed inicial de reportes
const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    trackingCode: 3821,
    title: 'Crateres gigantes en Av. San Martín (altura 1200)',
    description: 'Hay más de 4 baches gigantescos que obligan a los autos a desviarse al carril contrario. Es un peligro inminente de accidente, sobre todo de noche ya que no hay suficiente iluminación.',
    category: 'Infraestructura',
    urgency: 'alto',
    location: 'Avenida San Martín 1200',
    status: 'en_comision',
    comisionName: 'Obras Públicas y Urbanismo',
    comisionConcejal: 'Santiago Horianski',
    upvotes: 42,
    createdAt: '2026-06-05T14:30:00.000Z',
    anonymousName: 'Vecino Preocupado',
    phone: '3764123456',
    candidateResponse: '¡Hola! Ya visité este tramo de la avenida. Es impresentable que el municipio no haya asfaltado esto hace meses. Logramos ingresar el proyecto formal al Concejo Deliberante y actualmente está bajo análisis en la comisión.',
    statusHistory: [
      { status: 'recibido', timestamp: '2026-06-05T14:30:00.000Z' },
      { status: 'en_comision', timestamp: '2026-06-07T10:15:00.000Z' }
    ]
  },
  {
    id: 'rep-2',
    trackingCode: 1948,
    title: 'Falta total de luminarias en el parque lineal',
    description: 'Desde hace dos semanas toda la sección norte del parque lineal está a oscuras. Los jóvenes y deportistas ya no pueden usarlo después de las 6 PM por miedo a robos. Es una boca de lobo.',
    category: 'Seguridad',
    urgency: 'alto',
    location: 'Parque Lineal Norte',
    status: 'recibido',
    upvotes: 89,
    createdAt: '2026-06-06T09:15:00.000Z',
    anonymousName: 'Corredor Nocturno',
    phone: '3764987654',
    candidateResponse: 'Totalmente de acuerdo. La oscuridad atrae el delito. Proponemos el proyecto "Luz Segura": reemplazar las luminarias por focos LED inteligentes con cámaras de seguridad conectadas al centro de monitoreo.',
    statusHistory: [
      { status: 'recibido', timestamp: '2026-06-06T09:15:00.000Z' }
    ]
  },
  {
    id: 'rep-3',
    trackingCode: 8421,
    title: 'Microbasural en esquina de Los Ombúes y Las Lilas',
    description: 'Gente de otros lados viene a tirar escombros y basura acumulada en esta esquina. Ya hay ratas y un olor insoportable. Necesitamos contenedores o cámaras para multar.',
    category: 'Basura y Medioambiente',
    urgency: 'medio',
    location: 'Los Ombúes y Las Lilas',
    status: 'aprobado',
    upvotes: 24,
    createdAt: '2026-06-04T18:00:00.000Z',
    anonymousName: 'Usuario Transporte',
    phone: '3764555555',
    candidateResponse: 'Un tema que siempre impulsé. Presenté un proyecto para licitar garitas techadas, iluminadas y con botones de pánico. Lo aprobaron y el Ejecutivo debería instalarlo este mes.',
    statusHistory: [
      { status: 'recibido', timestamp: '2026-05-10T08:00:00.000Z' },
      { status: 'en_comision', timestamp: '2026-05-15T09:30:00.000Z' },
      { status: 'aprobado', timestamp: '2026-06-01T12:00:00.000Z' }
    ]
  },
  {
    id: 'rep-4',
    trackingCode: 5732,
    title: 'Contrato directo dudoso para servicios de grúa',
    description: 'Se adjudicó de forma directa la contratación de grúas municipales a una empresa creada hace 3 meses sin licitación pública previa. Solicitamos explicaciones sobre los costos involucrados.',
    category: 'Transparencia',
    urgency: 'alto',
    location: 'Edificio Municipal',
    status: 'en_votacion',
    sesionNumber: '12',
    upvotes: 124,
    createdAt: '2026-06-07T11:00:00.000Z',
    anonymousName: 'Ciudadano Observador',
    phone: '3764112233',
  }
];

const INITIAL_NEWS = [
  {
    id: 'news-1',
    title: '"La Libertad Avanza va a eliminar el SEM en Posadas"',
    date: '2024-11-14',
    content: `Desde la bancada de La Libertad Avanza presentaron un pedido para investigar a fondo el contrato del Sistema de Estacionamiento Medido (SEM) con Decisiones Empresariales S.R.L., advirtiendo sobre presuntos incumplimientos graves y exigiendo explicaciones al Ejecutivo municipal.

Según el análisis del contrato original expuesto por el bloque, para el 21 de noviembre de 2024 las licencias y equipos debían pasar al patrimonio del Municipio. Sin embargo, los ediles señalaron que el Ejecutivo habría firmado una "Adenda" que extendería la concesión al privado hasta 2027, modificando las comisiones sin el paso previo por el recinto.

**Los puntos clave que se exigen investigar:**

- **Presunta recaudación tercerizada (Cláusula 9ª):** Se detectó que el cobro se estaría realizando a través de Pronto Pago S.A., operando con un CUIT ajeno al de la empresa contratista. Se solicitó conocer qué instrumento legal autoriza esta operatoria.
- **Dudas sobre el software (Cláusula 3ª y 10ª):** No habría constancia de las auditorías de seguridad que debían realizar la UNaM o la UTN, poniendo en duda la protección de los datos de los usuarios. Además, el código fuente y las bases de datos no habrían sido entregados al Municipio como establecía el acuerdo.
- **Seguro de responsabilidad (Cláusula 12ª):** Se solicitó verificar si la empresa mantiene vigente la póliza que protege al Municipio ante posibles reclamos de los vecinos.

> "El posadeño no puede seguir pagando un servicio rodeado de sombras y posibles irregularidades. Necesitamos que el Intendente nos muestre los papeles y nos explique en qué condiciones está operando la empresa."
  
Los concejales libertarios advirtieron que de comprobarse estos hechos, podrían solicitar la rescisión del contrato.`,
    isVisible: true
  }
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeadores DB <> Reclamos
  const mapDbToReport = (db) => ({
    id: db.id,
    trackingCode: Number(db.tracking_code),
    title: db.title,
    description: db.description,
    category: db.category,
    location: db.location || `${db.barrio} - ${db.calle_principal}`,
    barrio: db.barrio,
    callePrincipal: db.calle_principal,
    entreCalle1: db.entre_calle_1 || '',
    entreCalle2: db.entre_calle_2 || '',
    phone: db.phone || '',
    anonymousName: db.anonymous_name || '',
    gpsLat: db.gps_lat || null,
    gpsLng: db.gps_lng || null,
    upvotes: Number(db.upvotes || 0),
    status: db.status || 'recibido',
    isVisible: db.is_visible !== false,
    photos: db.photos || [],
    statusHistory: db.status_history || [],
    createdAt: db.created_at
  });

  const mapReportToDb = (rep) => ({
    id: rep.id,
    tracking_code: Number(rep.trackingCode),
    title: rep.title,
    description: rep.description,
    category: rep.category,
    barrio: rep.barrio || rep.location?.split(' - ')[0] || 'Desconocido',
    calle_principal: rep.callePrincipal || rep.location?.split(' - ')[1] || 'No especificada',
    entre_calle_1: rep.entreCalle1 || null,
    entre_calle_2: rep.entreCalle2 || null,
    phone: rep.phone || null,
    email: rep.email || null,
    anonymous_name: rep.anonymousName || null,
    gps_lat: rep.gpsLat || null,
    gps_lng: rep.gpsLng || null,
    upvotes: Number(rep.upvotes || 0),
    status: rep.status,
    is_visible: rep.isVisible !== false,
    photos: rep.photos || [],
    status_history: rep.statusHistory || []
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('municipal_reports');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        return parsed.map(rep => {
          if (!rep.phone) {
            const initial = INITIAL_REPORTS.find(i => i.id === rep.id);
            if (initial && initial.phone) {
              return { ...rep, phone: initial.phone };
            }
          }
          return rep;
        });
      }
      return INITIAL_REPORTS;
    } catch (e) {
      return INITIAL_REPORTS;
    }
  });

  const [newsList, setNewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('municipal_news');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NEWS;
    } catch (e) {
      return INITIAL_NEWS;
    }
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('site_theme');
    return savedTheme ? savedTheme : 'light';
  });

  // Cargar datos de Supabase si está activo
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchSupabaseData = async () => {
      try {
        // 1. Reclamos
        const { data: reportsData, error: reportsError } = await supabase
          .from('municipal_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;

        if (reportsData && reportsData.length > 0) {
          setReports(reportsData.map(mapDbToReport));
        } else {
          // Sembrar datos iniciales si la DB está vacía
          const dbSeed = INITIAL_REPORTS.map(mapReportToDb);
          const { error: seedError } = await supabase
            .from('municipal_reports')
            .insert(dbSeed);
          if (!seedError) {
            setReports(INITIAL_REPORTS);
          }
        }

        // 2. Noticias
        const { data: newsData, error: newsError } = await supabase
          .from('municipal_news')
          .select('*')
          .order('created_at', { ascending: false });

        if (newsError) throw newsError;

        if (newsData && newsData.length > 0) {
          setNewsList(newsData);
        } else {
          // Sembrar noticias si la DB está vacía
          const { error: seedNewsError } = await supabase
            .from('municipal_news')
            .insert(INITIAL_NEWS);
          if (!seedNewsError) {
            setNewsList(INITIAL_NEWS);
          }
        }
      } catch (err) {
        console.error("Error al sincronizar con Supabase en la carga inicial:", err);
      }
    };

    fetchSupabaseData();
  }, []);

  useEffect(() => {
    localStorage.setItem('municipal_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('municipal_news', JSON.stringify(newsList));
  }, [newsList]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleUpvoteReport = async (reportId) => {
    const votedKey = `upvoted_${reportId}`;
    if (sessionStorage.getItem(votedKey)) return;

    setReports(prevReports => 
      prevReports.map(rep => {
        if (rep.id === reportId) {
          sessionStorage.setItem(votedKey, 'true');
          const newUpvotes = rep.upvotes + 1;
          
          if (isSupabaseConfigured) {
            supabase
              .from('municipal_reports')
              .update({ upvotes: newUpvotes })
              .eq('id', reportId)
              .then(({ error }) => {
                if (error) console.error("Error al sumar voto en Supabase:", error);
              });
          }
          
          return { ...rep, upvotes: newUpvotes };
        }
        return rep;
      })
    );
  };

  const handleAddReport = async (newReportData) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      trackingCode: newReportData.trackingCode || Math.floor(1000 + Math.random() * 9000),
      title: newReportData.title,
      description: newReportData.description,
      category: newReportData.category,
      urgency: newReportData.urgency || 'media',
      location: newReportData.location || `${newReportData.barrio} - ${newReportData.callePrincipal}`,
      barrio: newReportData.barrio || 'Desconocido',
      callePrincipal: newReportData.callePrincipal || 'No especificada',
      entreCalle1: newReportData.entreCalle1 || '',
      entreCalle2: newReportData.entreCalle2 || '',
      status: 'recibido',
      upvotes: 1,
      createdAt: new Date().toISOString(),
      anonymousName: newReportData.anonymousName || 'Vecino Anónimo',
      statusHistory: [{ status: 'recibido', timestamp: new Date().toISOString() }],
      photos: newReportData.photos || [],
      phone: newReportData.phone || null,
      gpsLat: newReportData.gpsLat || null,
      gpsLng: newReportData.gpsLng || null,
      isVisible: false
    };

    setReports(prev => [newReport, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('municipal_reports')
          .insert([mapReportToDb(newReport)]);
        if (error) throw error;
      } catch (err) {
        console.error("Error al guardar el reclamo en Supabase:", err);
      }
    }
  };

  const handleUpdateReport = async (updatedReport) => {
    let finalReport = updatedReport;
    
    setReports(prevReports => 
      prevReports.map(rep => {
        if (rep.id === updatedReport.id) {
          const newHistory = [...(rep.statusHistory || [])];
          if (rep.status !== updatedReport.status) {
            newHistory.push({ status: updatedReport.status, timestamp: new Date().toISOString() });
          }
          finalReport = { ...updatedReport, statusHistory: newHistory };
          return finalReport;
        }
        return rep;
      })
    );

    if (isSupabaseConfigured) {
      try {
        const currentReport = reports.find(r => r.id === updatedReport.id);
        const newHistory = [...(currentReport?.statusHistory || [])];
        if (currentReport && currentReport.status !== updatedReport.status) {
          newHistory.push({ status: updatedReport.status, timestamp: new Date().toISOString() });
        }
        const reportToUpload = { ...updatedReport, statusHistory: newHistory };

        const { error } = await supabase
          .from('municipal_reports')
          .update(mapReportToDb(reportToUpload))
          .eq('id', updatedReport.id);
        if (error) throw error;
      } catch (err) {
        console.error("Error al actualizar el reclamo en Supabase:", err);
      }
    }
  };

  const handleDeleteReport = async (id) => {
    setReports(prevReports => prevReports.filter(rep => rep.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('municipal_reports')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error al eliminar el reclamo en Supabase:", err);
      }
    }
  };

  const handleToggleReportVisibility = async (id) => {
    let newVisibility = false;
    
    setReports(prev => prev.map(rep => {
      if (rep.id === id) {
        newVisibility = !rep.isVisible;
        return { ...rep, isVisible: newVisibility };
      }
      return rep;
    }));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('municipal_reports')
          .update({ is_visible: newVisibility })
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error al cambiar la visibilidad del reclamo en Supabase:", err);
      }
    }
  };

  const handleSaveNews = async (newsData) => {
    if (newsData.id) {
      setNewsList(prev => prev.map(n => n.id === newsData.id ? newsData : n));
      
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('municipal_news')
            .update(newsData)
            .eq('id', newsData.id);
          if (error) throw error;
        } catch (err) {
          console.error("Error al actualizar la noticia en Supabase:", err);
        }
      }
    } else {
      const newNews = { ...newsData, id: `news-${Date.now()}`, isVisible: true };
      setNewsList(prev => [newNews, ...prev]);

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('municipal_news')
            .insert([newNews]);
          if (error) throw error;
        } catch (err) {
          console.error("Error al crear la noticia en Supabase:", err);
        }
      }
    }
  };

  const handleDeleteNews = async (id) => {
    setNewsList(prev => prev.filter(n => n.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('municipal_news')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error al eliminar la noticia en Supabase:", err);
      }
    }
  };

  const handleToggleNewsVisibility = async (id) => {
    let newVisibility = false;
    
    setNewsList(prev => prev.map(n => {
      if (n.id === id) {
        newVisibility = !n.isVisible;
        return { ...n, isVisible: newVisibility };
      }
      return n;
    }));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('municipal_news')
          .update({ isVisible: newVisibility })
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error al alternar visibilidad de noticia en Supabase:", err);
      }
    }
  };

  // Scroll al top en cambio de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <ErrorBoundary fallbackRender={({error}) => <div style={{padding: '50px', background: 'white', color: 'red'}}><h1>Error Crash!</h1><pre>{error.message}</pre><pre>{error.stack}</pre></div>}>
      <Helmet>
        <title>Buzón Ciudadano - Tu Voz en el Municipio</title>
      </Helmet>
      
      <div className={`app-wrapper ${theme}-theme`}>
        {location.pathname !== '/admin' && (
          <Header 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />
        )}
        
        <main className="main-content">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--primary)', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid rgba(116, 59, 188, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ fontWeight: '600' }}>Cargando sección...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Hero reportsCount={reports.length} />} />
            <Route path="/proyectos" element={<ProjectsCatalog />} />
            <Route path="/gestion" element={
              <ReportsPortal 
                reports={reports} 
                onUpvote={handleUpvoteReport} 
              />
            } />
            <Route path="/seguimiento" element={
              <ReportsPortal 
                reports={reports} 
                onUpvote={handleUpvoteReport} 
                isSeguimientoMode={true}
              />
            } />
            <Route path="/reclamo" element={<ReclamoPage onSubmitReport={handleAddReport} />} />
            <Route path="/noticias" element={<PressKit newsList={newsList} />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={
              <AdminPanel 
                onLogout={() => navigate('/inicio')} 
                reports={reports} 
                onUpdateReport={handleUpdateReport}
                onDeleteReport={handleDeleteReport}
                onToggleReportVisibility={handleToggleReportVisibility}
                newsList={newsList}
                onSaveNews={handleSaveNews}
                onDeleteNews={handleDeleteNews}
                onToggleNewsVisibility={handleToggleNewsVisibility}
              />
            } />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
            </Routes>
          </Suspense>
        </main>

        {location.pathname !== '/admin' && (
          <>
            <Footer />
            <WhatsAppButton />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
