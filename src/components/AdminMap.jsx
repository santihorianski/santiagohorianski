import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Eye, Edit3, Filter, MapPin, Layers } from 'lucide-react';

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const heat = L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 15 }).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);
  return null;
}


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
  const [mapMode, setMapMode] = useState('markers'); // 'markers' | 'heatmap'

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
      
      {/* Botones Flotantes Superiores */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-3">
        <button 
          onClick={() => setMapMode(mapMode === 'markers' ? 'heatmap' : 'markers')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 text-sm font-semibold border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white transition-all duration-300 hover:scale-105"
          title="Alternar Modo de Mapa"
        >
          <Layers size={16} className={mapMode === 'heatmap' ? 'text-indigo-600' : 'text-slate-500'} />
          {mapMode === 'markers' ? 'Ver Mapa de Calor' : 'Ver Marcadores'}
        </button>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md text-sm font-semibold border shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-105 ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/90 border-white/50 text-slate-700 hover:bg-white'}`}
        >
          <Filter size={16} />
          Filtros {filterCategory !== 'Todas' || filterStatus !== 'Todos' ? <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 absolute -top-1 -right-1 shadow-sm border border-white border-2"></span> : ''}
        </button>
      </div>

      {/* Panel flotante de Filtros */}
      {showFilters && (
        <div className="absolute top-16 right-4 z-[1000] p-5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.15)] text-slate-700 text-sm w-72 animate-fade-in flex flex-col gap-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2 text-base">
            <Filter size={16} className="text-indigo-600" /> Filtrar Reclamos
          </h4>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-medium text-xs uppercase tracking-wider">Categoría</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-slate-50 font-medium"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado de Gestión</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-slate-50 font-medium"
            >
              {statuses.map(st => (
                <option key={st} value={st}>
                  {st === 'Todos' ? 'Todos los Estados' : statusLabels[st]?.text || st}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 text-xs mt-2 bg-slate-100/50 p-3 rounded-xl border border-slate-100 flex justify-between items-center font-medium">
            <span>Resultados de Búsqueda:</span>
            <strong className="text-indigo-600 text-base">{filteredReports.length}</strong>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="w-full h-full flex-1 rounded-2xl overflow-hidden relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-slate-200">
        <MapContainer 
          center={POSADAS_CENTER} 
          zoom={13} 
          minZoom={12}
          maxBounds={POSADAS_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {mapMode === 'markers' ? (
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
                  <Popup className="premium-popup">
                    <div className="font-sans text-slate-800 w-[280px] p-1 flex flex-col gap-3">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start gap-3">
                        <strong className="block text-slate-800 text-[15px] font-extrabold leading-tight flex-1" style={{ letterSpacing: '-0.01em' }}>
                          {report.title}
                        </strong>
                        <span 
                          style={{ color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.color}30` }}
                          className="text-[10px] px-2 py-1 rounded-full font-bold uppercase shrink-0 shadow-sm"
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex gap-2 items-center text-[11px] font-medium text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700 border border-slate-200 shadow-sm">
                          {report.category || 'Reclamo'}
                        </span>
                        <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                          ID: <span className="font-mono text-slate-700">#{report.trackingCode || report.id}</span>
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{report.location}</span>
                      </div>

                      {/* Vista previa de foto si existe */}
                      {report.photos && report.photos.length > 0 && (
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                          <img 
                            src={report.photos[0].preview} 
                            alt="Previsualización" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}

                      <p className="text-sm text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 max-h-24 overflow-y-auto leading-relaxed italic">
                        "{report.description || 'Sin descripción adicional.'}"
                      </p>

                      {onOpenDetail && (
                        <button 
                          onClick={() => onOpenDetail(report)}
                          className="w-full mt-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <Edit3 size={16} />
                          Gestionar Reclamo
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
          ) : (
            <HeatmapLayer points={filteredReports.map(rep => [rep.lat, rep.lng, 1])} />
          )}
        </MapContainer>

        {/* Leyenda Flotante (Glassmorphism) */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 animate-fade-in hidden sm:block">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={12} className="text-indigo-600"/> Leyenda de Categorías</h5>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #fca5a5, #ef4444)' }}></span> Calles y Asfalto</div>
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #fdba74, #f97316)' }}></span> Iluminación</div>
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #86efac, #22c55e)' }}></span> Espacios Verdes</div>
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #93c5fd, #3b82f6)' }}></span> Seguridad</div>
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #d8b4fe, #a855f7)' }}></span> Residuos</div>
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default"><span className="w-3 h-3 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #fde047, #eab308)' }}></span> Tránsito</div>
          </div>
        </div>
      </div>
    </div>
  );
}
