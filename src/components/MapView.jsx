import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './MapView.module.css';

const MapView = ({ places = [], className = '' }) => {
  const [mapError, setMapError] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentMapIndex, setCurrentMapIndex] = useState(0);

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

  // Create search query for the currently displayed place
  const createMapUrl = () => {
    const currentPlace = selectedPlace || placesWithAddress[currentMapIndex];
    const query = `${currentPlace.name}, ${currentPlace.address}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const handlePlaceClick = (place, index) => {
    setSelectedPlace(place);
    setCurrentMapIndex(index);
    setMapError(false); // Reset error state when switching places
  };

  const handlePrevPlace = () => {
    const newIndex = currentMapIndex > 0 ? currentMapIndex - 1 : placesWithAddress.length - 1;
    setCurrentMapIndex(newIndex);
    setSelectedPlace(placesWithAddress[newIndex]);
    setMapError(false);
  };

  const handleNextPlace = () => {
    const newIndex = currentMapIndex < placesWithAddress.length - 1 ? currentMapIndex + 1 : 0;
    setCurrentMapIndex(newIndex);
    setSelectedPlace(placesWithAddress[newIndex]);
    setMapError(false);
  };

  const handleMapLoad = () => {
    setMapError(false);
  };

  const handleMapError = () => {
    setMapError(true);
  };

  return (
    <div className={`${styles.mapContainer} ${className}`}>
      <div className={styles.mapHeader}>
        <h3>📍 Map View</h3>
        <p className={styles.subtitle}>
          {placesWithAddress.length === 1 
            ? `Showing ${placesWithAddress[0].name}` 
            : `Showing place ${currentMapIndex + 1} of ${placesWithAddress.length}: ${selectedPlace?.name || placesWithAddress[currentMapIndex]?.name}`
          }
        </p>
        {placesWithAddress.length > 1 && (
          <div className={styles.mapNavigation}>
            <button onClick={handlePrevPlace} className={styles.navButton}>
              ← Previous
            </button>
            <span className={styles.pageIndicator}>
              {currentMapIndex + 1} / {placesWithAddress.length}
            </span>
            <button onClick={handleNextPlace} className={styles.navButton}>
              Next →
            </button>
          </div>
        )}
      </div>

      <div className={styles.mapContent}>
        <div className={styles.mapWrapper}>
          {mapError ? (
            <div className={styles.mapFallback}>
              <p>📍 Map couldn't load</p>
              <p>Try the individual place links below or view on Google Maps</p>
            </div>
          ) : (
            <iframe
              src={createMapUrl()}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map showing all places"
              onLoad={handleMapLoad}
              onError={handleMapError}
            />
          )}
        </div>

        <div className={styles.placesList}>
          <h4>Browse places individually:</h4>
          <div className={styles.placesGrid}>
            {placesWithAddress.map((place, index) => (
              <div 
                key={place.id} 
                className={`${styles.placeItem} ${
                  selectedPlace?.id === place.id || currentMapIndex === index ? styles.selected : ''
                }`}
                onClick={() => handlePlaceClick(place, index)}
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
};

export default MapView;
