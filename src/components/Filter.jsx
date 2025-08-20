import React, { useState, useEffect } from 'react'
import './Filter.css'

const Filter = ({ places, onFilterChange, activeFilters, onCollapseChange }) => {
  const [allFeatures, setAllFeatures] = useState([])
  const [ageRange, setAgeRange] = useState([0, 96]) // Default: 0 months to 8 years (96 months)
  const [isCollapsed, setIsCollapsed] = useState(true) // Collapsed by default

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (onCollapseChange) {
      onCollapseChange(newCollapsed)
    }
  }

  useEffect(() => {
    // Extract unique features from all places
    const features = [...new Set(places.flatMap(place => place.features))].sort()
    setAllFeatures(features)
  }, [places])

  // Sync local ageRange with activeFilters.ageRange
  useEffect(() => {
    if (activeFilters.ageRange) {
      setAgeRange(activeFilters.ageRange)
    }
  }, [activeFilters.ageRange])

  const handleMinAgeChange = (e) => {
    const minAge = parseInt(e.target.value)
    const newAgeRange = [minAge, Math.max(minAge + 6, ageRange[1])]
    setAgeRange(newAgeRange)
    
    // Always update filters when slider changes
    onFilterChange({
      ...activeFilters,
      ageRange: newAgeRange
    })
  }

  const handleMaxAgeChange = (e) => {
    const maxAge = parseInt(e.target.value)
    const newAgeRange = [Math.min(ageRange[0], maxAge - 6), maxAge]
    setAgeRange(newAgeRange)
    
    // Always update filters when slider changes
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

  const handlePricingToggle = (price) => {
    const newPricing = activeFilters.pricing?.includes(price)
      ? activeFilters.pricing.filter(p => p !== price)
      : [...(activeFilters.pricing || []), price]
    
    onFilterChange({
      ...activeFilters,
      pricing: newPricing
    })
  }

  const clearAllFilters = () => {
    setAgeRange([0, 96])
    onFilterChange({
      features: [],
      ageRange: [0, 96], // Reset to default range instead of null
      pricing: []
    })
  }

  const hasActiveFilters = activeFilters.features.length > 0 || 
    (activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96)) ||
    (activeFilters.pricing && activeFilters.pricing.length > 0)

  return (
    <div className={`filter-container ${isCollapsed ? 'compact-collapsed' : ''}`}>
      {isCollapsed ? (
        /* Compact Collapsed View */
        <div className="filter-collapsed">
          <button 
            onClick={toggleCollapse} 
            className="expand-filter-btn"
            aria-label="Expand filters"
            title="Show filters"
          >
            <div className="filter-collapsed-content">
              <span className="filter-icon">🔍</span>
              <span className="filter-text-vertical">FILTER</span>
              {hasActiveFilters && <span className="active-indicator-dot">●</span>}
            </div>
          </button>
        </div>
      ) : (
        /* Expanded View */
        <>
          <div className="filter-header">
            <h3>Filter Places</h3>
            <div className="filter-header-actions">
              <button 
                onClick={toggleCollapse} 
                className="toggle-filter-btn"
                aria-label="Collapse filters"
              >
                ▲ Hide Filters
              </button>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="clear-filters">
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="filter-content expanded">
            <div className="filter-section">
              <h4>By Features</h4>
              <p className="filter-hint">Select multiple features to find places that have ALL selected features</p>
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
                <div className="dual-range-slider">
                  <input
                    type="range"
                    id="min-age"
                    min="0"
                    max="96"
                    step="6"
                    value={ageRange[0]}
                    onChange={handleMinAgeChange}
                    className="age-slider slider-min"
                  />
                  <input
                    type="range"
                    id="max-age"
                    min="0"
                    max="96"
                    step="6"
                    value={ageRange[1]}
                    onChange={handleMaxAgeChange}
                    className="age-slider slider-max"
                  />
                  <div className="slider-track">
                    <div 
                      className="slider-range"
                      style={{
                        left: `${(ageRange[0] / 96) * 100}%`,
                        width: `${((ageRange[1] - ageRange[0]) / 96) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4>By Pricing</h4>
              <div className="filter-tags">
                {['Free', '$', '$$', '$$$'].map(price => (
                  <button
                    key={price}
                    onClick={() => handlePricingToggle(price)}
                    className={`filter-tag ${activeFilters.pricing && activeFilters.pricing.includes(price) ? 'active' : ''}`}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-summary">
                <p>
                  Showing places with{' '}
                  {activeFilters.features.length > 0 && (
                    <>all features: <strong>{activeFilters.features.join(' & ')}</strong></>
                  )}
                  {activeFilters.features.length > 0 && 
                   ((activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96)) ||
                    (activeFilters.pricing && activeFilters.pricing.length > 0)) && ' and '}
                  {activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96) && (
                    <>age range: <strong>{formatAge(activeFilters.ageRange[0])} - {formatAge(activeFilters.ageRange[1])}</strong></>
                  )}
                  {activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96) && 
                   activeFilters.pricing && activeFilters.pricing.length > 0 && ' and '}
                  {activeFilters.pricing && activeFilters.pricing.length > 0 && (
                    <>pricing: <strong>{activeFilters.pricing.join(', ')}</strong></>
                  )}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Filter
