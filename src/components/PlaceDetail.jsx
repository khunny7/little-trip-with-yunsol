import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlaceById } from '../data/dataService'
import { formatAgeRange } from '../utils/formatters'
import LocationMap from './LocationMap'
import './PlaceDetail.css'

const PlaceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setLoading(true)
        setError(null)
        // Don't parse as integer - Firebase uses string IDs
        const placeData = await getPlaceById(id)
        
        if (!placeData) {
          setError('Place not found')
          return
        }
        
        setPlace(placeData)
      } catch (err) {
        console.error('Error loading place:', err)
        setError('Failed to load place details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadPlace()
    }
  }, [id])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <h2>Loading place details... 🌟</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Oops! {error}</h2>
          <button onClick={() => navigate('/')} className="cta-button">
            ← Back to Places
          </button>
        </div>
      </div>
    )
  }

  if (!place) {
    return null
  }

  return (
    <div className="place-detail">
      {/* Top Navigation Header */}
      <header className="detail-header">
        <div className="container">
          <nav className="detail-nav">
            <button onClick={() => navigate('/')} className="back-button">
              ← Back to Places
            </button>
            <div className="detail-nav-title">
              <span>Little Trip with Yunsol</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="detail-hero">
        <div className="container">
          <div className="hero-content">
            <div className="place-icon-large">
              {place.icon}
            </div>
            <h1 className="detail-title">{place.name}</h1>
            <div className="age-range-large">Ages: {formatAgeRange(place.ageRange)}</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="detail-content">
        <div className="container">
          <div className="content-grid">
            
            {/* Description */}
            <div className="detail-section">
              <h2>About</h2>
              <p className="detail-description">{place.description}</p>
            </div>

            {/* Features */}
            <div className="detail-section">
              <h2>Features</h2>
              <div className="features-list">
                {place.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-bullet">✨</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yunsol's Experience */}
            {place.yunsolExperience && (
              <div className="detail-section yunsol-experience">
                <h2>Yunsol's Experience</h2>
                {place.yunsolExperience.hasVisited ? (
                  <div className="experience-content">
                    <div className="experience-rating">
                      <strong>Yunsol's Rating:</strong> 
                      <span className="rating">{'⭐'.repeat(place.yunsolExperience.rating)}</span>
                      <span className="rating-number">({place.yunsolExperience.rating}/3)</span>
                    </div>
                    
                    {place.yunsolExperience.likes && (
                      <div className="experience-item">
                        <h4>👍 What Yunsol Loved:</h4>
                        <p>{place.yunsolExperience.likes}</p>
                      </div>
                    )}
                    
                    {place.yunsolExperience.dislikes && (
                      <div className="experience-item">
                        <h4>👎 What Could Be Better:</h4>
                        <p>{place.yunsolExperience.dislikes}</p>
                      </div>
                    )}
                    
                    {place.yunsolExperience.personalNotes && (
                      <div className="experience-item">
                        <h4>💭 Personal Notes:</h4>
                        <p className="personal-notes">{place.yunsolExperience.personalNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="experience-placeholder">
                    <p>
                      <strong>Not visited yet!</strong> We haven't been to this place with Yunsol yet, 
                      but it's on our list. We'll update this section once we visit!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Practical Info */}
            <div className="detail-section">
              <h2>Practical Info</h2>
              <div className="info-grid">
                <div className="info-item">
                  <strong>📍 Address:</strong> {place.address}
                </div>
                <div className="info-item">
                  <strong>📞 Phone:</strong> 
                  <a href={`tel:${place.phone}`} className="contact-link">{place.phone}</a>
                </div>
                {place.website && (
                  <div className="info-item">
                    <strong>🌐 Website:</strong> 
                    <a href={place.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                      Visit Website
                    </a>
                  </div>
                )}
                <div className="info-item">
                  <strong>🚗 Parking:</strong> {place.parkingInfo}
                </div>
                <div className="info-item">
                  <strong>⏱️ Duration:</strong> {place.durationOfVisit}
                </div>
              </div>
            </div>

            {/* Location & Map */}
            <LocationMap 
              address={place.address}
              placeName={place.name}
            />

            {/* Pricing */}
            <div className="detail-section pricing-highlight">
              <h2>Pricing</h2>
              <div className="pricing-display">
                <div className="price-badge">
                  {place.pricing}
                </div>
                <div className="price-explanation">
                  {place.pricing === 'Free' && (
                    <p>No admission fee required</p>
                  )}
                  {place.pricing === '$' && (
                    <p>Budget-friendly (Under $15 per person)</p>
                  )}
                  {place.pricing === '$$' && (
                    <p>Moderate pricing ($15-30 per person)</p>
                  )}
                  {place.pricing === '$$$' && (
                    <p>Premium experience ($30+ per person)</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Notes */}
            {place.specialNotes && (
              <div className="detail-section">
                <h2>Notes</h2>
                <div className="special-notes">
                  <p>{place.specialNotes}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Back to Top */}
      <div className="back-to-places">
        <div className="container">
          <button onClick={() => navigate('/')} className="cta-button">
            ← Explore More Places
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaceDetail
