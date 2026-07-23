import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Image, Check, ChevronRight, ChevronLeft, ChevronDown, AlertCircle, Trash2, Shield, Search, FileText, Mail, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { uploadFileToR2, isR2Configured } from '../r2Client';

export default function FormularioReclamosVecinales({ onSubmitReport, onClose }) {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTrackingCode, setCreatedTrackingCode] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // 'gps' | 'google' | null
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isLocationLocked, setIsLocationLocked] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // PDF Receipt Generation States & Methods
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const handleDownloadReceipt = async () => {
    try {
      setIsGeneratingReceipt(true);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [217, 160, 36]; 
      const darkColor = [15, 23, 42]; 
      const greyColor = [100, 116, 139]; 

      pdf.setFillColor(...darkColor);
      pdf.rect(0, 0, 210, 45, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text("BUZON CIUDADANO", 20, 18);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text("HONORABLE CONCEJO DELIBERANTE", 20, 25);
      pdf.text("Ciudad de Posadas, Misiones", 20, 30);

      pdf.setFontSize(9);
      pdf.text("COD. DE SEGUIMIENTO", 150, 18);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text(`#${createdTrackingCode}`, 150, 28);

      pdf.setTextColor(...darkColor);
      pdf.setFontSize(16);
      pdf.text("Comprobante de Reclamo Registrado", 20, 60);

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, 190, 65);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text("Detalles de la Solicitud:", 20, 75);

      const items = [
        { label: "Categoría del Reclamo:", value: formData.category || 'No especificada' },
        { label: "Barrio:", value: formData.barrio || 'No especificado' },
        { label: "Calle Principal / Referencia:", value: formData.callePrincipal || 'No especificada' },
        { label: "Entre Calles:", value: (formData.entreCalle1 && formData.entreCalle2) ? `${formData.entreCalle1} y ${formData.entreCalle2}` : 'No especificadas' },
        { label: "Fecha de Envío:", value: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
        { label: "Estado Inicial:", value: "Recibido en el Concejo" }
      ];

      let yPos = 85;
      pdf.setFontSize(10);
      items.forEach(item => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(item.value), 75, yPos);
        yPos += 8;
      });

      yPos += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text("Descripción Adicional:", 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      
      const descText = formData.description || "Sin comentarios adicionales por el ciudadano.";
      const splitDesc = pdf.splitTextToSize(descText, 170);
      pdf.text(splitDesc, 20, yPos);
      yPos += (splitDesc.length * 5) + 10;

      const trackingUrl = `https://santiagohorianski.com/gestion?codigo=${createdTrackingCode}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;

      const addQrCode = () => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = qrUrl;
          img.onload = () => {
            pdf.addImage(img, 'PNG', 20, yPos, 35, 35);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text("Escanear para Seguir Trámite:", 62, yPos + 10);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
            pdf.setTextColor(...greyColor);
            pdf.text("Podés escanear este código QR con la cámara de tu celular", 62, yPos + 16);
            pdf.text("para abrir directamente la página de rastreo de tu reclamo.", 62, yPos + 21);
            pdf.text("Enlace directo: santiagohorianski.com/gestion", 62, yPos + 26);
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
      };

      await addQrCode();

      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, 275, 190, 275);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...greyColor);
      pdf.text("Este es un comprobante digital emitido por el Buzón Ciudadano de Posadas.", 20, 281);
      pdf.text("Trabajando juntos por un Posadas mejor y más transparente.", 20, 285);

      pdf.save(`Comprobante_Reclamo_${createdTrackingCode}.pdf`);
    } catch (error) {
      console.error("Error al generar comprobante:", error);
      alert("No se pudo generar el comprobante PDF.");
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleCloseWizard = () => {
    if (!isSuccess) {
      const confirmClose = window.confirm("¿Estás seguro de que deseas salir? Los datos del reclamo no se guardarán.");
      if (!confirmClose) return;
    }

    setFormData({
      name: '',
      phone: '',
      email: '',
      category: '',
      barrio: '',
      callePrincipal: '',
      entreCalle1: '',
      entreCalle2: '',
      description: '',
      photos: []
    });
    setGpsCoordinates(null);
    setLocationSource(null);
    setIsSuccess(false);
    onClose();
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    barrio: '',
    callePrincipal: '',
    entreCalle1: '',
    entreCalle2: '',
    description: '',
    photos: [] // Almacenará objetos { name: string, preview: string }
  });

  const [suggestions, setSuggestions] = useState([]);
  const isSuggestionSelectedRef = useRef(false);

  // Cargar script de Google Maps Places
  useEffect(() => {
    if (step !== 2) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCpqNAb7azBFU32oxAgSDCxnIFZFI_tAfA";
    const scriptId = 'google-maps-places-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [step]);

  // Obtener predicciones de Google Places programáticamente con Debounce
  useEffect(() => {
    if (step !== 2 || !formData.callePrincipal || formData.callePrincipal.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (isSuggestionSelectedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (window.google?.maps?.places) {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
          input: formData.callePrincipal,
          componentRestrictions: { country: 'ar' },
          types: ['address']
        }, (predictions, status) => {
          if (status === 'OK' && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        });
      }
    }, 300); // Debounce de 300ms para evitar múltiples llamadas innecesarias y lentitud

    return () => clearTimeout(timer);
  }, [formData.callePrincipal, step]);

  // Manejar selección de una sugerencia de calle
  const selectSuggestion = (suggestion) => {
    isSuggestionSelectedRef.current = true;
    
    if (window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          
          let street = '';
          let number = '';
          let neighborhood = '';

          result.address_components.forEach(comp => {
            if (comp.types.includes('route')) street = comp.long_name;
            if (comp.types.includes('street_number')) number = comp.long_name;
            if (comp.types.includes('neighborhood') || 
                comp.types.includes('sublocality') || 
                comp.types.includes('sublocality_level_1') || 
                comp.types.includes('sublocality_level_2') || 
                comp.types.includes('colloquial_area')) {
              neighborhood = comp.long_name;
            }
          });

          const streetAddress = `${street} ${number}`.trim() || result.formatted_address;

          setFormData(prev => ({
            ...prev,
            barrio: neighborhood || prev.barrio || '',
            callePrincipal: streetAddress
          }));

          setGpsCoordinates({
            lat: result.geometry.location.lat().toFixed(6),
            lng: result.geometry.location.lng().toFixed(6)
          });
          setLocationSource('google');
        }
      });
    }

    setSuggestions([]);
  };

  // Bloquear el scroll de fondo cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);



  const categories = [
    { id: 'verdes', title: '🌿 Espacios Verdes', desc: 'Pedido de corte de césped / Malezas altas en terreno baldío.' },
    { id: 'limpieza', title: '🧹 Limpieza', desc: 'Pedido de limpieza en la calle / Limpieza de boca de tormenta o alcantarilla.' },
    { id: 'calles', title: '🕳️ Calles y Asfalto', desc: 'Pozo peligroso / Reparación de lomo de burro.' },
    { id: 'iluminacion', title: '💡 Iluminación', desc: 'Foco roto / Cuadra a oscuras.' },
    { id: 'residuos', title: '🗑️ Residuos', desc: 'Falta contenedor de basura / Basural a cielo abierto.' },
    { id: 'transito', title: '🚦 Tránsito', desc: 'Semáforo sin funcionar / Falta señalización.' },
    { id: 'seguridad', title: '👮 Seguridad', desc: 'Pedido de mayor presencia policial en la zona.' },
    { id: 'peligro', title: '⚠️ Peligro en vía pública', desc: 'Poste inclinado / Árbol con riesgo de caída.' }
  ];

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, ''); // Solo números permitidos
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (categoryTitle) => {
    setFormData(prev => ({ ...prev, category: categoryTitle }));
    setErrorMessage('');
    
    // Auto-advance with visual delay for better interaction
    setTimeout(() => {
      setStep(2);
    }, 450);
  };

  // Geolocalización
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('La geolocalización no está soportada por tu navegador.');
      return;
    }
    setGpsLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoordinates({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
        
        try {
          // Google Maps Reverse Geocoding API
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCpqNAb7azBFU32oxAgSDCxnIFZFI_tAfA";
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            
            let street = '';
            let houseNumber = '';
            let neighborhood = '';

            result.address_components.forEach(comp => {
              if (comp.types.includes('route')) street = comp.long_name;
              if (comp.types.includes('street_number')) houseNumber = comp.long_name;
              if (comp.types.includes('neighborhood') || 
                  comp.types.includes('sublocality') || 
                  comp.types.includes('sublocality_level_1') || 
                  comp.types.includes('sublocality_level_2') || 
                  comp.types.includes('colloquial_area')) {
                neighborhood = comp.long_name;
              }
            });

            setFormData(prev => ({
              ...prev,
              barrio: neighborhood || prev.barrio || '',
              callePrincipal: `${street} ${houseNumber}`.trim() || result.formatted_address
            }));
            setLocationSource('gps');
            setIsLocationLocked(false);
          } else {
            throw new Error('Google Maps API Error: ' + data.status);
          }
        } catch (error) {
          console.warn('Geocoding Error', error);
          // Fallback if API fails
          setFormData(prev => ({
            ...prev,
            barrio: prev.barrio || '', // Keep empty
            callePrincipal: prev.callePrincipal || '' // Keep empty so they write it manually
          }));
          setIsLocationLocked(false);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.warn('GPS Error', error);
        setErrorMessage('Error al obtener GPS. Por favor, completá los datos manualmente.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Subida de Archivos (Fotos y PDFs) - Almacenamiento R2 con fallback
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addPhotos(files);
  };

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const addPhotos = async (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrorMessage('Solo se permiten imágenes (JPG/PNG/WEBP) y archivos PDF.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setErrorMessage('Los archivos no deben superar el límite de 5 MB por cada uno.');
      return;
    }

    if (formData.photos.length + files.length > 3) {
      setErrorMessage('Solo podés subir hasta un máximo de 3 archivos de evidencia en total.');
      return;
    }
    setErrorMessage('');

    try {
      if (isR2Configured) {
        setIsUploadingFile(true);
        const uploadedFiles = [];
        for (const file of files) {
          const result = await uploadFileToR2(file);
          if (result) {
            uploadedFiles.push(result);
          } else {
            throw new Error("Error al subir archivo a Cloudflare R2");
          }
        }
        setFormData(prev => {
          const combined = [...prev.photos, ...uploadedFiles].slice(0, 3);
          return { ...prev, photos: combined };
        });
      } else {
        // Fallback local: Carga Base64
        const readPromises = files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ 
              name: file.name, 
              preview: reader.result,
              type: file.type 
            });
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
          });
        });

        const newPhotos = await Promise.all(readPromises);
        setFormData(prev => {
          const combined = [...prev.photos, ...newPhotos].slice(0, 3);
          return { ...prev, photos: combined };
        });
      }
    } catch (err) {
      console.error("Error al procesar archivos:", err);
      setErrorMessage('Ocurrió un error al procesar y subir tus archivos de evidencia.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addPhotos(files);
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => {
      const updatedPhotos = [...prev.photos];
      updatedPhotos.splice(index, 1);
      return { ...prev, photos: updatedPhotos };
    });
  };

  // Navegación del Wizard
  const nextStep = () => {
    if (step === 1) {
      if (!formData.category) {
        setErrorMessage('Por favor, seleccioná qué tipo de problema está ocurriendo.');
        return;
      }
    } else if (step === 2) {
      if (!formData.callePrincipal.trim()) {
        setErrorMessage('Por favor, ingresá la dirección o referencia del reclamo.');
        return;
      }
    }
    setErrorMessage('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validar obligatorios
    if (!formData.category || !formData.callePrincipal) {
      setErrorMessage('Faltan completar campos obligatorios del reclamo.');
      return;
    }

    if (!isAnonymous && (!formData.name.trim() || !formData.phone.trim())) {
      setErrorMessage('Para poder informarte sobre el seguimiento, necesitamos tu nombre y teléfono. O podés seleccionar la opción de enviar de forma anónima.');
      return;
    }

    // Formatear ubicación e información para el feed del portal municipal
    const locationFormatted = `${formData.callePrincipal} ${formData.entreCalle1 && formData.entreCalle2 ? `(entre ${formData.entreCalle1} y ${formData.entreCalle2})` : ''}`;
    
    // Generar número de seguimiento cortito de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000);
    setCreatedTrackingCode(code);

    // El objeto para enviar al feed general
    const reportData = {
      title: `${formData.category.split(' ').slice(1).join(' ')}: Reclamo en ${formData.callePrincipal}`,
      description: formData.description.trim() ? formData.description : `Pedido de inspección y resolución inmediata para el problema de ${formData.category.toLowerCase()}.`,
      category: formData.category.split(': ')[0].substring(2), // Extrae el nombre limpio (ej: "Iluminación")
      urgency: 'medio',
      location: locationFormatted,
      coordinates: gpsCoordinates, // Se guarda lat/lng si el usuario usó GPS
      anonymousName: isAnonymous ? 'Vecino Anónimo' : formData.name,
      phone: isAnonymous ? null : formData.phone,
      email: isAnonymous ? null : (formData.email || null),
      photos: formData.photos,
      trackingCode: code
    };

    onSubmitReport(reportData);
    
    // Enviar correo de confirmación y/o WhatsApp si no es anónimo y proporcionó contacto
    if (!isAnonymous && (formData.email?.trim() || formData.phone?.trim())) {
      fetch('https://buzon-ciudadano-mail-api.horianskiseguros.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email ? formData.email.trim() : null,
          phone: formData.phone ? formData.phone.trim() : null,
          trackingCode: code,
          category: reportData.category,
          anonymousName: formData.name
        })
      }).catch(err => console.error("Error al enviar notificaciones:", err));
    }

    setIsSuccess(true);
    setStep(1);
  };

  return (
    <div className="full-screen-wizard-overlay">
      <button className="wizard-close-btn" onClick={handleCloseWizard} aria-label="Cerrar Formulario">✕</button>

      <div className="wizard-content-container">
      {isSuccess ? (
        <div className="wizard-step-fullscreen animate-fade-in" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div className="success-icon-ring" style={{ width: '80px', height: '80px', margin: '0 auto 2rem' }}>
            <Check size={48} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="step-title" style={{ marginBottom: '1.5rem' }}>¡Reclamo Registrado en el Concejo!</h2>
          <p className="step-subtitle" style={{ marginBottom: '2rem' }}>
            Tu código de seguimiento es: <strong style={{ color: 'var(--primary)', fontSize: '2rem', display: 'block', marginTop: '1rem', background: 'rgba(217, 160, 36, 0.12)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(217, 160, 36, 0.2)' }}>#{createdTrackingCode}</strong>
          </p>
          <p className="step-subtitle" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Se ha enviado al equipo de trabajo de Santiago Horianski. Conserva este número para auditar su estado.
          </p>
          <p className="step-subtitle" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            ¡Muchas gracias por involucrarte y confiar en este equipo para mejorar tu barrio! 💪
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary wizard-btn-next" style={{ margin: 0, padding: '0.65rem 1.5rem' }} onClick={handleCloseWizard}>
              Volver al Portal
            </button>
          </div>
        </div>
      ) : (
        <div className="wizard-body" style={{ width: '100%' }}>
          {errorMessage && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PASO 1: ¿QUÉ PASA EN TU BARRIO? */}
          {step === 1 && (
            <div className="wizard-step animate-fade-in">
              <h4 className="step-title">Paso 1: ¿Qué pasa en tu barrio?</h4>
              <p className="step-subtitle">Seleccioná una categoría específica para el problema detectado en la vía pública.</p>
              
              <div className="category-selection-grid">
                {categories.map((cat) => {
                  const isSelected = formData.category === cat.title;
                  // Extract emoji (first characters up to space) and text
                  const firstSpaceIdx = cat.title.indexOf(' ');
                  const emoji = cat.title.substring(0, firstSpaceIdx);
                  const titleText = cat.title.substring(firstSpaceIdx + 1);
                  
                  return (
                    <div 
                      key={cat.id}
                      className={`category-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectCategory(cat.title)}
                    >
                      <div className="cat-icon-container">
                        {emoji}
                      </div>
                      <div className="cat-content-container">
                        <span className="cat-card-title">
                          {titleText}
                        </span>
                        <span className="cat-card-desc">
                          {cat.desc}
                        </span>
                      </div>
                      <div className="cat-check-container">
                        <Check size={24} strokeWidth={3} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 2: UBICACIÓN EXACTA DEL RECLAMO */}
          {step === 2 && (
            <div className="wizard-step animate-fade-in">
              <h4 className="step-title">Paso 2: Ubicación Exacta del Reclamo</h4>
              <p className="step-subtitle">Usá el GPS para darnos el punto exacto, o escribí manualmente la dirección o referencia abajo.</p>

              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="btn btn-secondary btn-full-width gps-btn"
                disabled={gpsLoading}
              >
                <MapPin size={16} />
                <span>{gpsLoading ? 'Obteniendo coordenadas GPS...' : 'Usar mi ubicación actual'}</span>
              </button>

              {gpsCoordinates && (
                <>
                  <div className="gps-success-badge animate-fade-in">
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span>GPS: Lat {gpsCoordinates.lat}, Lng {gpsCoordinates.lng} (Precisión guardada)</span>
                  </div>
                  
                  <div className="map-preview-container animate-fade-in" style={{ margin: '1rem 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--overlay-medium)', position: 'relative', height: '160px', background: '#1e1b4b' }}>
                    <img 
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${gpsCoordinates.lat},${gpsCoordinates.lng}&zoom=16&size=600x300&scale=2&maptype=roadmap&markers=color:0xd9a024%7C${gpsCoordinates.lat},${gpsCoordinates.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCpqNAb7azBFU32oxAgSDCxnIFZFI_tAfA"}`}
                      alt="Vista previa de Google Maps"
                      className="static-map-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(22, 16, 34, 0.85)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={12} style={{ color: 'var(--primary)' }} />
                      <span>Ubicación detectada</span>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group" style={{ position: 'relative', marginTop: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center' }}>
                  Dirección o referencia *
                  {locationSource && formData.callePrincipal && (
                    <span className="auto-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(217, 160, 36, 0.15)', color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                      Autodetectado
                    </span>
                  )}
                </label>
                <input 
                  type="text" 
                  name="callePrincipal"
                  value={formData.callePrincipal}
                  onChange={(e) => {
                    isSuggestionSelectedRef.current = false;
                    setLocationSource(null); // Clear status if they manually edit
                    handleInputChange(e);
                  }}
                  placeholder="Ej. Villa Cabello, o 'Frente a la plaza'"
                  className="form-input"
                  required
                  autoComplete="off"
                />
                
                {suggestions.length > 0 && (
                  <div className="custom-autocomplete-dropdown glass-panel">
                    {suggestions.map((s) => (
                      <div 
                        key={s.place_id} 
                        onClick={() => selectSuggestion(s)}
                        className="autocomplete-suggestion-item"
                      >
                        <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{s.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Entre calle (opcional)</label>
                  <input 
                    type="text" 
                    name="entreCalle1"
                    value={formData.entreCalle1}
                    onChange={handleInputChange}
                    placeholder="Ej. Calle 115"
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Y calle (opcional)</label>
                  <input 
                    type="text" 
                    name="entreCalle2"
                    value={formData.entreCalle2}
                    onChange={handleInputChange}
                    placeholder="Ej. Calle 117"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: DETALLES Y EVIDENCIA */}
          {step === 3 && (
            <div className="wizard-step animate-fade-in">
              <h4 className="step-title">Paso 3: Detalles y Evidencia</h4>
              <p className="step-subtitle">Subí fotos del problema y agregá comentarios para los inspectores del Concejo.</p>

              {/* Zona Drag and Drop */}
              <div 
                className="drag-drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="photo-upload-input"
                  multiple 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                  disabled={isUploadingFile}
                />
                <label htmlFor="photo-upload-input" className="drag-drop-label">
                  <Image size={24} className="drag-icon" />
                  {isUploadingFile ? (
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Subiendo archivos a la nube...</span>
                  ) : (
                    <span>Arrastrá tus fotos o PDFs acá o <strong>hacé clic para subir</strong></span>
                  )}
                  <span className="file-limit-subtitle">Imágenes o PDFs (Máx. 3 archivos en total, hasta 5 MB c/u)</span>
                </label>
              </div>

              {/* Previsualizaciones */}
              {formData.photos.length > 0 && (
                <div className="photos-preview-container">
                  {formData.photos.map((photo, idx) => {
                    const isPdf = photo.type === 'application/pdf' || photo.preview?.startsWith('data:application/pdf') || photo.name?.toLowerCase().endsWith('.pdf');
                    return (
                      <div key={idx} className="photo-preview-item" style={{ position: 'relative' }}>
                        {isPdf ? (
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            textAlign: 'center',
                            overflow: 'hidden'
                          }}>
                            <FileText size={24} style={{ color: 'var(--danger)', marginBottom: '4px' }} />
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
                              {photo.name || 'documento.pdf'}
                            </span>
                          </div>
                        ) : (
                          <img src={photo.preview} alt={`Evidencia ${idx + 1}`} className="photo-img-src" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => handleRemovePhoto(idx)} 
                          className="remove-photo-btn"
                          title="Eliminar archivo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Breve descripción adicional (opcional)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ej. El pozo se formó por una pérdida de agua subterránea. El tránsito de colectivos lo hace más peligroso..."
                  className="form-textarea"
                ></textarea>
              </div>
            </div>
          )}

          {/* PASO 4: DATOS DE CONTACTO */}
          {step === 4 && (
            <div className="wizard-step animate-fade-in">
              <h4 className="step-title">Paso 4: Notificaciones y Seguimiento</h4>
              <p className="step-subtitle">Para que podamos informarte con certeza sobre el avance de tu solicitud, necesitamos tus datos de contacto.</p>
              
              <div className={`anonymous-checkbox-card ${isAnonymous ? 'active' : ''}`}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-title">Enviar de forma ANÓNIMA</span>
                    <span className="checkbox-desc">No guardaremos tu nombre ni número de teléfono.</span>
                  </div>
                </label>
              </div>

              {!isAnonymous ? (
                <>
                  <div className="form-group animate-fade-in">
                    <label className="form-label">Nombre y Apellido *</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej. Santiago Horianski"
                        className="form-input padding-left-icon"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group animate-fade-in">
                    <label className="form-label">Teléfono WhatsApp *</label>
                    <div className="input-with-icon">
                      <Phone size={16} className="input-icon" />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ej. 3764-123456"
                        className="form-input padding-left-icon"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group animate-fade-in">
                    <label className="form-label">Correo Electrónico (Opcional - Para recibir código de seguimiento)</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ej. vecino@correo.com"
                        className="form-input padding-left-icon"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="disclaimer-text animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <AlertCircle size={18} />
                  <span><strong>Aviso:</strong> El equipo del Concejo registrará el reclamo para estar al tanto, pero al ser anónimo, será imposible enviarte información certera o notificaciones sobre el seguimiento y estado del mismo.</span>
                </div>
              )}

              <div className="disclaimer-text" style={{ marginTop: '1.5rem' }}>
                <Shield size={12} />
                <span>Tu información de contacto se procesará de forma segura y confidencial.</span>
              </div>


            </div>
          )}

        </div>
      )}
      </div>

      {/* FIXED BOTTOM BAR WIZARD */}
      {!isSuccess && (
        <div className="wizard-bottom-bar">
          {step === 1 && (
            <div className="scroll-indicator" style={{ opacity: 1, fontWeight: 'bold', color: 'var(--success)', textShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Deslizá para ver más opciones</span>
              <ChevronDown size={24} />
            </div>
          )}
          
          <div className="wizard-progress-bar">
            <div className="progress-line-bg">
              <div className="progress-line-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            </div>
            {[
              { num: 1, label: 'Problema', icon: <FileText size={18} /> },
              { num: 2, label: 'Lugar', icon: <MapPin size={18} /> },
              { num: 3, label: 'Pruebas', icon: <Image size={18} /> },
              { num: 4, label: 'Contacto', icon: <User size={18} /> }
            ].map(item => (
              <div key={item.num} className="progress-step-wrapper">
                <div 
                  className={`progress-step-node ${step === item.num ? 'active' : ''} ${step > item.num ? 'completed' : ''}`}
                  onClick={() => item.num < step && setStep(item.num)}
                >
                  {step > item.num ? <Check size={20} /> : item.icon}
                </div>
                <span className={`progress-step-label ${step === item.num ? 'active-label' : ''}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            {step === 4 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(217,160,36,0.1)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(217,160,36,0.3)' }}>
                <input 
                  type="checkbox" 
                  id="bottom-terms-checkbox" 
                  checked={acceptedTerms} 
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="bottom-terms-checkbox" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0, fontWeight: '700' }}>
                  Acepto los <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: 'var(--primary)', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', fontWeight: '900' }}>Términos y Condiciones</button>
                </label>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', width: '100%', flexDirection: 'row' }}>
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-secondary wizard-btn-next" style={{ flex: '0 0 auto' }}>
                  <ChevronLeft size={16} /> Volver
                </button>
              )}
              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="btn btn-primary wizard-btn-next"
                  disabled={isUploadingFile}
                  style={{ opacity: isUploadingFile ? 0.7 : 1, cursor: isUploadingFile ? 'not-allowed' : 'pointer', flex: 1 }}
                >
                  {isUploadingFile ? 'Cargando archivo...' : <>Siguiente <ChevronRight size={16} /></>}
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary wizard-btn-next"
                  onClick={handleSubmit}
                  disabled={isUploadingFile || !acceptedTerms}
                  style={{ opacity: (!acceptedTerms || isUploadingFile) ? 0.6 : 1, cursor: (!acceptedTerms || isUploadingFile) ? 'not-allowed' : 'pointer', flex: 1 }}
                >
                  {isUploadingFile ? 'Cargando...' : <>Enviar Reclamo <Check size={16} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estilos locales del Wizard de Reclamos */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', borderRadius: '16px', position: 'relative' }}>
            <button onClick={() => setShowTermsModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Términos y Condiciones</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>Al utilizar el Buzón Ciudadano y enviar este formulario, usted acepta los siguientes términos y condiciones básicos:</p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Carácter público de la información:</strong> Al generar un reclamo, usted comprende y acepta que la información provista (fotos, descripción, ubicación) adquirirá <strong>estado público</strong>. Dicha información será utilizada para crear un proyecto legislativo oficial dirigido a la Municipalidad de Posadas, el cual podrá ser impreso, tratado en sesiones públicas o difundido por medios de comunicación.</li>
                <li><strong>Tratamiento de datos personales:</strong> Sus datos de contacto (si los provee) serán utilizados para notificarle sobre el avance de su reclamo. Si seleccionó "Denuncia Anónima", sus datos personales serán ofuscados en la plataforma, pero la descripción del problema y fotos seguirán siendo de dominio público.</li>
                <li><strong>Veracidad de la información:</strong> Usted declara que la información proporcionada es veraz y corresponde a un hecho real en el municipio de Posadas.</li>
                <li><strong>Uso de la plataforma:</strong> Esta plataforma es una herramienta de intermediación legislativa. El equipo del Concejal se compromete a gestionar los pedidos, pero la ejecución final de obras depende del Ejecutivo municipal.</li>
              </ul>
              <p>Al marcar la casilla, usted da su consentimiento expreso para el tratamiento de los datos conforme a la normativa vigente.</p>
            </div>
            <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .wizard-card {
          width: 100%;
          background: var(--glass-bg) !important;
          border: var(--glass-border) !important;
        }

        .wizard-progress-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
        }

        .progress-step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          z-index: 2;
          width: 70px;
        }

        .progress-step-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          text-align: center;
        }

        .progress-step-label.active-label {
          color: var(--primary);
          text-shadow: 0 0 10px rgba(217, 160, 36, 0.4);
        }

        .progress-line-bg {
          position: absolute;
          top: 22px;
          left: 35px;
          right: 35px;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          z-index: 1;
        }

        .progress-line-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 4px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(217, 160, 36, 0.4);
        }

        .progress-step-node {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .progress-step-node:hover {
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .progress-step-node.active {
          border-color: var(--primary);
          color: var(--bg-card-elevated);
          background: var(--gradient-primary);
          box-shadow: 0 0 20px rgba(217, 160, 36, 0.4), inset 0 2px 4px rgba(255,255,255,0.4);
          transform: scale(1.15);
        }

        .wizard-btn-next.btn-secondary {
          background: var(--bg-card-elevated) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
          backdrop-filter: blur(10px);
        }

        .wizard-btn-next.btn-secondary:hover {
          background: var(--bg-card) !important;
          border-color: var(--text-muted) !important;
        }

        .progress-step-node.completed {
          background: var(--success);
          border-color: transparent;
          color: white;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        .step-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
          color: var(--text-primary);
        }

        .step-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 1.5rem;
        }

        .input-with-icon {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary);
        }

        .padding-left-icon {
          padding-left: 2.5rem !important;
        }

        /* Paso 2: Selección visual de categoría */
        .category-selection-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .category-selection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .category-item-card {
          padding: 1.25rem 1rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: 20px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .category-item-card:hover {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.04);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(217, 160, 36, 0.15);
        }

        .category-item-card.selected {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.1);
          box-shadow: 0 8px 24px rgba(217, 160, 36, 0.2);
          transform: scale(1.02);
        }

        .cat-icon-container {
          font-size: 2.2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(150, 150, 150, 0.1);
          border-radius: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .category-item-card.selected .cat-icon-container {
          background: var(--primary);
          filter: drop-shadow(0 4px 8px rgba(217, 160, 36, 0.4));
        }

        .cat-content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cat-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .category-item-card.selected .cat-card-title {
          color: var(--primary);
        }

        .cat-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .cat-check-container {
          width: 32px;
          display: flex;
          justify-content: flex-end;
          color: transparent;
          transition: all 0.3s ease;
        }

        .category-item-card.selected .cat-check-container {
          color: var(--primary);
          transform: scale(1.1);
        }

        .selected-badge-check {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 18px;
          height: 18px;
          background: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        /* Paso 3: Ubicación y GPS */
        .locked-input {
          background: rgba(255, 255, 255, 0.05) !important;
          color: var(--text-muted) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .gps-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.015);
          border: 1px solid var(--border-color);
          padding: 0.65rem;
          font-size: 0.88rem;
        }

        .gps-btn:hover {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.04);
        }

        .gps-success-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          font-size: 0.78rem;
          color: var(--success);
          margin-top: 0.6rem;
        }

        /* Paso 4: Drag and Drop */
        .drag-drop-zone {
          border: 2px dashed var(--primary);
          border-radius: 20px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          background: rgba(217, 160, 36, 0.05);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
          cursor: pointer;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
        }

        .drag-drop-zone:hover, .drag-drop-zone:focus-within {
          border-color: var(--secondary);
          background: rgba(217, 160, 36, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217, 160, 36, 0.15);
        }

        .hidden-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 5;
        }

        .drag-drop-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          color: var(--text-primary);
          font-size: 1.05rem;
          pointer-events: none;
        }

        .drag-icon {
          color: var(--primary);
          margin-bottom: 0.5rem;
          transform: scale(1.5);
        }

        .file-limit-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 80%;
          line-height: 1.4;
        }

        .anonymous-checkbox-card {
          margin-bottom: 1.5rem;
          padding: 1.25rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .anonymous-checkbox-card.active {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.1);
          box-shadow: 0 8px 24px rgba(217, 160, 36, 0.15);
        }

        .anonymous-checkbox-card label {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          margin: 0;
        }

        .custom-checkbox {
          width: 24px;
          height: 24px;
          accent-color: var(--primary);
          flex-shrink: 0;
          cursor: pointer;
        }

        .checkbox-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .checkbox-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .anonymous-checkbox-card.active .checkbox-title {
          color: var(--primary);
        }

        .checkbox-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .photos-preview-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .photo-preview-item {
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          overflow: hidden;
          padding: 0;
          position: relative;
          border: 1px solid var(--border-color);
        }

        .photo-img-src {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-photo-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--glass-bg);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--danger);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .remove-photo-btn:hover {
          background: var(--danger);
          color: white;
          transform: scale(1.1);
        }

        .disclaimer-text {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 1rem;
        }

        /* Navegación */
        .wizard-navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2rem;
          border-top: 1px solid var(--overlay-light);
          padding-top: 1.25rem;
        }

        .btn-wizard-nav {
          flex: 1;
          padding: 0.7rem;
          font-size: 0.88rem;
          border-radius: 10px;
        }

        @media (max-width: 480px) {
          .wizard-card {
            padding: 1rem !important;
          }
          .wizard-progress-bar {
            margin-bottom: 1.5rem;
          }
          .step-title {
            font-size: 1rem;
          }
          .step-subtitle {
            font-size: 0.72rem;
            margin-bottom: 1rem;
          }
          .category-item-card {
            padding: 0.65rem 0.8rem;
          }
          .cat-card-title {
            font-size: 0.8rem;
          }
          .cat-card-desc {
            font-size: 0.68rem;
          }
          .drag-drop-zone {
            padding: 1.1rem 0.85rem;
          }
          .drag-drop-label {
            font-size: 0.75rem;
          }
          .wizard-navigation-buttons {
            margin-top: 1.25rem;
            padding-top: 0.85rem;
          }
          .btn-wizard-nav {
            padding: 0.6rem;
            font-size: 0.82rem;
          }
        }

        /* Estilos personalizados para el autocompletado en cascada */
        .custom-autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--bg-card-elevated) !important;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-top: 0.4rem;
          max-height: 220px;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .autocomplete-suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          font-size: 0.88rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          text-align: left;
        }
        
        .autocomplete-suggestion-item:last-child {
          border-bottom: none;
        }
        
        .autocomplete-suggestion-item:hover {
          background: rgba(217, 160, 36, 0.15);
          color: var(--primary);
        }
      `}} />

    </div>
  );
}
