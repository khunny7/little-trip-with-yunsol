import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GoogleMapsView from './GoogleMapsView';
import styles from './MapView.module.css';

const MapView = React.memo(({ places = [], className = '' }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Filter places that have addresses
  const placesWithAddress = places.filter(place => place.address && place.address.trim() !== '');

  // Set initial selected place
  useEffect(() => {
    if (placesWithAddress.length > 0 && !selectedPlace) {
      setSelectedPlace(placesWithAddress[0]);
    }
  }, [placesWithAddress, selectedPlace]);

  // Don't render if no places with addresses
  if (placesWithAddress.length === 0) {
    return (
      <div className={`${styles.mapContainer} ${className}`}>
        <div className={styles.emptyState}>
          <h3>📍 Map View</h3>
          <p>No places with addresses to display on the map.</p>
        </div>
      </div>
    );
  }

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
  };

  return (
    <div className={`${styles.mapContainer} ${className}`}>
      <div className={styles.mapHeader}>
        <h3>📍 Map View</h3>
        <p className={styles.subtitle}>
          {placesWithAddress.length === 1 
            ? `Showing ${placesWithAddress[0].name}` 
            : `Showing all ${placesWithAddress.length} places on the map`
          }
        </p>
      </div>

      <div className={styles.mapContent}>
        <div className={styles.mapWrapper}>
          <GoogleMapsView
            places={placesWithAddress}
            selectedPlace={selectedPlace}
            onPlaceSelect={handlePlaceSelect}
            height="500px"
          />
        </div>

        <div className={styles.placesList}>
          <h4>Browse places individually:</h4>
          <div className={styles.placesGrid}>
            {placesWithAddress.map((place) => (
              <div 
                key={place.id} 
                className={`${styles.placeItem} ${
                  selectedPlace?.id === place.id ? styles.selected : ''
                }`}
                onClick={() => handlePlaceClick(place)}
              >
                <div className={styles.placeInfo}>
                  <h5>{place.name}</h5>
                  <p className={styles.address}>{place.address}</p>
                  <div className={styles.placeActions}>
                    <Link 
                      to={`/place/${place.id}`}
                      className={styles.detailLink}
                    >
                      View Details
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapLink}
                    >
                      📍 Open in Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.mapActions}>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            placesWithAddress.slice(0, 8).map(p => `${p.name}, ${p.address}`).join(' | ')
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewAllLink}
        >
          🗺️ View All Places on Google Maps
        </a>
      </div>
    </div>
  );
});

export default MapView;
