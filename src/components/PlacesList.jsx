import React from 'react';
import styles from './PlacesList.module.css';

const PlacesList = ({ places, selectedPlace, onSelectPlace }) => {
  if (places.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No places found. Add your first place!</p>
      </div>
    );
  }

  return (
    <div className={styles.placesList}>
      {places.map(place => (
        <div
          key={place.id}
          className={`${styles.placeItem} ${
            selectedPlace && selectedPlace.id === place.id ? styles.selected : ''
          }`}
        >
          <div onClick={() => onSelectPlace(place.id)} style={{flex:1, cursor:'pointer'}}>
            <div className={styles.placeName}>
              {place.icon || '📍'} {place.name}
            </div>
            <div className={styles.placeFeatures}>
              {(place.features || []).join(', ')}
            </div>
            <div className={styles.placeInfo}>
              {place.pricing && (
                <span className={styles.pricing}>{place.pricing}</span>
              )}
              {place.ageRange && (
                <span className={styles.ageRange}>
                  {place.ageRange[0]}-{place.ageRange[1]} months
                </span>
              )}
              {place.yunsolExperience?.hasVisited && (
                <span className={styles.visited}>✨ Yunsol visited</span>
              )}
            </div>
          </div>
          <button
            className={styles.deleteBtn}
            title="Delete place"
            onClick={e => { e.stopPropagation(); onDeletePlace(place.id); }}
            style={{marginLeft:8, color:'red', background:'none', border:'none', cursor:'pointer'}}
          >🗑️</button>
        </div>
      ))}
    </div>
  );
};

export default PlacesList;
