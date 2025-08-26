import { useState, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { getPlaceById, updatePlace, deletePlace } from '../data/dataService'
import { formatAgeRange } from '../utils/formatters'
import LocationMap from './LocationMap'
import PlaceForm from './PlaceForm'
import { useApp } from '../hooks/useApp'
import UserMenu from './UserMenu'
import './PlaceDetail.css'

const PlaceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inlineSavingField, setInlineSavingField] = useState(null)
  const [editingFields, setEditingFields] = useState({ likes:false, dislikes:false, personalNotes:false })
  const [draftExperience, setDraftExperience] = useState({ likes:'', dislikes:'', personalNotes:'' })

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setLoading(true)
        setError(null)
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
    if (id) loadPlace()
  }, [id])

  useEffect(() => {
    // after load place set draft
    if (place?.yunsolExperience) {
      setDraftExperience({
        likes: place.yunsolExperience.likes || '',
        dislikes: place.yunsolExperience.dislikes || '',
        personalNotes: place.yunsolExperience.personalNotes || ''
      })
    }
  }, [place])

  const handleSave = async (data) => {
    if (!place) return
    try {
      setSaving(true)
      const ok = await updatePlace(place.id, data)
      if (ok) {
        // Refresh local state with updated values
        setPlace(prev => ({ ...prev, ...data }))
        setIsEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!place) return
    if (!window.confirm('Delete this place? This cannot be undone.')) return
    const ok = await deletePlace(place.id)
    if (ok) navigate('/')
  }

  const updateYunsolExperience = async (partial, fieldNameForSpinner=null) => {
    if (!place) return
    try {
      if (fieldNameForSpinner) setInlineSavingField(fieldNameForSpinner)
      const newExp = { hasVisited:true, rating: place.yunsolExperience?.rating || 1, ...place.yunsolExperience, ...partial }
      await updatePlace(place.id, { yunsolExperience: newExp })
      setPlace(prev => ({ ...prev, yunsolExperience: newExp }))
    } catch (e) { console.error('Update experience failed', e) }
    finally { if (fieldNameForSpinner) setInlineSavingField(null) }
  }

  const handleStarClick = (val) => {
    if (!user?.isAdmin) return
    updateYunsolExperience({ rating: val }, 'rating')
  }

  const startEditField = (field) => {
    setEditingFields(f => ({ ...f, [field]: true }))
  }
  const cancelEditField = (field) => {
    setEditingFields(f => ({ ...f, [field]: false }))
    // reset draft to current value
    setDraftExperience(d => ({ ...d, [field]: place?.yunsolExperience?.[field] || '' }))
  }
  const saveField = async (field) => {
    await updateYunsolExperience({ [field]: draftExperience[field] }, field)
    setEditingFields(f => ({ ...f, [field]: false }))
  }

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

  if (!place) return null

  // Editing view
  if (isEditing && user?.isAdmin) {
    return (
      <div className="place-detail">
        <header className="detail-header">
          <div className="container">
            <nav className="detail-nav">
              <button onClick={() => navigate('/')} className="back-button">← Back</button>
              <div className="detail-nav-title"><span>Editing Place</span></div>
              <div className="admin-actions">
                <button disabled={saving} onClick={() => setIsEditing(false)} className="admin-edit-btn secondary">Cancel</button>
              </div>
            </nav>
          </div>
        </header>
        <section className="detail-content">
          <div className="container">
            <div className="detail-section">
              <h2>Edit Place</h2>
              <PlaceForm
                place={place}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                onDelete={handleDelete}
              />
              {saving && <div className="saving-indicator">Saving...</div>}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="place-detail">
      {/* Top Navigation Header unified with app header */}
      <header className="app-header">
        <div className="container-new header-inner" style={{width:'100%'}}>
          <button onClick={() => navigate('/')} className="back-button" style={{marginRight:'4px'}}>←</button>
          <NavLink to="/" className="brand">Little Trip with Yunsol</NavLink>
          <nav className="nav-new" style={{flexWrap:'wrap'}}>
            <NavLink to="/" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Discover</NavLink>
            {user?.isAdmin && (
              <NavLink to="/admin" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Admin</NavLink>
            )}
            <NavLink to="/profile" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Saved</NavLink>
          </nav>
          <div style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center'}}>
            {user?.isAdmin && (
              <button className="admin-edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit</button>
            )}
            <UserMenu />
          </div>
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
                      <span className="inline-stars">
                        {[1,2,3].map(star => (
                          <button
                            key={star}
                            className={`star-btn ${place.yunsolExperience.rating >= star ? 'active':''}`}
                            onClick={() => handleStarClick(star)}
                            disabled={!user?.isAdmin || inlineSavingField==='rating'}
                            aria-label={`Set rating ${star}`}
                          >⭐</button>
                        ))}
                      </span>
                      <span className="rating-number">({place.yunsolExperience.rating}/3)</span>
                      {inlineSavingField==='rating' && <span className="saving-dot">⟳</span>}
                    </div>

                    {/* Likes */}
                    <div className="experience-item inline-edit-block">
                      <div className="inline-edit-header">
                        <h4>👍 What Yunsol Loved:</h4>
                        {user?.isAdmin && !editingFields.likes && (
                          <button className="mini-edit" onClick={() => startEditField('likes')}>Edit</button>
                        )}
                      </div>
                      {editingFields.likes ? (
                        <div className="inline-editor">
                          <textarea
                            value={draftExperience.likes}
                            onChange={e => setDraftExperience(d => ({ ...d, likes:e.target.value }))}
                            rows={3}
                          />
                          <div className="inline-editor-actions">
                            <button disabled={inlineSavingField==='likes'} onClick={() => saveField('likes')}>Save</button>
                            <button onClick={() => cancelEditField('likes')} className="secondary">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p>{place.yunsolExperience.likes || <em className="placeholder">No likes yet.</em>}</p>
                      )}
                      {inlineSavingField==='likes' && <div className="saving-indicator">Saving...</div>}
                    </div>

                    {/* Dislikes */}
                    <div className="experience-item inline-edit-block">
                      <div className="inline-edit-header">
                        <h4>👎 What Could Be Better:</h4>
                        {user?.isAdmin && !editingFields.dislikes && (
                          <button className="mini-edit" onClick={() => startEditField('dislikes')}>Edit</button>
                        )}
                      </div>
                      {editingFields.dislikes ? (
                        <div className="inline-editor">
                          <textarea
                            value={draftExperience.dislikes}
                            onChange={e => setDraftExperience(d => ({ ...d, dislikes:e.target.value }))}
                            rows={3}
                          />
                          <div className="inline-editor-actions">
                            <button disabled={inlineSavingField==='dislikes'} onClick={() => saveField('dislikes')}>Save</button>
                            <button onClick={() => cancelEditField('dislikes')} className="secondary">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p>{place.yunsolExperience.dislikes || <em className="placeholder">No dislikes yet.</em>}</p>
                      )}
                      {inlineSavingField==='dislikes' && <div className="saving-indicator">Saving...</div>}
                    </div>

                    {/* Notes */}
                    <div className="experience-item inline-edit-block">
                      <div className="inline-edit-header">
                        <h4>💭 Personal Notes:</h4>
                        {user?.isAdmin && !editingFields.personalNotes && (
                          <button className="mini-edit" onClick={() => startEditField('personalNotes')}>Edit</button>
                        )}
                      </div>
                      {editingFields.personalNotes ? (
                        <div className="inline-editor">
                          <textarea
                            value={draftExperience.personalNotes}
                            onChange={e => setDraftExperience(d => ({ ...d, personalNotes:e.target.value }))}
                            rows={4}
                          />
                          <div className="inline-editor-actions">
                            <button disabled={inlineSavingField==='personalNotes'} onClick={() => saveField('personalNotes')}>Save</button>
                            <button onClick={() => cancelEditField('personalNotes')} className="secondary">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="personal-notes">{place.yunsolExperience.personalNotes || <em className="placeholder">No notes yet.</em>}</p>
                      )}
                      {inlineSavingField==='personalNotes' && <div className="saving-indicator">Saving...</div>}
                    </div>
                  </div>
                ) : (
                  <div className="experience-placeholder">
                    <p>
                      <strong>Not visited yet!</strong> {user?.isAdmin ? 'Click a star to set a rating & start notes.' : 'We\'ll update this section once we visit!'}
                    </p>
                    {user?.isAdmin && (
                      <div className="admin-inline-start">
                        {[1,2,3].map(star => (
                          <button key={star} className="star-btn" onClick={() => handleStarClick(star)}>⭐</button>
                        ))}
                      </div>
                    )}
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
