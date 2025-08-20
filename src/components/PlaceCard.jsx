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
        {/* Yunsol's Experience Badge */}
        {place.yunsolExperience?.hasVisited && (
          <div className="yunsol-badge">
            <span className="badge-icon">👶</span>
            <span className="badge-text">Yunsol's Pick</span>
          </div>
        )}
      </div>
      <div className="place-content">
        <h3 className="place-title">{place.name}</h3>
        <p className="place-description">{place.description}</p>
        
        {/* Yunsol's Rating */}
        {place.yunsolExperience?.hasVisited && place.yunsolExperience?.rating && (
          <div className="yunsol-rating">
            <span className="rating-label">Yunsol's Rating:</span>
            <div className="stars">
              {[1, 2, 3].map(star => (
                <span 
                  key={star} 
                  className={`star ${star <= place.yunsolExperience.rating ? 'filled' : 'empty'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        )}

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
          <div className="pricing">
            💰 {place.pricing || 'Free'}
          </div>
        </div>
        
        <div className="click-hint">Click to learn more →</div>
      </div>
    </div>
  )
}

export default PlaceCard
