import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Image, Check, ChevronRight, ChevronLeft, AlertCircle, Trash2, Shield, Search } from 'lucide-react';

export default function FormularioReclamosVecinales({ onSubmitReport, onClose }) {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTrackingCode, setCreatedTrackingCode] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isLocationLocked, setIsLocationLocked] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Bloquear el scroll de fondo cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    barrio: '',
    callePrincipal: '',
    entreCalle1: '',
    entreCalle2: '',
    description: '',
    photos: [] // Almacenará objetos { name: string, preview: string }
  });

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
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            
            let street = '';
            let houseNumber = '';
            let neighborhood = 'Barrio detectado';

            result.address_components.forEach(comp => {
              if (comp.types.includes('route')) street = comp.long_name;
              if (comp.types.includes('street_number')) houseNumber = comp.long_name;
              if (comp.types.includes('neighborhood') || comp.types.includes('sublocality')) {
                neighborhood = comp.long_name;
              }
            });

            setFormData(prev => ({
              ...prev,
              barrio: neighborhood,
              callePrincipal: `${street} ${houseNumber}`.trim() || result.formatted_address
            }));
            setIsLocationLocked(true);
          } else {
            throw new Error('Google Maps API Error: ' + data.status);
          }
        } catch (error) {
          console.warn('Geocoding Error', error);
          // Fallback if API fails
          setFormData(prev => ({
            ...prev,
            barrio: 'Ubicación GPS detectada',
            callePrincipal: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }));
          setIsLocationLocked(true);
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

  // Subida de Archivos (Fotos) - Simulación con Previsualización
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addPhotos(files);
  };

  const addPhotos = async (files) => {
    if (formData.photos.length + files.length > 3) {
      setErrorMessage('Solo podés subir hasta un máximo de 3 fotos de evidencia.');
      return;
    }
    setErrorMessage('');

    try {
      const readPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, preview: reader.result });
          reader.onerror = () => reject(new Error('Error al leer el archivo'));
          reader.readAsDataURL(file);
        });
      });

      const newPhotos = await Promise.all(readPromises);
      setFormData(prev => {
        const combined = [...prev.photos, ...newPhotos].slice(0, 3);
        return { ...prev, photos: combined };
      });
    } catch (err) {
      setErrorMessage('Ocurrió un error al procesar las imágenes.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
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
      if (!formData.barrio.trim() || !formData.callePrincipal.trim()) {
        setErrorMessage('Por favor, ingresá el barrio y la calle principal.');
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
    if (!formData.category || !formData.barrio || !formData.callePrincipal) {
      setErrorMessage('Faltan completar campos obligatorios del reclamo.');
      return;
    }

    if (!isAnonymous && (!formData.name.trim() || !formData.phone.trim())) {
      setErrorMessage('Para poder informarte sobre el seguimiento, necesitamos tu nombre y teléfono. O podés seleccionar la opción de enviar de forma anónima.');
      return;
    }

    // Formatear ubicación e información para el feed del portal municipal
    const locationFormatted = `${formData.barrio} - ${formData.callePrincipal} ${formData.entreCalle1 && formData.entreCalle2 ? `(entre ${formData.entreCalle1} y ${formData.entreCalle2})` : ''}`;
    
    // Generar número de seguimiento cortito de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000);
    setCreatedTrackingCode(code);

    // El objeto para enviar al feed general
    const reportData = {
      title: `${formData.category.split(' ').slice(1).join(' ')}: Reclamo en ${formData.barrio}`,
      description: formData.description.trim() ? formData.description : `Pedido de inspección y resolución inmediata para el problema de ${formData.category.toLowerCase()}.`,
      category: formData.category.split(': ')[0].substring(2), // Extrae el nombre limpio (ej: "Iluminación")
      urgency: 'medio',
      location: locationFormatted,
      coordinates: gpsCoordinates, // Se guarda lat/lng si el usuario usó GPS
      anonymousName: isAnonymous ? 'Vecino Anónimo' : formData.name,
      phone: isAnonymous ? null : formData.phone,
      photos: formData.photos,
      trackingCode: code
    };

    onSubmitReport(reportData);
    setIsSuccess(true);

    // Resetear formulario tras éxito
    setStep(1);
    setFormData({
      name: '',
      phone: '',
      category: '',
      barrio: '',
      callePrincipal: '',
      entreCalle1: '',
      entreCalle2: '',
      description: '',
      photos: []
    });
    setGpsCoordinates(null);

    setTimeout(() => {
      setIsSuccess(false);
    }, 8000); // 8 segundos para anotar el número de seguimiento
  };

  return (
    <div className="full-screen-wizard-overlay">
      <button className="wizard-close-btn" onClick={onClose} aria-label="Cerrar Formulario">✕</button>

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
          <p className="step-subtitle" style={{ fontSize: '1rem' }}>
            Se ha enviado al equipo de trabajo de Santiago Horianski. Conserva este número para auditar su estado.
          </p>
          <button className="btn btn-primary wizard-btn-next" style={{ marginTop: '2rem' }} onClick={onClose}>
            Volver al Portal
          </button>
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
                  return (
                    <div 
                      key={cat.id}
                      className={`category-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectCategory(cat.title)}
                    >
                      <span className="cat-card-title">{cat.title}</span>
                      <span className="cat-card-desc">{cat.desc}</span>
                      {isSelected && <div className="selected-badge-check"><Check size={10} /></div>}
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
              <p className="step-subtitle">Usá el GPS para darnos el punto exacto, o escribí manualmente el barrio y la calle principal abajo.</p>

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
                <div className="gps-success-badge animate-fade-in">
                  <Check size={14} style={{ color: 'var(--success)' }} />
                  <span>GPS: Lat {gpsCoordinates.lat}, Lng {gpsCoordinates.lng} (Precisión guardada)</span>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Barrio *</label>
                  {isLocationLocked && (
                    <button type="button" onClick={() => setIsLocationLocked(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      (Modificar manualmente)
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleInputChange}
                  placeholder="Ej. Villa Cabello, Itaembé Miní"
                  className={`form-input ${isLocationLocked ? 'locked-input' : ''}`}
                  readOnly={isLocationLocked}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calle principal del problema *</label>
                <input 
                  type="text" 
                  name="callePrincipal"
                  value={formData.callePrincipal}
                  onChange={handleInputChange}
                  placeholder="Ej. Avenida Tambor de Tacuarí"
                  className={`form-input ${isLocationLocked ? 'locked-input' : ''}`}
                  readOnly={isLocationLocked}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Entre calle...</label>
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
                  <label className="form-label">Y calle...</label>
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
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                />
                <label htmlFor="photo-upload-input" className="drag-drop-label">
                  <Image size={24} className="drag-icon" />
                  <span>Arrastrá tus fotos acá o <strong>hacé clic para subir</strong></span>
                  <span className="file-limit-subtitle">Formatos JPG/PNG hasta 3 archivos</span>
                </label>
              </div>

              {/* Previsualizaciones */}
              {formData.photos.length > 0 && (
                <div className="photos-preview-container">
                  {formData.photos.map((photo, idx) => (
                    <div key={idx} className="photo-preview-item">
                      <img src={photo.preview} alt={`Evidencia ${idx + 1}`} className="photo-img-src" />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePhoto(idx)} 
                        className="remove-photo-btn"
                        title="Eliminar foto"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
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
              
              <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--overlay-medium)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Quiero enviar este reclamo de forma ANÓNIMA
                  </span>
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
          <div className="wizard-progress-bar">
            <div className="progress-line-bg">
              <div className="progress-line-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            </div>
            {[1, 2, 3, 4].map(num => (
              <div 
                key={num} 
                className={`progress-step-node ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
                onClick={() => num < step && setStep(num)}
              >
                {step > num ? <Check size={12} /> : num}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn-secondary wizard-btn-next">
                <ChevronLeft size={16} /> Volver
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary wizard-btn-next">
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="btn btn-accent wizard-btn-next">
                Enviar Reclamo <Check size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Estilos locales del Wizard de Reclamos */}
      <style dangerouslySetInnerHTML={{__html: `
        .wizard-card {
          width: 100%;
          background: var(--glass-bg) !important;
          border: var(--glass-border) !important;
        }

        .wizard-progress-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin-bottom: 2.25rem;
          padding: 0 0.5rem;
        }

        .progress-line-bg {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-50%);
          z-index: 1;
        }

        .progress-line-fill {
          height: 100%;
          background: var(--gradient-primary);
          transition: width 0.3s ease;
        }

        .progress-step-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2a2a2a; /* Solid background to hide line */
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 800;
          color: #ffffff;
          position: relative;
          z-index: 2;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .progress-step-node.active {
          border-color: var(--primary);
          color: var(--primary);
          background: #1f1f1f; /* Solid dark background */
          box-shadow: 0 0 15px rgba(217, 160, 36, 0.4);
          transform: scale(1.15);
        }

        .wizard-btn-next.btn-secondary {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .wizard-btn-next.btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .progress-step-node.completed {
          background: var(--gradient-primary);
          border-color: transparent;
          color: hsl(30 15% 4%);
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
          gap: 0.6rem;
        }

        @media (min-width: 480px) {
          .category-selection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .category-item-card {
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.3rem;
          box-shadow: 0 2px 8px var(--overlay-inverted);
        }

        .category-item-card:hover {
          border-color: var(--primary);
          background: var(--overlay-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px var(--overlay-inverted);
        }

        .category-item-card.selected {
          border-color: var(--secondary);
          background: rgba(217, 160, 36, 0.08);
          box-shadow: 0 0 0 1.5px var(--secondary), 0 8px 16px rgba(217, 160, 36, 0.15);
        }

        .cat-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cat-card-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
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
          border: 1.5px dashed var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.008);
          transition: all 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .drag-drop-zone:hover {
          border-color: var(--primary);
          background: rgba(217, 160, 36, 0.02);
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
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.82rem;
          pointer-events: none;
        }

        .drag-icon {
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .file-limit-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
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
      `}} />

    </div>
  );
}
