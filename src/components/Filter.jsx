import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import './Filter.css'

const Filter = ({ places, onFilterChange, activeFilters }) => {
  const { user } = useAuth()
  const [allFeatures, setAllFeatures] = useState([])
  const [ageRange, setAgeRange] = useState([0, 96]) // Default: 0 months to 8 years (96 months)

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

  const handleVisitedToggle = () => {
    onFilterChange({
      ...activeFilters,
      visitedOnly: !activeFilters.visitedOnly
    })
  }

  const handleMinRatingChange = (e) => {
    const minRating = parseInt(e.target.value)
    const currentRange = activeFilters.yunsolRating || [0, 3]
    const newRatingRange = [minRating, Math.max(minRating, currentRange[1])]
    
    onFilterChange({
      ...activeFilters,
      yunsolRating: newRatingRange
    })
  }

  const handleMaxRatingChange = (e) => {
    const maxRating = parseInt(e.target.value)
    const currentRange = activeFilters.yunsolRating || [0, 3]
    const newRatingRange = [Math.min(currentRange[0], maxRating), maxRating]
    
    onFilterChange({
      ...activeFilters,
      yunsolRating: newRatingRange
    })
  }

  // User action filter handlers
  const handleLikedOnlyChange = () => {
    onFilterChange({
      ...activeFilters,
      likedOnly: !activeFilters.likedOnly
    })
  }

  const handlePinnedOnlyChange = () => {
    onFilterChange({
      ...activeFilters,
      pinnedOnly: !activeFilters.pinnedOnly
    })
  }

  const handleHideHiddenChange = () => {
    onFilterChange({
      ...activeFilters,
      hideHidden: !activeFilters.hideHidden
    })
  }

  const clearAllFilters = () => {
    setAgeRange([0, 96])
    onFilterChange({
      features: [],
      ageRange: [0, 96], // Reset to default range instead of null
      pricing: [],
      visitedOnly: false,
      yunsolRating: [0, 3], // Reset rating range to full range
      likedOnly: false,
      pinnedOnly: false,
      hideHidden: true
    })
  }

  const hasActiveFilters = activeFilters.features.length > 0 || 
    (activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96)) ||
    (activeFilters.pricing && activeFilters.pricing.length > 0) ||
    activeFilters.visitedOnly ||
    (activeFilters.yunsolRating && (activeFilters.yunsolRating[0] > 0 || activeFilters.yunsolRating[1] < 3)) ||
    activeFilters.likedOnly ||
    activeFilters.pinnedOnly ||
    activeFilters.hideHidden

  return (
    <div className="filter-container collapsed-style">
      <div className="filter-header">
        <h3>Filter Places</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="clear-filters">
            Clear All
          </button>
        )}
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

            <div className="filter-section">
              <h4>Yunsol's Adventures</h4>
              <div className="filter-subsection">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={activeFilters.visitedOnly || false}
                    onChange={handleVisitedToggle}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">
                    🎯 Only places Yunsol has visited
                  </span>
                </label>
              </div>
              
              <div className="filter-subsection">
                <h5>Filter by Yunsol's Rating</h5>
                <div className="range-slider-container">
                  <div className="range-labels">
                    <span>Min: {activeFilters.yunsolRating ? (activeFilters.yunsolRating[0] === 0 ? 'No rating' : `${activeFilters.yunsolRating[0]}⭐`) : 'No rating'}</span>
                    <span>Max: {activeFilters.yunsolRating ? (activeFilters.yunsolRating[1] === 0 ? 'No rating' : `${activeFilters.yunsolRating[1]}⭐`) : '3⭐'}</span>
                  </div>
                  <div className="dual-range-slider">
                    <input
                      type="range"
                      id="min-rating"
                      min="0"
                      max="3"
                      step="1"
                      value={activeFilters.yunsolRating ? activeFilters.yunsolRating[0] : 0}
                      onChange={handleMinRatingChange}
                      className="rating-slider slider-min"
                    />
                    <input
                      type="range"
                      id="max-rating"
                      min="0"
                      max="3"
                      step="1"
                      value={activeFilters.yunsolRating ? activeFilters.yunsolRating[1] : 3}
                      onChange={handleMaxRatingChange}
                      className="rating-slider slider-max"
                    />
                    <div className="slider-track">
                      <div 
                        className="slider-range"
                        style={{
                          left: `${((activeFilters.yunsolRating ? activeFilters.yunsolRating[0] : 0) / 3) * 100}%`,
                          width: `${(((activeFilters.yunsolRating ? activeFilters.yunsolRating[1] : 3) - (activeFilters.yunsolRating ? activeFilters.yunsolRating[0] : 0)) / 3) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Action Filters */}
            {user && (
              <div className="filter-group">
                <h4>Your Preferences</h4>
                <div className="user-action-filters">
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.likedOnly || false}
                      onChange={handleLikedOnlyChange}
                    />
                    <span className="filter-option-text">❤️ Only liked places</span>
                  </label>
                  
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.pinnedOnly || false}
                      onChange={handlePinnedOnlyChange}
                    />
                    <span className="filter-option-text">📌 Only planned places</span>
                  </label>
                  
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.hideHidden || false}
                      onChange={handleHideHiddenChange}
                    />
                    <span className="filter-option-text">� Hide hidden places</span>
                  </label>
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <div className="filter-summary">
                <p>
                  Showing places {activeFilters.visitedOnly ? 'Yunsol has visited ' : ''}
                  {activeFilters.features.length > 0 && (
                    <>with all features: <strong>{activeFilters.features.join(' & ')}</strong></>
                  )}
                  {activeFilters.features.length > 0 && 
                   ((activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96)) ||
                    (activeFilters.pricing && activeFilters.pricing.length > 0) ||
                    (activeFilters.yunsolRating && (activeFilters.yunsolRating[0] > 0 || activeFilters.yunsolRating[1] < 3))) && ', '}
                  {activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96) && (
                    <>age range: <strong>{formatAge(activeFilters.ageRange[0])} - {formatAge(activeFilters.ageRange[1])}</strong></>
                  )}
                  {activeFilters.ageRange && (activeFilters.ageRange[0] > 0 || activeFilters.ageRange[1] < 96) && 
                   ((activeFilters.pricing && activeFilters.pricing.length > 0) ||
                    (activeFilters.yunsolRating && (activeFilters.yunsolRating[0] > 0 || activeFilters.yunsolRating[1] < 3))) && ', '}
                  {activeFilters.pricing && activeFilters.pricing.length > 0 && (
                    <>pricing: <strong>{activeFilters.pricing.join(', ')}</strong></>
                  )}
                  {activeFilters.pricing && activeFilters.pricing.length > 0 && 
                   activeFilters.yunsolRating && (activeFilters.yunsolRating[0] > 0 || activeFilters.yunsolRating[1] < 3) && ', '}
                  {activeFilters.yunsolRating && (activeFilters.yunsolRating[0] > 0 || activeFilters.yunsolRating[1] < 3) && (
                    <>Yunsol's rating: <strong>{activeFilters.yunsolRating[0] === 0 ? 'No rating' : `${activeFilters.yunsolRating[0]}⭐`} - {activeFilters.yunsolRating[1] === 0 ? 'No rating' : `${activeFilters.yunsolRating[1]}⭐`}</strong></>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
    )
}

export default Filter
