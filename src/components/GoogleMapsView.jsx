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
  const markersRef = useRef([]);
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

        // Default center - Bellevue area
        const defaultCenter = { lat: 47.6101, lng: -122.2015 };
        
        const mapOptions = {
          center: defaultCenter,
          zoom: 12,
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

        // Guard: ensure the container exists before initializing the map
        const container = mapRef.current;
        if (!container) {
          console.warn('Google Maps: map container not ready');
          return;
        }

        const newMap = new google.maps.Map(container, mapOptions);
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
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();
    const addressable = places.filter(p => p.address);
    let completed = 0;

    addressable.forEach((place, index) => {
      geocoder.geocode({ address: place.address }, (results, status) => {
        completed += 1;
        if (status === 'OK' && results && results[0]) {
          const position = results[0].geometry.location;
          const marker = new google.maps.Marker({
            position,
            map,
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

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 320px; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="padding: 16px; cursor: pointer;" class="info-window-card" data-place-id="${place.id}">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 28px;">${place.icon || '📍'}</span>
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600; flex: 1;">${place.name}</h3>
                  </div>
                  
                  <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">${place.description?.substring(0, 120)}${place.description?.length > 120 ? '...' : ''}</p>
                  
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                    ${(place.features || []).slice(0, 4).map(f => 
                      `<span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">${f}</span>`
                    ).join('')}
                  </div>
                  
                  <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px; padding: 10px; background: #f9fafb; border-radius: 8px;">
                    <div style="flex: 1;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Price</div>
                      <div style="color: #059669; font-weight: 600; font-size: 14px;">${place.pricing || 'Free'}</div>
                    </div>
                    ${place.yunsolExperience?.rating ? `
                    <div style="flex: 1;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Yunsol's Rating</div>
                      <div style="color: #f59e0b; font-size: 16px;">${'⭐'.repeat(place.yunsolExperience.rating)}</div>
                    </div>
                    ` : ''}
                  </div>
                  
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
                    <div style="margin-bottom: 4px;">📍 ${place.address}</div>
                    ${place.phone ? `<div style="margin-bottom: 4px;">📞 ${place.phone}</div>` : ''}
                  </div>
                  
                  <div style="padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 10px 16px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px; cursor: pointer;">
                      View Full Details →
                    </div>
                  </div>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            markersRef.current.forEach(m => m.infoWindow?.close());
            infoWindow.open(map, marker);
            onPlaceSelect(place, index);
          });

          // Add click listener to the info window content for navigation
          google.maps.event.addListener(infoWindow, 'domready', () => {
            const infoWindowCard = document.querySelector(`.info-window-card[data-place-id="${place.id}"]`);
            if (infoWindowCard) {
              infoWindowCard.addEventListener('click', (e) => {
                e.stopPropagation();
                // Navigate to place detail page
                window.location.href = `/place/${place.id}`;
              });
            }
          });

          marker.infoWindow = infoWindow;
          marker.placeData = place;
          markersRef.current.push(marker);
          bounds.extend(position);
        }

        if (completed === addressable.length && addressable.length > 0) {
          if (markersRef.current.length === 1) {
            map.setCenter(markersRef.current[0].getPosition());
            map.setZoom(15);
          } else if (markersRef.current.length > 1) {
            map.fitBounds(bounds);
            const zoom = map.getZoom();
            if (zoom > 15) map.setZoom(15);
          }
        }
      });
    });
  }, [map, places, onPlaceSelect]);

  useEffect(() => {
    if (!map || !selectedPlace || markersRef.current.length === 0) return;
    const selectedMarker = markersRef.current.find(
      marker => marker.placeData?.id === selectedPlace?.id
    );
    if (selectedMarker) {
      map.panTo(selectedMarker.getPosition());
      map.setZoom(Math.max(map.getZoom(), 14));
      markersRef.current.forEach(marker => marker.infoWindow?.close());
      selectedMarker.infoWindow?.open(map, selectedMarker);
    }
  }, [selectedPlace, map]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      />

      {(loading || error) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: loading ? 'rgba(249, 250, 251, 0.9)' : 'rgba(254, 242, 242, 0.9)',
            border: '1px solid ' + (loading ? '#e5e7eb' : '#fecaca'),
            borderRadius: '8px'
          }}
        >
          <div style={{ textAlign: 'center', color: error ? '#dc2626' : '#6b7280', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{error ? '⚠️' : '🗺️'}</div>
            <div style={{ fontWeight: error ? 'bold' : 'normal', marginBottom: error ? '8px' : 0 }}>
              {error ? 'Map Error' : 'Loading Google Maps...'}
            </div>
            {error && (
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsView;