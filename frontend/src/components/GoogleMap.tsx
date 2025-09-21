import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    type: 'waste' | 'hotspot' | 'user';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  onMapClick?: (lat: number, lng: number) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ center, zoom, markers, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markersArray, setMarkersArray] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleGoogleMapsLoad = () => {
      setIsLoaded(true);
      initializeMap();
    };

    if ((window as any).googleMapsLoaded) {
      handleGoogleMapsLoad();
    } else {
      window.addEventListener('googleMapsLoaded', handleGoogleMapsLoad);
      return () => window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoad);
    }
  }, [center, zoom, onMapClick]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: 'terrain',
      styles: [
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#2d5a27' }]
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'all',
          stylers: [{ color: '#c8e5c8' }]
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
        }
      ]
    });

    if (onMapClick) {
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onMapClick(event.latLng.lat(), event.latLng.lng());
        }
      });
    }

    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersArray.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = markers.map(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          url: markerData.type === 'waste'
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
                  <path d="M9 12l2 2 4-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `)
            : markerData.type === 'user'
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#2563EB" stroke="#ffffff" stroke-width="3"/>
                  <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                  <circle cx="16" cy="16" r="3" fill="#2563EB"/>
                </svg>
              `)
            : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="${
                    markerData.priority === 'CRITICAL' ? '#DC2626' :
                    markerData.priority === 'HIGH' ? '#EA580C' :
                    markerData.priority === 'MEDIUM' ? '#D97706' : '#16A34A'
                  }" stroke="#ffffff" stroke-width="2"/>
                  <path d="M12 8v4m0 4h.01" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `)}`,
          scaledSize: new google.maps.Size(markerData.type === 'user' ? 32 : 24, markerData.type === 'user' ? 32 : 24),
          anchor: new google.maps.Point(markerData.type === 'user' ? 16 : 12, markerData.type === 'user' ? 16 : 12)
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
              ${markerData.title}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Type: ${markerData.type === 'waste' ? 'Waste Collection' : markerData.type === 'user' ? 'Your Location' : 'Pollution Hotspot'}
            </p>
            ${markerData.priority ? `
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">
                Priority: <span style="color: ${
                  markerData.priority === 'CRITICAL' ? '#DC2626' :
                  markerData.priority === 'HIGH' ? '#EA580C' :
                  markerData.priority === 'MEDIUM' ? '#D97706' : '#16A34A'
                }; font-weight: 600;">${markerData.priority}</span>
              </p>
            ` : ''}
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
              ${markerData.position.lat.toFixed(6)}, ${markerData.position.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkersArray(newMarkers);
  }, [map, markers]);

  // Auto-fit map to show all markers
  useEffect(() => {
    if (!map || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
      bounds.extend(marker.position);
    });

    if (markers.length > 1) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(markers[0].position);
      map.setZoom(14);
    }
  }, [map, markers]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}
    />
  );
};

export default GoogleMap;