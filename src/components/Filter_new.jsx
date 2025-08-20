import React, { useState, useEffect } from 'react'
import './Filter.css'

const Filter = ({ places, onFilterChange, activeFilters }) => {
  const [allFeatures, setAllFeatures] = useState([])
  const [ageRange, setAgeRange] = useState([0, 96]) // Default: 0 months to 8 years (96 months)

  useEffect(() => {
    // Extract unique features from all places
    const features = [...new Set(places.flatMap(place => place.features))].sort()
    setAllFeatures(features)
  }, [places])

  const handleMinAgeChange = (e) => {
    const minAge = parseInt(e.target.value)
    const newAgeRange = [minAge, Math.max(minAge + 6, ageRange[1])]
    setAgeRange(newAgeRange)
    
    // Update filters to use age range
    onFilterChange({
      ...activeFilters,
      ageRange: newAgeRange
    })
  }

  const handleMaxAgeChange = (e) => {
    const maxAge = parseInt(e.target.value)
    const newAgeRange = [Math.min(ageRange[0], maxAge - 6), maxAge]
    setAgeRange(newAgeRange)
    
    // Update filters to use age range
    onFilterChange({
      ...activeFilters,
      ageRange: newAgeRange
    })
  }

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

  const handleFeatureToggle = (feature) => {
    const newFeatures = activeFilters.features.includes(feature)
      ? activeFilters.features.filter(f => f !== feature)
      : [...activeFilters.features, feature]
    
    onFilterChange({
      ...activeFilters,
      features: newFeatures
    })
  }

  const clearAllFilters = () => {
    setAgeRange([0, 96])
    onFilterChange({
      features: [],
      ageRange: null
    })
  }

  const hasActiveFilters = activeFilters.features.length > 0 || activeFilters.ageRange

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h3>Filter Places</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="clear-filters">
            Clear All
          </button>
        )}
      </div>

      <div className="filter-section">
        <h4>By Features</h4>
        <div className="filter-tags">
          {allFeatures.map(feature => (
            <button
              key={feature}
              onClick={() => handleFeatureToggle(feature)}
              className={`filter-tag ${activeFilters.features.includes(feature) ? 'active' : ''}`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>By Age Range</h4>
        <div className="age-slider-container">
          <div className="age-slider-labels">
            <span className="age-display">From: <strong>{formatAge(ageRange[0])}</strong></span>
            <span className="age-display">To: <strong>{formatAge(ageRange[1])}</strong></span>
          </div>
          <div className="age-sliders">
            <div className="slider-group">
              <label htmlFor="min-age">Min Age:</label>
              <input
                type="range"
                id="min-age"
                min="0"
                max="90"
                step="6"
                value={ageRange[0]}
                onChange={handleMinAgeChange}
                className="age-slider"
              />
            </div>
            <div className="slider-group">
              <label htmlFor="max-age">Max Age:</label>
              <input
                type="range"
                id="max-age"
                min="6"
                max="96"
                step="6"
                value={ageRange[1]}
                onChange={handleMaxAgeChange}
                className="age-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-summary">
          <p>
            Showing places with{' '}
            {activeFilters.features.length > 0 && (
              <>features: <strong>{activeFilters.features.join(', ')}</strong></>
            )}
            {activeFilters.features.length > 0 && activeFilters.ageRange && ' and '}
            {activeFilters.ageRange && (
              <>age range: <strong>{formatAge(activeFilters.ageRange[0])} - {formatAge(activeFilters.ageRange[1])}</strong></>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default Filter
