'use client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

// Icône par défaut de Leaflet cassée par le bundler Next.js sans ce correctif
// (chemins d'images résolus différemment) — on pointe explicitement vers le CDN.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type LeafletMapProps = {
  center: { lat: number; lng: number };
  onMarkerMoved: (lat: number, lng: number) => void;
};

function DraggableMarker({ center, onMarkerMoved }: LeafletMapProps) {
  const [position, setPosition] = useState(center);

  return (
    <Marker
      position={position}
      draggable
      icon={markerIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          // Géocodage inverse déclenché une seule fois, à la FIN du
          // glissement — jamais pendant le déplacement (rapport_filtres_feed.md §3).
          onMarkerMoved(pos.lat, pos.lng);
        },
      }}
    />
  );
}

// Composant chargé uniquement côté client (cf. import dynamique dans
// LocationStep) — Leaflet accède à `window` dès son chargement.
export default function LeafletMap({ center, onMarkerMoved }: LeafletMapProps) {
  return (
    <MapContainer center={center} zoom={16} style={{ height: '300px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <DraggableMarker center={center} onMarkerMoved={onMarkerMoved} />
    </MapContainer>
  );
}
