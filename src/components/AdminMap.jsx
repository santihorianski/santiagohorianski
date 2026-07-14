import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  rojo: createColoredIcon('red'),
  azul: createColoredIcon('blue'),
  verde: createColoredIcon('green'),
  naranja: createColoredIcon('orange'),
  gris: createColoredIcon('grey'),
  violeta: createColoredIcon('violet')
};

const getCategoryIcon = (category) => {
  if (!category) return icons.gris;
  const cat = category.toLowerCase();
  if (cat.includes('calles') || cat.includes('bache') || cat.includes('tránsito') || cat.includes('peligro')) return icons.rojo;
  if (cat.includes('verde') || cat.includes('maleza')) return icons.verde;
  if (cat.includes('iluminación') || cat.includes('luz')) return icons.naranja;
  if (cat.includes('seguridad') || cat.includes('policía')) return icons.azul;
  if (cat.includes('limpieza') || cat.includes('basura') || cat.includes('residuos')) return icons.violeta;
  return icons.gris;
};

// Coordenadas centrales de Posadas
const POSADAS_CENTER = [-27.36708, -55.89608];
// Límites de Posadas y Garupá
const POSADAS_BOUNDS = [
  [-27.5500, -56.0500], // Suroeste (Más abajo y a la izquierda de Posadas/Garupá)
  [-27.3000, -55.8000]  // Noreste (Arriba y a la derecha del Río Paraná)
];

export default function AdminMap({ reports }) {
  // Simulador de geocodificación: Asigna coordenadas aleatorias cerca del centro si no tiene GPS
  const processedReports = useMemo(() => {
    return reports.map((report, index) => {
      if (report.coordinates && report.coordinates.lat && report.coordinates.lng) {
        return { ...report, lat: report.coordinates.lat, lng: report.coordinates.lng };
      } else {
        // Generar coordenadas estáticas basadas en el ID o index para que no salten en cada render
        const pseudoRandom1 = (Math.sin(index + 1) * 10000) % 1;
        const pseudoRandom2 = (Math.cos(index + 1) * 10000) % 1;
        const latOffset = (pseudoRandom1 - 0.5) * 0.05;
        const lngOffset = (pseudoRandom2 - 0.5) * 0.05;
        return {
          ...report,
          lat: POSADAS_CENTER[0] + latOffset,
          lng: POSADAS_CENTER[1] + lngOffset
        };
      }
    });
  }, [reports]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">Mapa Analítico de Reclamos</h2>
        <p className="text-sm text-slate-500">Visualización geográfica con agrupación inteligente (Clustering) de zonas críticas.</p>
      </div>
      
      <div style={{ height: '500px', width: '100%', zIndex: 0 }} className="rounded-lg overflow-hidden border border-slate-300 relative">
        <MapContainer 
          center={POSADAS_CENTER} 
          zoom={13} 
          minZoom={12}
          maxBounds={POSADAS_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
          >
            {processedReports.map((report, idx) => (
              <Marker 
                key={report.id || idx} 
                position={[report.lat, report.lng]}
                icon={getCategoryIcon(report.category)}
              >
                <Popup>
                  <div className="font-sans">
                    <strong className="block text-slate-800 mb-1">{report.title}</strong>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full text-slate-600 block w-max mb-2">
                      {report.category || 'Reclamo'}
                    </span>
                    <p className="text-sm text-slate-600 mb-2">📍 {report.location}</p>
                    <p className="text-xs text-slate-500 italic">"{report.description?.substring(0, 60)}..."</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Referencias de Colores */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Infraestructura / Peligro</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Iluminación</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Espacios Verdes</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Seguridad</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Residuos</div>
      </div>
    </div>
  );
}
