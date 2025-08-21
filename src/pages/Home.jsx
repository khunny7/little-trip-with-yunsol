import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlaces, getTips } from '../data/dataService'
import PlaceCard from '../components/PlaceCard'
import TipCard from '../components/TipCard'
import Filter from '../components/Filter'

const Home = () => {
  const [allPlaces, setAllPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true)
  const [filters, setFilters] = useState({
    features: [],
    ageRange: [0, 96], // Initialize with default range
    pricing: []
  })

  // Check if two age ranges overlap
  const ageRangesOverlap = (range1, range2) => {
    return range1[0] <= range2[1] && range2[0] <= range1[1]
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load places and tips concurrently
        const [placesData, tipsData] = await Promise.all([
          getPlaces(),
          getTips()
        ])
        
        setAllPlaces(placesData)
        setFilteredPlaces(placesData)
        setTips(tipsData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load content. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Apply filters whenever filters change
    let filtered = allPlaces

    if (filters.features.length > 0) {
      filtered = filtered.filter(place =>
        filters.features.every(feature =>
          place.features.includes(feature)
        )
      )
    }

    if (filters.ageRange) {
      filtered = filtered.filter(place => {
        // Now place.ageRange is already an array of numbers [min, max] in months
        const placeAgeRange = place.ageRange
        return ageRangesOverlap(filters.ageRange, placeAgeRange)
      })
    }

    if (filters.pricing && filters.pricing.length > 0) {
      filtered = filtered.filter(place =>
        filters.pricing.includes(place.pricing)
      )
    }

    setFilteredPlaces(filtered)
  }, [filters, allPlaces])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleFeatureClick = (feature) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature]
    
    setFilters({
      ...filters,
      features: newFeatures
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <h2>Loading amazing places for Yunsol... 🌟</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! 😅</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="#" className="logo">Little Trip with Yunsol</a>
            <nav className="nav">
              <a href="#places">Places</a>
              <a href="#tips">Tips</a>
              <a href="#about">About</a>
              <Link to="/admin" title="Manage Places">⚙️</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Adventure Awaits! 🌟</h1>
          <p>
            Curated toddler-friendly places based on real adventures with Yunsol. 
            Tested and loved by our little explorer!
          </p>
          <a href="#places" className="cta-button">Explore Places</a>
        </div>
      </section>

      {/* Places Section */}
      <section id="places" className="places-section">
        <div className="container">
          <h2 className="section-title">Toddler-Friendly Places</h2>
          
          <div className="places-layout">
            {/* Filter Component */}
            <aside className={`filter-sidebar ${isFilterCollapsed ? 'collapsed' : ''}`}>
              <Filter 
                places={allPlaces}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onCollapseChange={setIsFilterCollapsed}
              />
            </aside>
            
            {/* Main Content */}
            <main className="places-main">
              {/* Results Count - Always show */}
              <div className="results-count">
                <p>
                  {filteredPlaces.length === allPlaces.length 
                    ? `Showing all ${allPlaces.length} places`
                    : `Showing ${filteredPlaces.length} of ${allPlaces.length} places`
                  }
                  {filteredPlaces.length > 0 && filteredPlaces.length < allPlaces.length && 
                    ` matching your filters`
                  }
                </p>
              </div>
              
              {/* Places Grid */}
              <div className="places-grid">
                {filteredPlaces.length > 0 ? (
                  filteredPlaces.map(place => (
                    <PlaceCard 
                      key={place.id} 
                      place={place}
                      onFeatureClick={handleFeatureClick}
                    />
                  ))
                ) : (
                  <div className="no-results">
                    <h3>No places found 😔</h3>
                    <p>Try adjusting your filters to see more places.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section id="tips" className="tips-section">
        <div className="container">
          <h2 className="section-title">Tips for Adventures with Toddlers</h2>
          <div className="tips-grid">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Little Trip with Yunsol. Making memories, one adventure at a time! 💕</p>
        </div>
      </footer>
    </>
  )
}

export default Home
