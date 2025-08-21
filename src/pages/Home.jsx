import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlaces, getTips } from '../data/dataService'
import { sortPlaces } from '../utils/formatters'
import { APP_CONFIG, SORT_OPTIONS } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { filterPlacesByUserActions } from '../utils/userActions'
import PlaceCard from '../components/PlaceCard'
import TipCard from '../components/TipCard'
import Filter from '../components/Filter'
import UserMenu from '../components/UserMenu'
import heroIllustration from '../assets/hero-illustration.svg'

const Home = () => {
  const { user, userActions } = useAuth()
  const [allPlaces, setAllPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RATING_DESC) // Default: Yunsol's rating high to low
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [filters, setFilters] = useState({
    features: [],
    ageRange: [0, 96], // Initialize with default range
    pricing: [],
    visitedOnly: false,
    yunsolRating: [0, 3], // Range of rating values (0-3)
    // User action filters
    likedOnly: false,
    pinnedOnly: false,
    hideDisliked: false
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

    // Filter by Yunsol's visited places only
    if (filters.visitedOnly) {
      filtered = filtered.filter(place =>
        place.yunsolExperience && place.yunsolExperience.hasVisited === true
      )
    }

    // Filter by Yunsol's star rating
    if (filters.yunsolRating && (filters.yunsolRating[0] > 0 || filters.yunsolRating[1] < 3)) {
      filtered = filtered.filter(place => {
        if (!place.yunsolExperience || place.yunsolExperience.rating === undefined) {
          return false
        }
        const rating = place.yunsolExperience.rating
        return rating >= filters.yunsolRating[0] && rating <= filters.yunsolRating[1]
      })
    }

    // Apply user action filters
    if (user && userActions) {
      filtered = filterPlacesByUserActions(filtered, userActions, filters)
    }

    // Apply sorting using utility function
    const sorted = sortPlaces(filtered, sortBy)

    setFilteredPlaces(sorted)
  }, [filters, allPlaces, sortBy, user, userActions])

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
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(142, 36, 170, 0.1) 0%, rgba(171, 71, 188, 0.1) 100%), url(${heroIllustration})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
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
          
          {/* Filter and Results Header Combined */}
          <div className="filter-and-results">
            {/* Results Header with Clickable Filter Toggle */}
            <div className="results-header" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
              <div className="results-count">
                <p>
                  {filteredPlaces.length === allPlaces.length 
                    ? `Showing all ${allPlaces.length} places`
                    : `Showing ${filteredPlaces.length} of ${allPlaces.length} places`
                  }
                  {filteredPlaces.length > 0 && filteredPlaces.length < allPlaces.length && 
                    ` matching your filters`
                  }
                  <span className="filter-toggle-icon">
                    {isFilterExpanded ? '▲' : '▼'}
                  </span>
                </p>
              </div>
              
              <div className="sort-container">
                <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                <select 
                  id="sort-select"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  onClick={(e) => e.stopPropagation()} // Prevent filter toggle when clicking sort
                >
                  <option value="rating-desc">Yunsol's Rating (High to Low)</option>
                  <option value="rating-asc">Yunsol's Rating (Low to High)</option>
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                </select>
              </div>
            </div>
            
            {/* Collapsible Filter Section */}
            {isFilterExpanded && (
              <div className="filter-expanded">
                <Filter 
                  places={allPlaces}
                  onFilterChange={handleFilterChange}
                  activeFilters={filters}
                />
              </div>
            )}
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
