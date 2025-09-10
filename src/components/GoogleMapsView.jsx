import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

/* global google */

const GoogleMapsView = ({ 
  places = [], 
  selectedPlace = null, 
  onPlaceSelect = () => {},
  className = '',
  height = '500px' 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['geometry', 'places']
        });

        await loader.load();

        // Default center - Seattle area
        const defaultCenter = { lat: 47.6062, lng: -122.3321 };
        
        const mapOptions = {
          center: defaultCenter,
          zoom: 10,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        };

        const newMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        setLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key and network connection.');
        setLoading(false);
      }
    };

    initializeMap();
  }, [apiKey]);

  useEffect(() => {
    if (map && places.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      const bounds = new google.maps.LatLngBounds();
      let validPlacesCount = 0;

      places.forEach((place, index) => {
        if (!place.address) return;

        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: place.address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const position = results[0].geometry.location;
            
            const marker = new google.maps.Marker({
              position: position,
              map: map,
              title: place.name,
              animation: google.maps.Animation.DROP,
              icon: {
                url: 'data:image/svg+xml,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#6366F1"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
              }
            });

            // Create info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="max-width: 300px; padding: 10px;">
                  <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${place.name}</h3>
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${place.address}</p>
                  <p style="margin: 0 0 12px 0; color: #374151; font-size: 13px; line-height: 1.4;">${place.description?.substring(0, 150)}...</p>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #374151;">
                      ${place.pricing || 'Price not specified'}
                    </span>
                    <span style="font-size: 18px;">${place.icon || '📍'}</span>
                  </div>
                </div>
              `
            });

            marker.addListener('click', () => {
              // Close all other info windows
              newMarkers.forEach(m => m.infoWindow?.close());
              
              infoWindow.open(map, marker);
              onPlaceSelect(place, index);
            });

            marker.infoWindow = infoWindow;
            marker.placeData = place;
            
            newMarkers.push(marker);
            bounds.extend(position);
            validPlacesCount++;

            // Fit bounds after all markers are added
            if (validPlacesCount === places.filter(p => p.address).length) {
              if (validPlacesCount === 1) {
                map.setCenter(position);
                map.setZoom(15);
              } else {
                map.fitBounds(bounds);
                const zoom = map.getZoom();
                if (zoom > 15) map.setZoom(15);
              }
            }
          }
        });
      });

      setMarkers(newMarkers);
    }
  }, [map, places, markers, onPlaceSelect]);

  useEffect(() => {
    if (map && selectedPlace && markers.length > 0) {
      const selectedMarker = markers.find(marker => 
        marker.placeData?.id === selectedPlace?.id
      );
      
      if (selectedMarker) {
        map.panTo(selectedMarker.getPosition());
        map.setZoom(Math.max(map.getZoom(), 14));
        
        // Close all info windows first
        markers.forEach(marker => marker.infoWindow?.close());
        
        // Open the selected marker's info window
        if (selectedMarker.infoWindow) {
          selectedMarker.infoWindow.open(map, selectedMarker);
        }
      }
    }
  }, [selectedPlace, markers, map]);

  if (loading) {
    return (
      <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
          <div>Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Map Error</div>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        style={{ 
          height, 
          width: '100%', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }} 
      />
    </div>
  );
};

export default GoogleMapsView;