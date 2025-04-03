import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: L.LatLngExpression;

}

const Map = ({ 
  center = [0, 0], 

}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapContainerRef.current.style.overflow = 'hidden';
      
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        preferCanvas: true,
      }).setView(center);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      tileLayerRef.current = L.tileLayer(
       
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          noWrap: true
        }
      ).addTo(mapRef.current);

      updateMarker();

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  const updateMarker = () => {
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng(center);
      } else {
        markerRef.current = L.marker(center)
          .addTo(mapRef.current)
          .bindPopup('Selected Location')
          .openPopup();
      }
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center);
      updateMarker();
      mapRef.current.invalidateSize(); 
    }
  }, [center]);

  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      
      tileLayerRef.current = L.tileLayer(
       
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          noWrap: true
        }
      ).addTo(mapRef.current);
      
      mapRef.current.invalidateSize(); 
    }
  }, []);

  return (
    <div 
      ref={mapContainerRef}
      className={`h-full w-full  `}
      style={{ position: 'sticky' }}
    />
  );
};

export default Map;