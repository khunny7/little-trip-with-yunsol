import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ListView.module.css';

const ListView = ({ places = [], className = '' }) => {
  if (places.length === 0) {
    return (
      <div className={`${styles.listContainer} ${className}`}>
        <div className={styles.emptyState}>
          <h3>📋 List View</h3>
          <p>No places to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.listContainer} ${className}`}>
      <div className={styles.listHeader}>
        <h3>📋 Places List</h3>
        <p className={styles.subtitle}>
          {places.length} place{places.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className={styles.listItems}>
        {places.map((place) => (
          <div key={place.id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <h4 className={styles.placeName}>
                  <span className={styles.icon}>{place.icon}</span>
                  {place.name}
                </h4>
                {place.yunsolExperience?.rating && (
                  <div className={styles.rating}>
                    {'⭐'.repeat(place.yunsolExperience.rating)}
                  </div>
                )}
              </div>
              
              <p className={styles.description}>{place.description}</p>
              
              <div className={styles.itemDetails}>
                <div className={styles.features}>
                  {place.features.slice(0, 3).map(feature => (
                    <span key={feature} className={styles.feature}>
                      {feature}
                    </span>
                  ))}
                  {place.features.length > 3 && (
                    <span className={styles.moreFeatures}>
                      +{place.features.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className={styles.metadata}>
                  <span className={styles.pricing}>{place.pricing}</span>
                  {place.address && (
                    <span className={styles.location}>📍 {place.address}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.itemActions}>
              <Link 
                to={`/place/${place.id}`}
                className={styles.detailButton}
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
