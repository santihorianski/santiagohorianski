import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Eye, Edit3, Filter, MapPin } from 'lucide-react';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  rojo: createColoredIcon('red'),       // Calles y Asfalto / Infraestructura
  naranja: createColoredIcon('orange'), // Iluminación
  verde: createColoredIcon('green'),     // Espacios Verdes
  azul: createColoredIcon('blue'),       // Seguridad
  violeta: createColoredIcon('violet'),  // Residuos / Limpieza
  amarillo: createColoredIcon('yellow'), // Tránsito
  gris: createColoredIcon('grey')        // Otros
};

const getCategoryIcon = (category) => {
  if (!category) return icons.gris;
  const cat = category.toLowerCase();
  if (cat.includes('calles') || cat.includes('asfalto')) return icons.rojo;
  if (cat.includes('iluminación') || cat.includes('foco')) return icons.naranja;
  if (cat.includes('verde') || cat.includes('maleza') || cat.includes('poda')) return icons.verde;
  if (cat.includes('seguridad') || cat.includes('policía')) return icons.azul;
  if (cat.includes('residuos') || cat.includes('basura') || cat.includes('limpieza')) return icons.violeta;
  if (cat.includes('tránsito') || cat.includes('semáforo')) return icons.amarillo;
  return icons.gris;
};

// Coordenadas centrales de Posadas
const POSADAS_CENTER = [-27.36708, -55.89608];
const POSADAS_BOUNDS = [
  [-27.5500, -56.0500],
  [-27.3000, -55.8000]
];

export default function AdminMap({ reports, onOpenDetail }) {
  // Filtros internos del mapa
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Mapeo de estados para visualización de pills
  const statusLabels = {
    recibido: { text: 'Recibido', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
    presentado: { text: 'Presentado', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    en_comision: { text: 'En Comisión', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    en_votacion: { text: 'En Votación', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    aprobado: { text: 'Aprobado', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
  };

  // Procesamiento y geocodificación ficticia si no tiene coordenadas de GPS
  const processedReports = useMemo(() => {
    return reports.map((report, index) => {
      let lat = POSADAS_CENTER[0];
      let lng = POSADAS_CENTER[1];

      if (report.gpsLat && report.gpsLng) {
        lat = Number(report.gpsLat);
        lng = Number(report.gpsLng);
      } else {
        // Generar offset estático basado en el index para que no salten en cada render
        const pseudoRandom1 = (Math.sin(index + 1) * 10000) % 1;
        const pseudoRandom2 = (Math.cos(index + 1) * 10000) % 1;
        const latOffset = (pseudoRandom1 - 0.5) * 0.04;
        const lngOffset = (pseudoRandom2 - 0.5) * 0.04;
        lat = POSADAS_CENTER[0] + latOffset;
        lng = POSADAS_CENTER[1] + lngOffset;
      }

      return {
        ...report,
        lat,
        lng
      };
    });
  }, [reports]);

  // Filtrado de reportes
  const filteredReports = useMemo(() => {
    return processedReports.filter(rep => {
      const matchCat = filterCategory === 'Todas' || rep.category === filterCategory;
      const matchStatus = filterStatus === 'Todos' || rep.status === filterStatus;
      return matchCat && matchStatus;
    });
  }, [processedReports, filterCategory, filterStatus]);

  const categories = ['Todas', '🌿 Espacios Verdes', '🧹 Limpieza', '🕳️ Calles y Asfalto', '💡 Iluminación', '🗑️ Residuos', '🚦 Tránsito', 'Otros'];
  const statuses = ['Todos', 'recibido', 'presentado', 'en_comision', 'en_votacion', 'aprobado'];

  return (
    <div className="relative w-full h-full flex flex-col font-sans" style={{ minHeight: '450px' }}>
      
      {/* Botón flotante de Filtros */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-2 right-2 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs border border-slate-700 shadow-lg hover:bg-slate-800 transition"
      >
        <Filter size={14} />
        Filtros {filterCategory !== 'Todas' || filterStatus !== 'Todos' ? '(Activos)' : ''}
      </button>

      {/* Panel flotante de Filtros */}
      {showFilters && (
        <div className="absolute top-12 right-2 z-[1000] p-4 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl text-white text-xs w-64 animate-fade-in flex flex-col gap-3">
          <h4 className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
            <Filter size={12} /> Filtrar en Mapa
          </h4>
          
          <div>
            <label className="text-slate-400 block mb-1">Categoría</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Estado de Gestión</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 outline-none"
            >
              {statuses.map(st => (
                <option key={st} value={st}>
                  {st === 'Todos' ? 'Todos' : statusLabels[st]?.text || st}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 text-[10px] mt-1">
            Mostrando <strong>{filteredReports.length}</strong> de {processedReports.length} reclamos.
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="w-full h-full flex-1 rounded-xl overflow-hidden relative">
        <MapContainer 
          center={POSADAS_CENTER} 
          zoom={13} 
          minZoom={12}
          maxBounds={POSADAS_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={45}
            spiderfyOnMaxZoom={true}
          >
            {filteredReports.map((report, idx) => {
              const statusInfo = statusLabels[report.status] || { text: report.status, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
              return (
                <Marker 
                  key={report.id || idx} 
                  position={[report.lat, report.lng]}
                  icon={getCategoryIcon(report.category)}
                >
                  <Popup>
                    <div className="font-sans text-slate-800 w-64 p-0.5">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <strong className="block text-slate-900 text-sm font-bold leading-tight flex-1">
                          {report.title}
                        </strong>
                        <span 
                          style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0"
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center text-xs text-slate-500 mb-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                          {report.category || 'Reclamo'}
                        </span>
                        <span className="font-mono">#{report.trackingCode || '----'}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-2.5">
                        <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <span>{report.location}</span>
                      </div>

                      {/* Vista previa de foto si existe */}
                      {report.photos && report.photos.length > 0 && (
                        <div className="mb-2.5 w-full h-20 rounded-lg overflow-hidden border border-slate-200">
                          <img 
                            src={report.photos[0].preview} 
                            alt="Previsualización" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 mb-3 max-h-16 overflow-y-auto">
                        "{report.description || 'Sin descripción adicional.'}"
                      </p>

                      {onOpenDetail && (
                        <button 
                          onClick={() => onOpenDetail(report)}
                          className="w-full py-1.5 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition"
                        >
                          <Edit3 size={12} />
                          Gestionar Reclamo
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Leyenda e Indicadores */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 border-t border-slate-800/20 pt-3">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 block shrink-0"></span> Calles y Asfalto</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 block shrink-0"></span> Iluminación</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 block shrink-0"></span> Espacios Verdes</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shrink-0"></span> Seguridad</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shrink-0"></span> Limpieza / Residuos</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block shrink-0"></span> Tránsito</div>
      </div>
    </div>
  );
}
