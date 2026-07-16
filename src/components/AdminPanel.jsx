import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, LogOut, Check, Search, MapPin, Eye, Calendar, AlertCircle, FileText, Phone, MessageSquare, ExternalLink, ShieldCheck, Trash2, Clock, EyeOff, Edit3, X, Download, RefreshCw, Copy, Plus, Image, ZoomIn } from 'lucide-react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react';
import santiagoImg from '../assets/santiago.jpg';
import { generateLegislativeProject } from '../utils/wordGenerator';
import AdminMap from './AdminMap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReportFichaPDF from './ReportFichaPDF';

// Configuración de Roles
const SUPER_ADMIN_EMAILS = ['horianskiseguros@gmail.com', 'santiago.horianski@gmail.com', 'admin@gmail.com'];
const VIEWER_EMAILS = ['visor1@gmail.com', 'visor2@gmail.com', 'visor3@gmail.com'];

const getUserRole = (email) => {
  if (!email) return 'unauthorized';
  const lowerEmail = email.toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(lowerEmail)) return 'admin';
  if (VIEWER_EMAILS.includes(lowerEmail)) return 'viewer';
  return 'unauthorized';
};

export default function AdminPanel({ reports, onUpdateReport, onDeleteReport, onToggleReportVisibility, newsList, onSaveNews, onDeleteNews, onToggleNewsVisibility }) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userRole = getUserRole(userEmail);

  // Tab state
  const [activeTab, setActiveTab] = useState('reclamos'); // 'reclamos' | 'noticias' | 'mapa' | 'whatsapp'
  
  const pdfRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingWA, setIsSendingWA] = useState(false);

  // WhatsApp (Green API) config states
  const [idInstanceInput, setIdInstanceInput] = useState(() => localStorage.getItem('override_green_api_id') || '');
  const [apiTokenInput, setApiTokenInput] = useState(() => localStorage.getItem('override_green_api_token') || '');
  const [waStatus, setWaStatus] = useState('checking'); // 'checking', 'authorized', etc.
  const [qrCodeData, setQrCodeData] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isFetchingQR, setIsFetchingQR] = useState(false);

  const checkWhatsAppStatus = async () => {
    const idInstance = idInstanceInput || localStorage.getItem('override_green_api_id') || import.meta.env.VITE_GREEN_API_ID || "710722683088";
    const apiToken = apiTokenInput || localStorage.getItem('override_green_api_token') || import.meta.env.VITE_GREEN_API_TOKEN || "dc4c710bbc6042e28a74919badcb451119dded45a4a84367a9";
    
    if (!idInstance || !apiToken) {
      setWaStatus('notConfigured');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const cluster = idInstance.toString().substring(0, 4);
      const url = `https://${cluster}.api.greenapi.com/waInstance${idInstance}/getStateInstance/${apiToken}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.stateInstance) {
        setWaStatus(data.stateInstance);
        if (data.stateInstance === 'notAuthorized') {
          fetchQrCode(idInstance, apiToken);
        } else {
          setQrCodeData('');
        }
      } else {
        setWaStatus('error');
      }
    } catch (err) {
      console.error("Error al obtener estado de WhatsApp:", err);
      setWaStatus('error');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchQrCode = async (idInstance, apiToken) => {
    setIsFetchingQR(true);
    try {
      const cluster = idInstance.toString().substring(0, 4);
      const url = `https://${cluster}.api.greenapi.com/waInstance${idInstance}/qr/${apiToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.type === 'image' && data.message) {
        setQrCodeData(data.message);
      } else if (data && data.message) {
        setQrCodeData(data.message);
      }
    } catch (err) {
      console.error("Error al obtener el código QR:", err);
    } finally {
      setIsFetchingQR(false);
    }
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (idInstanceInput) localStorage.setItem('override_green_api_id', idInstanceInput);
    else localStorage.removeItem('override_green_api_id');

    if (apiTokenInput) localStorage.setItem('override_green_api_token', apiTokenInput);
    else localStorage.removeItem('override_green_api_token');

    alert("✅ Credenciales de Green API actualizadas localmente.");
    checkWhatsAppStatus();
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('override_green_api_id');
    localStorage.removeItem('override_green_api_token');
    setIdInstanceInput('');
    setApiTokenInput('');
    alert("🔄 Credenciales temporales eliminadas. Usando configuración predeterminada.");
    setWaStatus('checking');
    setTimeout(() => {
      checkWhatsAppStatus();
    }, 100);
  };

  useEffect(() => {
    if (activeTab === 'whatsapp') {
      checkWhatsAppStatus();
    }
  }, [activeTab]);

  // Dashboard states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Detail form states (when editing a report)
  const [editStatus, setEditStatus] = useState('');
  const [editResponse, setEditResponse] = useState('');
  const [editComisionName, setEditComisionName] = useState('');
  const [editComisionConcejal, setEditComisionConcejal] = useState('');
  const [editSesionNumber, setEditSesionNumber] = useState('');
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // News CMS states
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDate, setNewsDate] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImage, setNewsImage] = useState(null);

  const handleOpenNewsForm = (newsItem = null) => {
    if (newsItem) {
      setCurrentNewsId(newsItem.id);
      setNewsTitle(newsItem.title);
      setNewsDate(newsItem.date);
      setNewsContent(newsItem.content);
      setNewsImage(newsItem.image || null);
    } else {
      setCurrentNewsId(null);
      setNewsTitle('');
      setNewsDate(new Date().toISOString().split('T')[0]);
      setNewsContent(`Escribí el primer párrafo introductorio acá. Podés separarlo con un doble salto de línea.

**Subtítulo en negrita**

- **Primer punto clave:** Descripción del punto.
- **Segundo punto clave:** Descripción del punto.

> "Acá podés poner una cita textual importante que quieras destacar."

Párrafo final o conclusión de la noticia.`);
      setNewsImage(null);
    }
    setIsEditingNews(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleNewsVisibility = (id) => {
    if (onToggleNewsVisibility) {
      onToggleNewsVisibility(id);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  // Renderizador de texto (mismas reglas que PressKit)
  const renderPreviewContent = (text) => {
    if (!text) return <p style={{ color: 'var(--text-muted)' }}>La vista previa aparecerá aquí...</p>;
    
    const blocks = text.split(/\n\s*\n/);
    
    return blocks.map((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;
      
      if (trimmedBlock.startsWith('- ')) {
        const items = trimmedBlock.split('\n').map(line => line.replace(/^- /, '').trim());
        return (
          <ul key={index} style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
            {items.map((item, i) => {
              const htmlContent = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <li key={i} style={{ marginBottom: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }} dangerouslySetInnerHTML={{__html: htmlContent}}></li>;
            })}
          </ul>
        );
      }
      
      if (trimmedBlock.startsWith('> ')) {
        const quoteText = trimmedBlock.replace(/^> /, '');
        return (
          <div key={index} style={{ padding: '1.5rem', background: 'rgba(116, 59, 188, 0.05)', borderLeft: '4px solid var(--primary)', borderRadius: '0 8px 8px 0', margin: '1.5rem 0', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--primary)' }}>
            {quoteText}
          </div>
        );
      }

      const htmlContent = trimmedBlock.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={index} style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: '1.8', marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{__html: htmlContent}}></p>;
    });
  };

  const handleSaveNewsSubmit = (e) => {
    e.preventDefault();
    onSaveNews({
      id: currentNewsId,
      title: newsTitle,
      date: newsDate,
      content: newsContent,
      image: newsImage
    });
    setIsEditingNews(false);
  };



  // KPIs calculations
  const totalReports = reports.length;
  const receivedReports = reports.filter(r => r.status === 'recibido').length;
  const reviewReports = reports.filter(r => r.status === 'en_comision' || r.status === 'en_votacion' || r.status === 'presentado').length;
  const resolvedReports = reports.filter(r => r.status === 'aprobado').length;

  const calculateAverageResolutionTime = () => {
    const resolved = reports.filter(r => r.status === 'aprobado' && r.statusHistory && r.statusHistory.length > 1);
    if (resolved.length === 0) return 'N/A';
    
    let totalMs = 0;
    resolved.forEach(r => {
      const firstLog = r.statusHistory[0];
      const lastLog = r.statusHistory[r.statusHistory.length - 1];
      totalMs += (new Date(lastLog.timestamp) - new Date(firstLog.timestamp));
    });
    
    const avgDays = totalMs / (1000 * 60 * 60 * 24 * resolved.length);
    return avgDays < 1 ? '< 1 día' : `${Math.round(avgDays)} días`;
  };

  const categories = ['Todas', 'Infraestructura', 'Seguridad', 'Basura y Medioambiente', 'Transparencia', 'Otro'];

  // Filter reports
  const filteredReports = reports.filter(rep => {
    const term = searchTerm.toLowerCase();
    const cleanTerm = term.replace(/^#/, ''); // Omitir # si se busca por código
    
    const matchesSearch = 
      rep.title.toLowerCase().includes(term) ||
      (rep.anonymousName && rep.anonymousName.toLowerCase().includes(term)) ||
      rep.location.toLowerCase().includes(term) ||
      rep.description.toLowerCase().includes(term) ||
      (rep.trackingCode && rep.trackingCode.toString().includes(cleanTerm));

    const matchesStatus = statusFilter === 'Todos' || rep.status === statusFilter;
    const matchesCategory = categoryFilter === 'Todas' || rep.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusDetails = (reportOrStatus) => {
    const status = typeof reportOrStatus === 'string' ? reportOrStatus : reportOrStatus.status;
    const report = typeof reportOrStatus === 'object' ? reportOrStatus : {};
    
    switch (status) {
      case 'recibido':
        return {
          text: '📥 Recibido por secretaría del concejal para armar el proyecto',
          badgeClass: 'admin-badge-recibido',
          shortText: 'Recibido'
        };
      case 'presentado':
        return {
          text: '📄 Proyecto presentado oficialmente',
          badgeClass: 'admin-badge-presentado',
          shortText: 'Presentado'
        };
      case 'en_comision':
        const comision = report.comisionName || '[Pendiente]';
        const concejal = report.comisionConcejal || '[Pendiente]';
        return {
          text: `👥 Proyecto en comisión de ${comision} a cargo del Concejal ${concejal}`,
          badgeClass: 'admin-badge-comision',
          shortText: 'En Comisión'
        };
      case 'en_votacion':
        const sesion = report.sesionNumber || '[Pendiente]';
        return {
          text: `🗳️ Proyecto en votación en la sesión N° ${sesion}`,
          badgeClass: 'admin-badge-votacion',
          shortText: 'En Votación'
        };
      case 'aprobado':
        return {
          text: '✅ Proyecto Aprobado - A esperar que el EJECUTIVO (La Municipalidad) lo ejecute',
          badgeClass: 'admin-badge-aprobado',
          shortText: 'Aprobado'
        };
      default:
        return {
          text: '📥 Recibido por secretaría del concejal para armar el proyecto',
          badgeClass: 'admin-badge-recibido',
          shortText: 'Recibido'
        };
    }
  };

  const handleExportExcel = () => {
    // Sort reports by category alphabetically
    const sortedReports = [...filteredReports].sort((a, b) => {
      const catA = a.category || '';
      const catB = b.category || '';
      return catA.localeCompare(catB);
    });

    // Create an HTML table with inline styles for Excel to parse
    const tableRows = sortedReports.map(rep => {
      return `
        <tr>
          <td>${rep.trackingCode || 'N/A'}</td>
          <td>${new Date(rep.createdAt).toLocaleDateString('es-ES')}</td>
          <td>${rep.category}</td>
          <td>${rep.location}</td>
          <td>${rep.anonymousName || 'Anónimo'}</td>
          <td>${rep.phone || 'N/A'}</td>
          <td>${getStatusDetails(rep).shortText}</td>
          <td>${rep.description.replace(/\n/g, '<br>')}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Reclamos</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #743bbc; color: white; font-weight: bold; text-align: center; padding: 10px; border: 1px solid #dddddd; }
          td { padding: 8px; border: 1px solid #dddddd; vertical-align: top; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID Tracking</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th>Vecino</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Descripción del Reclamo</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reclamos_Posadas_${new Date().toLocaleDateString('es-ES')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePDF = async () => {
    if (!pdfRef.current || !selectedReport) return;
    
    try {
      setIsGeneratingPDF(true);
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ficha_Reclamo_${selectedReport.trackingCode || selectedReport.id}.pdf`);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setEditStatus(report.status);
    setEditResponse(report.candidateResponse || '');
    setEditComisionName(report.comisionName || '');
    setEditComisionConcejal(report.comisionConcejal || '');
    setEditSesionNumber(report.sesionNumber || '');
    setIsSaveSuccess(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente este reclamo?`)) {
      onDeleteReport(id);
      if (selectedReport?.id === id) setSelectedReport(null);
    }
  };

  const handleToggleReportVisibility = (id) => {
    onToggleReportVisibility(id);
  };

  const handleSaveReportChanges = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    const updated = {
      ...selectedReport,
      status: editStatus,
      candidateResponse: editResponse.trim() ? editResponse.trim() : null,
      comisionName: editStatus === 'en_comision' ? editComisionName.trim() : null,
      comisionConcejal: editStatus === 'en_comision' ? editComisionConcejal.trim() : null,
      sesionNumber: editStatus === 'en_votacion' ? editSesionNumber.trim() : null
    };

    onUpdateReport(updated);
    
    // Disparar WhatsApp de forma silenciosa (silent = true) si el estado cambió
    if (updated.phone && updated.status !== selectedReport.status) {
      sendWhatsAppNotification(updated, true); 
    }
    
    setIsSaveSuccess(true);
    
    setSelectedReport(updated);

    setTimeout(() => {
      setIsSaveSuccess(false);
      setSelectedReport(null);
    }, 1500);
  };

  // Generador de mensaje de estado
  const generateStatusMessage = (report) => {
    const statusText = getStatusDetails(report).text;
    const codigo = report.trackingCode || '';
    const vecino = report.anonymousName || 'vecino';
    
    return `👋 Hola *${vecino}*, me contacto desde el equipo del Concejal Santiago Horianski en relación a tu reclamo *#${codigo}* sobre *"${report.category}"* en *${report.location}*.

*Estado de la gestión:*
${statusText}

🔍 Podés seguir los avances de tu trámite en tiempo real ingresando a este enlace directo:
https://santiagohorianski.com/gestion?codigo=${codigo}

¡Seguimos trabajando! 💪`;
  };

  // Helper for WhatsApp link
  const getWhatsAppLink = (report) => {
    if (!report.phone) return '#';
    const cleaned = report.phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('54') 
      ? cleaned 
      : cleaned.startsWith('9') 
        ? '54' + cleaned 
        : '549' + (cleaned.startsWith('0') ? cleaned.slice(1) : cleaned);
        
    const text = encodeURIComponent(generateStatusMessage(report));
    return `https://wa.me/${formatted}?text=${text}`;
  };

  const sendWhatsAppNotification = async (report, silent = false) => {
    if (!report.phone) return;
    setIsSendingWA(true);
    try {
      console.log("Iniciando envío de WhatsApp a:", report.phone);
      const cleaned = report.phone.toString().replace(/\D/g, '');
      const formatted = cleaned.startsWith('54') 
        ? cleaned 
        : cleaned.startsWith('9') 
          ? '54' + cleaned 
          : '549' + (cleaned.startsWith('0') ? cleaned.slice(1) : cleaned);
      
      const chatId = `${formatted}@c.us`;
      console.log("Chat ID generado:", chatId);
      const message = generateStatusMessage(report);

      const idInstance = localStorage.getItem('override_green_api_id') || import.meta.env.VITE_GREEN_API_ID || "710722683088";
      const apiToken = localStorage.getItem('override_green_api_token') || import.meta.env.VITE_GREEN_API_TOKEN || "dc4c710bbc6042e28a74919badcb451119dded45a4a84367a9";
      
      if (!idInstance || !apiToken) {
        if (!silent) {
          alert("Faltan las credenciales de Green API en las variables de entorno.");
        }
        setIsSendingWA(false);
        return;
      }

      // El subdominio es los primeros 4 dígitos del ID de instancia
      const cluster = idInstance.toString().substring(0, 4);
      const url = `https://${cluster}.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiToken}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: message
        })
      });

      const data = await response.json();
      if (data && data.idMessage) {
        console.log("✅ ¡Mensaje enviado con éxito!", data.idMessage);
        if (!silent) {
          alert(`✅ ¡Mensaje enviado con éxito!\n\nDestinatario: ${chatId}\nID Mensaje: ${data.idMessage}\n\nTexto enviado:\n${message}`);
        }
      } else {
        const errorJson = JSON.stringify(data, null, 2);
        const copyText = (txt) => {
          const textArea = document.createElement("textarea");
          textArea.value = txt;
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try { document.execCommand('copy'); } catch(e){}
          document.body.removeChild(textArea);
        };

        const wantToCopyError = confirm(`❌ Error al enviar la notificación.\n\n¿Querés COPIAR EL ERROR de la API al portapapeles para pegarlo en el chat de soporte?\n\n- Si elegís ACEPTAR: Se copia el código de error.\n- Si elegís CANCELAR: Se copia el texto del mensaje para envío manual.`);
        
        if (wantToCopyError) {
          copyText(errorJson);
        } else {
          copyText(message);
        }
        console.error('GreenAPI Error Response:', data);
      }
    } catch (error) {
      console.error('GreenAPI Network Error:', error);
      
      const copyText = (txt) => {
        const textArea = document.createElement("textarea");
        textArea.value = txt;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch(e){}
        document.body.removeChild(textArea);
      };
      copyText(message);

      alert(`💥 Error al conectar con Green API.\n\n⚠️ El texto del mensaje se copió automáticamente al portapapeles por si querés enviarlo de forma manual.\n\nError: ${error.message}`);
    } finally {
      setIsSendingWA(false);
    }
  };

  const handleCopyMessage = (report) => {
    const textToCopy = generateStatusMessage(report);
    
    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Mensaje de estado copiado al portapapeles listo para enviar.');
      } catch (err) {
        console.error('Fallback error', err);
        alert('Error al copiar el texto.');
      }
      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopy(textToCopy);
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Mensaje de estado copiado al portapapeles listo para enviar.');
    }).catch((err) => {
      fallbackCopy(textToCopy);
    });
  };
  
  // Helper for Maps Link
  const getMapsLink = (location) => {
    const gpsMatch = location.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/);
    if (gpsMatch) {
      return `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ', Posadas, Misiones')}`;
  };

  return (
    <>
      <Helmet>
        <title>Acceso Restringido | Sistema Interno</title>
      </Helmet>

      <SignedOut>
        <div className="login-container">
          <div className="login-card glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="login-header">
              <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 className="gradient-text">Acceso Restringido</h2>
              <p>Iniciá sesión para ingresar al Panel de Control</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <SignIn routing="hash" forceRedirectUrl="/admin" fallbackRedirectUrl="/admin" />
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {userRole === 'unauthorized' ? (
          <div className="login-container">
            <div className="login-card glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertCircle size={64} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Acceso Denegado</h2>
              <p style={{ marginBottom: '2rem' }}>Tu cuenta ({userEmail}) no tiene permisos para acceder a este sistema.</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <UserButton afterSignOutUrl="/inicio" />
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-container fade-in">
            <Helmet>
              <title>Panel de Administración | Reclamos Posadas</title>
            </Helmet>

            <header className="admin-header glass-panel">
              <div className="admin-header-left">
                <ShieldCheck size={28} className="admin-logo-icon" />
                <div>
                  <h1 className="gradient-text">Buzón Ciudadano</h1>
                  <span className="admin-subtitle">Plataforma de Gestión Legislativa</span>
                </div>
              </div>
              <div className="admin-header-right">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.4rem 1rem 0.4rem 0.5rem', background: 'rgba(116, 59, 188, 0.08)', borderRadius: '30px', border: '1px solid rgba(116, 59, 188, 0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <UserButton 
                    afterSignOutUrl="/inicio" 
                    appearance={{ 
                      elements: { 
                        userButtonAvatarBox: { width: '42px', height: '42px', border: '2px solid var(--primary)' } 
                      } 
                    }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.fullName || 'Administrador'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userEmail}</span>
                  </div>
                </div>
              </div>
            </header>

        {/* Dashboard Header */}
        <div className="admin-header-row glass-panel" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          <div className="admin-title-info">
            <span className="badge badge-accent">
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Modo {userRole === 'admin' ? 'Administrador' : 'Visualizador'}
            </span>
            <h2>Panel de Control</h2>
            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveTab('reclamos')}
                className={`btn ${activeTab === 'reclamos' ? 'btn-primary' : 'btn-secondary'}`}
              >Reclamos Vecinales</button>
              {userRole === 'admin' && (
              <button 
                onClick={() => setActiveTab('noticias')}
                className={`btn ${activeTab === 'noticias' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={18} />
                Noticias & Prensa
              </button>
            )} 
              <button 
                onClick={() => setActiveTab('mapa')}
                className={`btn ${activeTab === 'mapa' ? 'btn-primary' : 'btn-secondary'}`}
              >Mapa Interactivo</button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => setActiveTab('whatsapp')}
                  className={`btn ${activeTab === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MessageSquare size={18} />
                  WhatsApp QR
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'reclamos' && (
          <>
            {/* Dashboard KPIs Grid */}
            <div className="admin-kpis-grid">
              <div className="kpi-card card glass-panel">
                <span className="kpi-num gradient-text">{totalReports}</span>
                <span className="kpi-label">Reclamos Recibidos</span>
              </div>
              <div className="kpi-card card glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <span className="kpi-num" style={{ color: 'var(--danger)' }}>{receivedReports}</span>
                <span className="kpi-label">Pendientes (Recibidos)</span>
              </div>
              <div className="kpi-card card glass-panel" style={{ borderColor: 'rgba(116, 59, 188, 0.2)' }}>
                <span className="kpi-num" style={{ color: 'var(--warning)' }}>{reviewReports}</span>
                <span className="kpi-label">En Trámite Legislativo</span>
              </div>
              <div className="kpi-card card glass-panel" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <span className="kpi-num" style={{ color: 'var(--success)' }}>{resolvedReports}</span>
                <span className="kpi-label">Proyectos Aprobados</span>
              </div>
              <div className="kpi-card card glass-panel" style={{ borderColor: 'rgba(116, 59, 188, 0.2)' }}>
                <span className="kpi-num" style={{ color: '#c4a7e7' }}>{calculateAverageResolutionTime()}</span>
                <span className="kpi-label">Tiempo Promedio Resolución</span>
              </div>
            </div>

            {/* Table Controls Panel */}
            <div className="table-controls glass-panel">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar reclamos por vecino, barrio, descripción o calle..." 
                  className="search-input"
                />
              </div>

              <div className="filters-row" style={{ flexWrap: 'wrap' }}>
                <button onClick={handleExportExcel} className="btn btn-secondary" style={{ marginRight: 'auto', background: 'var(--success)', color: 'white', borderColor: 'var(--success)', alignSelf: 'flex-end' }}>
                  <Download size={16} />
                  <span>Exportar a Excel (.xls)</span>
                </button>

                <div className="filter-select-group">
                  <label>Eje Temático:</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="sort-select"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Estado de Gestión:</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="sort-select"
                  >
                    <option value="Todos">Todos los Estados</option>
                    <option value="recibido">Recibido (Pendiente)</option>
                    <option value="presentado">Presentado</option>
                    <option value="en_comision">En Comisión</option>
                    <option value="en_votacion">En Votación</option>
                    <option value="aprobado">Aprobado</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleRefresh} 
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
                >
                  <RefreshCw size={16} className={isRefreshing ? "spin-animation" : ""} />
                  <span>Actualizar Datos</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrapper glass-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID / Nº</th>
                    <th>Fecha</th>
                    <th>Código Vecino</th>
                    <th>Vecino</th>
                    <th>Categoría</th>
                    <th>Ubicación / Barrio</th>
                    <th>Estado Interno</th>
                    <th>Visibilidad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((rep) => {
                    const statusDetails = getStatusDetails(rep);
                    return (
                      <tr key={rep.id} className="table-row-item">
                        <td data-label="ID / Nº" className="font-display-bold" style={{ color: 'var(--text-muted)' }}>
                          # {rep.id}
                        </td>
                        <td data-label="Fecha" className="td-date">
                          <div className="date-wrapper">
                            <Calendar size={12} />
                            <span>{formatDate(rep.createdAt)}</span>
                          </div>
                        </td>
                        <td data-label="Código" className="font-display-bold" style={{ color: 'var(--primary)' }}>
                          {rep.trackingCode || '----'}
                        </td>
                        <td data-label="Vecino" className="td-name font-display-bold">
                          {rep.anonymousName || 'Vecino Anónimo'}
                        </td>
                        <td data-label="Categoría" className="td-cat">
                          <span className="badge badge-accent">{rep.category}</span>
                        </td>
                        <td data-label="Ubicación" className="td-loc">
                          <div className="location-text-wrap" title={rep.location}>
                            <MapPin size={12} className="loc-icon" />
                            <span>{rep.location}</span>
                          </div>
                        </td>
                        <td data-label="Estado">
                          <span className={`badge ${statusDetails.badgeClass}`}>
                            {statusDetails.shortText}
                          </span>
                        </td>
                        <td data-label="Visibilidad">
                          {rep.isVisible !== false ? (
                            <span className="badge admin-badge-publicado">Publicado</span>
                          ) : (
                            <span className="badge admin-badge-oculto">Oculto</span>
                          )}
                        </td>
                        <td data-label="Acción" style={{ display: 'flex', gap: '0.5rem' }}>
                          {userRole === 'admin' && (
                            <>
                              <button onClick={() => handleToggleReportVisibility(rep.id)} className="action-btn-circle outline" title={rep.isVisible !== false ? "Ocultar al público" : "Hacer visible"}>
                                {rep.isVisible !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button onClick={() => handleDelete(rep.id)} className="action-btn-circle danger" title="Eliminar definitivamente">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {rep.phone && (
                            <>
                              <button onClick={() => sendWhatsAppNotification(rep, false)} disabled={isSendingWA} className="btn btn-table-action" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.35rem 0.5rem', opacity: isSendingWA ? 0.5 : 1 }} title="Enviar WhatsApp Automático">
                                {isSendingWA ? <RefreshCw size={14} className="spin-animation" /> : <Phone size={14} />}
                              </button>
                              <button onClick={() => handleCopyMessage(rep)} className="btn btn-secondary btn-table-action" style={{ padding: '0.35rem 0.5rem' }} title="Copiar estado para enviar">
                                <Copy size={14} />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleOpenDetail(rep)} className="btn btn-secondary btn-table-action" style={{ padding: '0.35rem 0.5rem' }} title="Gestionar detalle">
                            <Edit3 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL / DRAWER DE GESTIÓN */}
        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content admin-drawer glass-panel animate-fade-in" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>✕</button>

              {isSaveSuccess ? (
                <div className="modal-success" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Check size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem auto' }} />
                  <h3>Reclamo Actualizado</h3>
                  <p>La información ha sido guardada correctamente.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveReportChanges} className="drawer-form">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Detalle de Gestión del Reclamo</h3>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {selectedReport.phone && (
                        <button 
                          type="button" 
                          onClick={() => sendWhatsAppNotification(selectedReport, false)}
                          disabled={isSendingWA}
                          className="btn btn-accent" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', borderColor: '#25D366', color: '#fff', opacity: isSendingWA ? 0.7 : 1 }}
                          title="Enviar WhatsApp automático con el estado actual del reclamo"
                        >
                          {isSendingWA ? <RefreshCw size={16} className="spin-animation" /> : <MessageSquare size={16} />}
                          {isSendingWA ? 'Enviando...' : 'Enviar Notificación'}
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => generateLegislativeProject(selectedReport)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        title="Crear Proyecto de Comunicación automáticamente"
                      >
                        <FileText size={16} /> Word
                      </button>
                      <button 
                        type="button" 
                        onClick={handleGeneratePDF} 
                        disabled={isGeneratingPDF}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        title="Descargar Ficha Interna PDF"
                      >
                        <Download size={16} /> {isGeneratingPDF ? 'Generando...' : 'Ficha PDF'}
                      </button>
                    </div>
                  </div>
                  
                  <p className="drawer-subtitle-id">Seguimiento: #{selectedReport.trackingCode || '----'} (ID: {selectedReport.id})</p>
                  
                  <div className="drawer-info-sections">
                    <div className="drawer-left-col">
                      <div className="info-block">
                        <h4>Datos de Contacto Vecinal</h4>
                        <p><strong>Nombre:</strong> {selectedReport.anonymousName || 'Vecino Anónimo'}</p>
                        <p className="whatsapp-row">
                          <strong>WhatsApp:</strong> 
                          <span className="phone-number-badge">{selectedReport.phone || 'No provisto'}</span>
                        </p>
                      </div>

                      <div className="info-block">
                        <h4>Información del Reclamo</h4>
                        <div className="info-grid-two-cols">
                          <p><strong>Eje / Categoría:</strong> <span className="badge badge-accent">{selectedReport.category}</span></p>
                          <p><strong>Fecha de Creación:</strong> {formatDate(selectedReport.createdAt)}</p>
                        </div>
                        <div className="location-detail-card">
                          <div className="loc-card-header">
                            <MapPin size={16} className="loc-card-icon" />
                            <strong>Ubicación Reportada:</strong>
                          </div>
                          <p className="loc-card-address">{selectedReport.location}</p>
                          <a href={getMapsLink(selectedReport.location)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm maps-btn-link" style={{ marginTop: '0.5rem', width: '100%', gap: '0.4rem' }}>
                            <ExternalLink size={14} />
                            <span>Ver en Google Maps</span>
                          </a>
                        </div>
                        <div className="desc-box">
                          <strong>Detalle Vecinal:</strong>
                          <p>{selectedReport.description}</p>
                        </div>
                      </div>

                      {/* Evidence / Photos */}
                      {selectedReport.photos && selectedReport.photos.length > 0 && (
                        <div className="info-block" style={{ marginTop: '0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4>Evidencia Adjunta</h4>
                            <button 
                              type="button"
                              onClick={() => {
                                selectedReport.photos.forEach((photoUrl, i) => {
                                  const link = document.createElement('a');
                                  link.href = photoUrl;
                                  link.download = `evidencia-${selectedReport.id}-${i+1}.jpg`;
                                  link.click();
                                });
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                            >
                              <Download size={12} />
                              Descargar
                            </button>
                          </div>
                          <div className="drawer-photos-grid">
                            {selectedReport.photos.map((photoUrl, i) => (
                              <button 
                                key={i} 
                                type="button"
                                className="drawer-photo-item"
                                onClick={() => setSelectedPhoto(photoUrl)}
                                style={{ border: 'none', background: 'transparent', cursor: 'zoom-in', position: 'relative', width: '100%' }}
                              >
                                <img src={photoUrl} alt={`Evidencia ${i + 1}`} className="photo-src-img" />
                                <div className="photo-zoom-overlay">
                                  <ZoomIn size={20} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="drawer-right-col">
                      <div className="management-block">
                        <h4>Resolución Legislativa</h4>
                        <div className="form-group">
                          <label className="form-label">Estado del Reclamo</label>
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-select">
                            <option value="recibido">Recibido por secretaría del Concejo</option>
                            <option value="presentado">Proyecto presentado</option>
                            <option value="en_comision">Proyecto en comisión</option>
                            <option value="en_votacion">Proyecto en votación en sesión</option>
                            <option value="aprobado">Proyecto Aprobado (Ejecución Ejecutivo)</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label className="form-label">Respuesta Oficial del Concejal</label>
                          <textarea value={editResponse} onChange={(e) => setEditResponse(e.target.value)} className="form-textarea" rows="5"></textarea>
                        </div>
                      </div>

                      {/* Timeline */}
                      {selectedReport.statusHistory && selectedReport.statusHistory.length > 0 && (
                        <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#d3afff', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            Historial de Gestión
                          </h4>
                          <div className="timeline-container" style={{ borderLeft: '2px solid rgba(116, 59, 188, 0.3)', paddingLeft: '1.25rem', marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {selectedReport.statusHistory.map((historyItem, idx) => (
                              <div key={idx} style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-card)' }}></div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                  {new Date(historyItem.date).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                                  {historyItem.status === 'recibido' && 'Recibido por secretaría'}
                                  {historyItem.status === 'presentado' && 'Proyecto presentado'}
                                  {historyItem.status === 'en_comision' && 'Proyecto en comisión'}
                                  {historyItem.status === 'en_votacion' && 'Proyecto en votación'}
                                  {historyItem.status === 'aprobado' && 'Proyecto Aprobado'}
                                </div>
                                {historyItem.note && (
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    "{historyItem.note}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="drawer-actions">
                    <button type="button" onClick={() => setSelectedReport(null)} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={18} /> Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Contenedor oculto para la generación del PDF */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          {selectedReport && (
            <ReportFichaPDF 
              ref={pdfRef} 
              report={selectedReport} 
              getStatusDetails={getStatusDetails} 
            />
          )}
        </div>

        {/* TAB: NOTICIAS */}
        {activeTab === 'noticias' && userRole === 'admin' && (
          <div className="admin-news-section fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Gestión de Noticias y Prensa</h3>
              <button onClick={() => handleOpenNewsForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Nueva Noticia
              </button>
            </div>
            {isEditingNews ? (
              <div className="news-form-card glass-panel fade-in">
                <h4>{currentNewsId ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h4>
                <form onSubmit={handleSaveNewsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label>Título de la Noticia</label>
                    <input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="form-input" required placeholder="Ej: Nueva sesión del concejo..." />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Publicación</label>
                    <input type="date" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Contenido (Soporta Markdown)</label>
                    <textarea value={newsContent} onChange={(e) => setNewsContent(e.target.value)} className="form-textarea" rows="10" required></textarea>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Usa **negrita**, - listas, y doble salto de línea para párrafos.</p>
                  </div>
                  <div className="form-group">
                    <label>Imagen de Portada</label>
                    <div style={{ border: '2px dashed var(--overlay-medium)', padding: '2rem', textAlign: 'center', borderRadius: '12px', background: 'var(--overlay-light)' }}>
                      {newsImage ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={newsImage} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                          <button type="button" onClick={() => setNewsImage(null)} className="action-btn-circle danger" style={{ position: 'absolute', top: '-10px', right: '-10px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Image size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
                          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Arrastrá una imagen o hacé clic para seleccionar</p>
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="news-img-upload" />
                          <label htmlFor="news-img-upload" className="btn btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>Seleccionar Archivo</label>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setIsEditingNews(false)} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} /> Guardar Publicación</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="news-grid">
                {newsList.length === 0 ? (
                  <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1 / -1' }}>
                    <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No hay noticias publicadas aún.</p>
                  </div>
                ) : (
                  newsList.map(item => (
                    <div key={item.id} className="news-admin-card glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ height: '160px', background: 'var(--overlay-medium)', position: 'relative' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Sin imagen</div>
                        )}
                        {!item.isVisible && (
                          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <EyeOff size={12} /> Oculto
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem' }}>{formatDate(item.date)}</div>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', lineHeight: '1.4' }}>{item.title}</h4>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                          <button onClick={() => handleToggleNewsVisibility(item.id)} className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'flex', justifyContent: 'center' }} title={item.isVisible ? "Ocultar" : "Publicar"}>
                            {item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button onClick={() => handleOpenNewsForm(item)} className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'flex', justifyContent: 'center' }} title="Editar">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => { if (window.confirm("¿Eliminar esta noticia?")) onDeleteNews(item.id) }} className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'flex', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: MAPA */}
        {activeTab === 'mapa' && (
          <div className="admin-map-section fade-in glass-panel" style={{ padding: '1rem', borderRadius: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>Mapa de Reclamos Vecinales</h3>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <AdminMap reports={filteredReports} onOpenDetail={handleOpenDetail} />
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && userRole === 'admin' && (
          <div className="admin-whatsapp-section fade-in glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3>Configuración de WhatsApp (Green API)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Monitoreá el estado de la conexión de WhatsApp y escaneá el código QR directamente para vincular tu dispositivo.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              
              {/* Formulario de Credenciales */}
              <form onSubmit={handleSaveCredentials} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)' }}>
                  <ShieldCheck size={18} /> Credenciales de Instancia
                </h4>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>ID Instancia (idInstance) *</label>
                  <input 
                    type="text" 
                    value={idInstanceInput} 
                    onChange={e => setIdInstanceInput(e.target.value)}
                    placeholder="Ej. 710722683088" 
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Token de API (apiTokenInstance) *</label>
                  <input 
                    type="password" 
                    value={apiTokenInput} 
                    onChange={e => setApiTokenInput(e.target.value)}
                    placeholder="Token largo de Green API" 
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                    Guardar y Conectar
                  </button>
                  {(localStorage.getItem('override_green_api_id') || localStorage.getItem('override_green_api_token')) && (
                    <button type="button" onClick={handleClearCredentials} className="btn btn-secondary" style={{ padding: '0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      Restablecer
                    </button>
                  )}
                </div>
              </form>

              {/* Estado de Conexión & QR */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '300px', background: 'rgba(255, 255, 255, 0.01)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <h4 style={{ alignSelf: 'flex-start', margin: 0, color: 'var(--text-primary)' }}>
                  Estado del Servicio
                </h4>

                {isCheckingStatus ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.9rem' }}>Verificando conexión con Green API...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                    
                    {/* Status Badge */}
                    <div style={{ 
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '50px', 
                      fontSize: '0.9rem', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      background: 
                        waStatus === 'authorized' ? 'rgba(16, 185, 129, 0.15)' :
                        waStatus === 'notAuthorized' ? 'rgba(234, 179, 8, 0.15)' :
                        waStatus === 'notConfigured' ? 'rgba(100, 116, 139, 0.15)' :
                        'rgba(239, 68, 68, 0.15)',
                      color: 
                        waStatus === 'authorized' ? 'var(--success)' :
                        waStatus === 'notAuthorized' ? 'var(--warning)' :
                        waStatus === 'notConfigured' ? 'var(--text-secondary)' :
                        'var(--danger)',
                      border: '1px solid currentColor'
                    }}>
                      {waStatus === 'authorized' ? 'CONECTADO / ONLINE' :
                       waStatus === 'notAuthorized' ? 'DESCONECTADO / REFIERE QR' :
                       waStatus === 'notConfigured' ? 'SIN CONFIGURAR' :
                       `ERROR DE CONEXIÓN (${waStatus.toUpperCase()})`}
                    </div>

                    {/* QR Code Container */}
                    {waStatus === 'notAuthorized' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                          Escaneá este código QR desde tu celular (WhatsApp: Dispositivos Vinculados) para activar los mensajes automáticos:
                        </p>
                        
                        {isFetchingQR ? (
                          <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px' }}>
                            <RefreshCw size={24} className="spin-animation" style={{ color: '#000' }} />
                          </div>
                        ) : qrCodeData ? (
                          <div style={{ padding: '10px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                            <img 
                              src={`data:image/png;base64,${qrCodeData}`} 
                              alt="Código QR de WhatsApp" 
                              style={{ width: '180px', height: '180px', display: 'block' }}
                            />
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>No se pudo cargar el código QR. Intentá refrescar.</p>
                        )}
                      </div>
                    )}

                    {waStatus === 'authorized' && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', marginTop: '1rem' }}>
                        ¡Tu número de WhatsApp está vinculado con éxito! Los ciudadanos recibirán notificaciones al enviar reclamos y al actualizar sus estados.
                      </p>
                    )}

                    <button 
                      type="button" 
                      onClick={checkWhatsAppStatus}
                      className="btn btn-secondary"
                      style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                    >
                      <RefreshCw size={14} /> Actualizar Estado
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX FOR PHOTOS */}
        {selectedPhoto && (
          <div className="modal-overlay" style={{ zIndex: 11000 }} onClick={() => setSelectedPhoto(null)}>
            <div className="lightbox-content animate-zoom-in" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedPhoto(null)}
                style={{ top: '-40px', right: '0', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >✕</button>
              <img src={selectedPhoto} alt="Evidencia Ampliada" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            </div>
          </div>
        )}

      <style dangerouslySetInnerHTML={{__html: `
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1.5rem;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--overlay-light);
          border: 1px solid var(--overlay-medium);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          z-index: 10;
          outline: none;
        }

        .modal-close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--danger);
          transform: rotate(90deg);
        }

        .admin-dashboard-section {
          padding: 3.5rem 0;
        }

        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-radius: 20px;
          margin-bottom: 2.5rem;
          border: 1px solid rgba(116, 59, 188, 0.15);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .admin-title-info h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0.3rem 0;
          color: var(--text-primary);
        }

        .admin-title-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .logout-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.85rem;
          border-radius: 10px;
        }

        /* KPIs Grid */
        .admin-kpis-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .kpi-card {
          text-align: center;
          padding: 1.75rem 1rem;
          background: var(--glass-bg) !important;
          border: 1px solid var(--overlay-light);
        }

        .kpi-num {
          display: block;
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.3rem;
        }

        .kpi-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Controls */
        .table-controls {
          padding: 1.5rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .filters-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Table Wrapper & Table */
        .admin-table-wrapper {
          border-radius: 20px;
          border: 1px solid var(--overlay-medium);
          overflow-x: auto;
          background: var(--glass-bg) !important;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 100%;
        }

        .admin-table th {
          padding: 1rem 1rem;
          border-bottom: 1.5px solid var(--overlay-medium);
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--overlay-light);
        }

        .admin-table td {
          padding: 1rem 1rem;
          border-bottom: 1px solid var(--overlay-light);
          font-size: 0.85rem;
          color: var(--text-secondary);
          vertical-align: middle;
        }

        .admin-table .badge {
          border-radius: 6px !important;
          padding: 0.35rem 0.7rem !important;
          font-size: 0.75rem !important;
          line-height: 1.2 !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          white-space: normal;
        }

        .table-row-item {
          transition: background 0.2s ease;
        }

        .table-row-item:hover {
          background: rgba(116, 59, 188, 0.04);
        }

        .td-date .date-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .font-display-bold {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-primary);
        }

        .td-loc .location-text-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }

        .loc-icon {
          color: var(--secondary);
          flex-shrink: 0;
        }

        .btn-table-action {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .empty-table-card {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-table-card h4 {
          font-size: 1.2rem;
          margin-bottom: 0.4rem;
        }

        .empty-table-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        /* Adaptive Admin Badges */
        .admin-badge-recibido {
          background: rgba(116, 59, 188, 0.1);
          color: var(--primary);
          border: 1px solid rgba(116, 59, 188, 0.3);
        }
        .admin-badge-presentado {
          background: rgba(217, 160, 36, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(217, 160, 36, 0.3);
        }
        .admin-badge-comision {
          background: rgba(239, 140, 34, 0.1);
          color: #ef8c22;
          border: 1px solid rgba(239, 140, 34, 0.3);
        }
        .admin-badge-votacion {
          background: rgba(147, 51, 234, 0.1);
          color: #9333ea;
          border: 1px solid rgba(147, 51, 234, 0.3);
        }
        .admin-badge-aprobado {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .admin-badge-publicado {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
        }
        .admin-badge-oculto {
          background: var(--overlay-medium);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
        }
        
        .td-cat .badge {
          background: var(--primary) !important;
          color: #ffffff !important;
          border: none !important;
          font-weight: 600;
          box-shadow: 0 2px 5px rgba(116, 59, 188, 0.2);
        }

        /* Drawer CSS */
        .admin-drawer {
          width: 95%;
          max-width: 900px !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border-color) !important;
          box-shadow: var(--shadow-lg) !important;
          border-radius: 20px;
          padding: 1.5rem;
          box-sizing: border-box;
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          color: var(--text-primary) !important;
        }

        @media (min-width: 600px) {
          .admin-drawer {
            padding: 2.25rem;
          }
        }

        .admin-drawer h3 {
          color: var(--text-primary) !important;
        }

        .drawer-subtitle-id {
          font-family: var(--font-display);
          font-size: 0.82rem;
          color: var(--text-secondary) !important;
          font-weight: 600;
          margin-top: -0.25rem;
          margin-bottom: 1.5rem;
          word-break: break-word;
        }

        .drawer-info-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 600px) {
          .drawer-info-sections {
            display: grid !important;
            grid-template-columns: 1.1fr 0.9fr !important;
            gap: 1.5rem !important;
            align-items: start !important;
          }
          .drawer-left-col {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .drawer-right-col {
            background: var(--overlay-light) !important;
            border: 1px solid var(--overlay-medium) !important;
            padding: 1.25rem;
            border-radius: 16px;
          }
        }

        .info-block, .management-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .drawer-right-col .management-block {
          background: transparent;
          border: none;
          padding: 0;
        }

        .info-block h4, .management-block h4 {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: #d3afff !important;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .info-block p {
          font-size: 0.88rem;
          color: #b0b0b0 !important;
          margin-bottom: 0.5rem;
        }

        .whatsapp-row, .maps-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .phone-number-badge {
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .whatsapp-action-link, .maps-action-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--success);
          text-decoration: none;
          padding: 0.25rem 0.6rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .whatsapp-action-link:hover {
          background: var(--success);
          color: hsl(30 15% 4%);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }

        .maps-action-link {
          color: var(--secondary);
          background: rgba(204, 102, 20, 0.08);
          border-color: rgba(204, 102, 20, 0.2);
        }

        .maps-action-link:hover {
          background: var(--secondary);
          color: #ffffff;
          box-shadow: 0 0 10px rgba(116, 59, 188, 0.2);
        }

        /* New Clean Location Card Styles */
        .info-grid-two-cols {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .location-detail-card {
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        .loc-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
          color: var(--secondary);
          font-size: 0.88rem;
        }

        .loc-card-icon {
          color: var(--secondary);
          flex-shrink: 0;
        }

        .loc-card-address {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-weight: 500;
          margin-bottom: 0.5rem !important;
          word-break: break-word;
        }

        .maps-btn-link {
          background: rgba(116, 59, 188, 0.08) !important;
          border-color: rgba(116, 59, 188, 0.2) !important;
          color: var(--text-primary) !important;
        }

        .maps-btn-link:hover {
          background: #743bbc !important;
          color: #ffffff !important;
          box-shadow: 0 0 15px rgba(116, 59, 188, 0.3);
        }

        .desc-box {
          margin-top: 0.75rem;
          background: var(--overlay-light);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .desc-box strong {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .desc-box p {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .drawer-photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .drawer-photo-item {
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          overflow: hidden;
          padding: 0;
          border: 1px solid var(--border-color);
        }

        .photo-src-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drawer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        @media (max-width: 992px) {
          .admin-kpis-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-table-wrapper {
            border: none;
            background: transparent !important;
          }
          .admin-table {
            min-width: 100%;
            display: block;
          }
          .admin-table thead {
            display: none;
          }
          .admin-table tbody {
            display: block;
          }
          .admin-table tr {
            display: block;
            margin-bottom: 1.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.25rem 1rem;
            box-shadow: var(--shadow-lg);
          }
          .admin-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.65rem 0;
            border-bottom: 1px dashed var(--overlay-light);
            font-size: 0.88rem;
          }
          .admin-table td:last-child {
            border-bottom: none;
            padding-top: 1rem;
            justify-content: flex-end;
          }
          .admin-table td::before {
            content: attr(data-label);
            font-family: var(--font-display);
            font-weight: 700;
            color: var(--text-muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .td-loc .location-text-wrap {
            max-width: 200px;
            justify-content: flex-end;
          }
          .admin-drawer {
            padding: 1.25rem 1rem;
          }
          .drawer-subtitle-id {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 576px) {
          .admin-kpis-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .kpi-card {
            padding: 1.25rem 0.5rem;
          }
          .kpi-num {
            font-size: 1.5rem;
          }
          .kpi-label {
            font-size: 0.7rem;
          }
          .admin-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .logout-btn {
            width: 100%;
          }
        }

        .photo-zoom-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: white;
          border-radius: 8px;
        }
        .drawer-photo-item:hover .photo-zoom-overlay {
          opacity: 1;
        }
      `}} />
          </div>
        )}
      </SignedIn>
    </>
  );
}
