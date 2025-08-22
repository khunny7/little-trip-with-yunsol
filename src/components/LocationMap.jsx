import React, { useState } from 'react';
import styles from './LocationMap.module.css';

const LocationMap = ({ address, placeName, className = '' }) => {
  const [mapError, setMapError] = useState(false);

  // Don't render if no address provided
  if (!address || address.trim() === '') {
    return null;
  }

  // Create the Google Maps embed URL with place name and address
  const searchQuery = placeName && placeName.trim() !== '' 
    ? `${placeName}, ${address}` 
    : address;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`;

  const handleMapLoad = () => {
    setMapError(false);
  };

  const handleMapError = () => {
    setMapError(true);
  };

  return (
    <div className={`${styles.mapContainer} ${className}`}>
      <div className={styles.mapHeader}>
        <h3>📍 Location</h3>
        <p className={styles.address}>{address}</p>
      </div>
      <div className={styles.mapWrapper}>
        {mapError ? (
          <div className={styles.mapFallback}>
            <p>📍 Map couldn't load</p>
            <p>Click "View on Google Maps" below to see the location</p>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${placeName || 'place'}`}
            onLoad={handleMapLoad}
            onError={handleMapError}
          />
        )}
      </div>
      <div className={styles.mapActions}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.directionsLink}
        >
          🧭 Get Directions
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewOnMapsLink}
        >
          🗺️ View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default LocationMap;
