import React from 'react'
import { useNavigate } from 'react-router-dom'
import './PlaceCard.css'

const PlaceCard = ({ place, onFeatureClick }) => {
  const navigate = useNavigate()

  const formatAge = (months) => {
    if (months < 12) {
      return `${months}m`
    } else if (months === 12) {
      return '1y'
    } else if (months % 12 === 0) {
      return `${months / 12}y`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      return `${years}y ${remainingMonths}m`
    }
  }

  const formatAgeRange = (ageRange) => {
    return `${formatAge(ageRange[0])} - ${formatAge(ageRange[1])}`
  }

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a tag
    if (e.target.classList.contains('feature-tag')) {
      return
    }
    navigate(`/place/${place.id}`)
  }

  const handleFeatureClick = (e, feature) => {
    e.stopPropagation()
    if (onFeatureClick) {
      onFeatureClick(feature)
    }
  }

  return (
    <div className="place-card" onClick={handleCardClick}>
      <div className="place-image">
        <span>{place.icon}</span>
      </div>
      <div className="place-content">
        <h3 className="place-title">{place.name}</h3>
        <p className="place-description">{place.description}</p>
        
        {/* Quick Info Bar */}
        <div className="place-quick-info">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span className="info-text">{place.address?.split(',')[0] || 'Location TBA'}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💰</span>
            <span className="info-text">{place.pricing || 'See details'}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <span className="info-text">{place.durationOfVisit || 'Flexible'}</span>
          </div>
        </div>

        <div className="place-features">
          {place.features.map((feature, index) => (
            <span 
              key={index} 
              className="feature-tag clickable"
              onClick={(e) => handleFeatureClick(e, feature)}
              title={`Filter by ${feature}`}
            >
              {feature}
            </span>
          ))}
        </div>
        
        <div className="place-meta">
          <div className="age-range">
            Ages: {formatAgeRange(place.ageRange)}
          </div>
          {place.cleanlinessRating && (
            <div className="cleanliness-rating">
              {'⭐'.repeat(place.cleanlinessRating)}
            </div>
          )}
        </div>
        
        <div className="click-hint">Click to learn more →</div>
      </div>
    </div>
  )
}

export default PlaceCard
