import React, { useState, useEffect } from 'react';
import styles from './PlaceForm.module.css';

const PlaceForm = ({ place, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    pricing: 'Free',
    ageMin: 6,
    ageMax: 96,
    features: [],
    parkingInfo: '',
    durationOfVisit: '',
    specialNotes: '',
    photos: [], // added
    yunsolExperience: {
      hasVisited: false,
      rating: 3,
      likes: '',
      dislikes: '',
      personalNotes: ''
    }
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState(''); // added
  const [newPhotoCaption, setNewPhotoCaption] = useState(''); // added
  const [photoError, setPhotoError] = useState(null); // added
  const [coverFetchLoading, setCoverFetchLoading] = useState(false);
  const [coverFetchError, setCoverFetchError] = useState(null);

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        icon: place.icon || '',
        description: place.description || '',
        address: place.address || '',
        phone: place.phone || '',
        website: place.website || '',
        pricing: place.pricing || 'Free',
        ageMin: place.ageRange ? place.ageRange[0] : 6,
        ageMax: place.ageRange ? place.ageRange[1] : 96,
        features: place.features || [],
        parkingInfo: place.parkingInfo || '',
        durationOfVisit: place.durationOfVisit || '',
        specialNotes: place.specialNotes || '',
        photos: place.photos || [], // added
        yunsolExperience: {
          hasVisited: place.yunsolExperience?.hasVisited || false,
          rating: place.yunsolExperience?.rating || 3,
          likes: place.yunsolExperience?.likes || '',
          dislikes: place.yunsolExperience?.dislikes || '',
          personalNotes: place.yunsolExperience?.personalNotes || ''
        }
      });
    }
  }, [place]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('yunsol.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        yunsolExperience: {
          ...prev.yunsolExperience,
          [field]: type === 'checkbox' ? checked : (field === 'rating' ? parseInt(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (name.includes('age') ? parseInt(value) || 0 : value)
      }));
    }
  };

  const addFeature = (e) => {
    e.preventDefault();
    const trimmed = newFeature.trim();
    if (trimmed && !formData.features.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, trimmed]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  // --- Photos (web image URLs) logic ---
  const validateImageUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) return 'URL must start with http or https';
    if (!/\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(url)) {
      // allow but warn
      return 'URL added, but file extension not typical image';
    }
    return null;
  };

  // helper to set a cover photo (only one isCover true)
  const setCoverPhoto = (urlOrIndex) => {
    setFormData(prev => {
      const photos = [...(prev.photos||[])];
      let idx = typeof urlOrIndex === 'number' ? urlOrIndex : photos.findIndex(p => p.url === urlOrIndex);
      if (idx === -1 && typeof urlOrIndex === 'string') {
        // add new at front
        const newPhoto = { url: urlOrIndex, caption: 'Cover', sourceType: 'auto', isCover: true, addedAt: Date.now() };
        return { ...prev, photos: [newPhoto, ...photos.map(p => ({ ...p, isCover:false }))] };
      }
      return { ...prev, photos: photos.map((p,i)=> ({ ...p, isCover: i===idx })) };
    });
  };

  const fetchCover = async () => {
    if (!formData.website) return;
    setCoverFetchLoading(true);
    setCoverFetchError(null);
    try {
      const resp = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(formData.website)}&video=false&audio=false`);
      if (!resp.ok) throw new Error('Request failed');
      const json = await resp.json();
      if (json.status !== 'success') throw new Error('No metadata');
      const data = json.data || {};
      const candidate = data.image?.url || data.logo?.url || data.screenshot?.url;
      if (!candidate) throw new Error('No image found');
      // avoid duplicates, then set as cover
      setCoverPhoto(candidate);
    } catch (e) {
      setCoverFetchError(e.message || 'Cover fetch failed');
    } finally {
      setCoverFetchLoading(false);
    }
  };

  // modify addPhotoUrl to clear coverFetchError if new manual photo added
  const addPhotoUrl = (e) => {
    e.preventDefault();
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;
    const warn = validateImageUrl(trimmed);
    setPhotoError(warn);
    setCoverFetchError(null);
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos||[]), { url: trimmed, caption: newPhotoCaption.trim() || '', sourceType: 'external', addedAt: Date.now(), isCover: false }]
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const removePhoto = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const updatePhotoCaption = (idx, value) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map((p,i)=> i===idx? { ...p, caption: value }: p)
    }));
  };

  const movePhoto = (idx, dir) => {
    setFormData(prev => {
      const arr = [...prev.photos];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      const temp = arr[idx];
      arr[idx] = arr[target];
      arr[target] = temp;
      return { ...prev, photos: arr };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const placeData = {
      ...formData,
      ageRange: [formData.ageMin, formData.ageMax],
      photos: formData.photos || [],
      yunsolExperience: formData.yunsolExperience.hasVisited ? formData.yunsolExperience : {
        hasVisited: false,
        rating: null,
        likes: '',
        dislikes: '',
        personalNotes: ''
      }
    };
    
    // Remove temporary fields
    delete placeData.ageMin;
    delete placeData.ageMax;
    
    onSave(placeData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Place Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="icon">Icon (emoji)</label>
        <input
          type="text"
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={handleInputChange}
          placeholder="🏰"
          maxLength="2"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          placeholder="Describe this amazing place..."
          className={styles.textarea}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Main St, City, State"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="website">Website</label>
        <div className={styles.inlineRow}>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className={styles.input}
          />
          <button type="button" className={styles.coverBtn} onClick={fetchCover} disabled={!formData.website || coverFetchLoading}>
            {coverFetchLoading ? 'Fetching...' : 'Fetch Cover'}
          </button>
        </div>
        {coverFetchError && <p className={styles.photoWarning}>⚠ {coverFetchError}</p>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="pricing">Pricing</label>
          <select
            id="pricing"
            name="pricing"
            value={formData.pricing}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="Free">Free</option>
            <option value="$">$ (Under $10)</option>
            <option value="$$">$$ ($10-25)</option>
            <option value="$$$">$$$ ($25+)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Age Range (months)</label>
          <div className={styles.ageRange}>
            <input
              type="number"
              name="ageMin"
              value={formData.ageMin}
              onChange={handleInputChange}
              min="0"
              max="240"
              className={styles.input}
            />
            <span>to</span>
            <input
              type="number"
              name="ageMax"
              value={formData.ageMax}
              onChange={handleInputChange}
              min="0"
              max="240"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Features</label>
        <div className={styles.featureInput}>
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Type a feature and press Enter"
            className={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && addFeature(e)}
          />
          <button type="button" onClick={addFeature} className={styles.addBtn}>
            Add
          </button>
        </div>
        <div className={styles.features}>
          {formData.features.map(feature => (
            <span key={feature} className={styles.feature}>
              {feature}
              <button
                type="button"
                onClick={() => removeFeature(feature)}
                className={styles.removeFeature}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="parkingInfo">Parking Info</label>
        <input
          type="text"
          id="parkingInfo"
          name="parkingInfo"
          value={formData.parkingInfo}
          onChange={handleInputChange}
          placeholder="Free parking available"
          className={styles.input}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="durationOfVisit">Duration of Visit</label>
          <input
            type="text"
            id="durationOfVisit"
            name="durationOfVisit"
            value={formData.durationOfVisit}
            onChange={handleInputChange}
            placeholder="1-3 hours"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="specialNotes">Special Notes</label>
        <textarea
          id="specialNotes"
          name="specialNotes"
          value={formData.specialNotes}
          onChange={handleInputChange}
          placeholder="Any special notes about this place..."
          className={styles.textarea}
        />
      </div>

      {/* Photos Section */}
      <div className={styles.formGroup}>
        <label>Photos (Web Image URLs)</label>
        <div className={styles.photoInputRow}>
          <input
            type="url"
            value={newPhotoUrl}
            onChange={(e)=>setNewPhotoUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={styles.input}
          />
        </div>
        <div className={styles.photoInputRow}>
          <input
            type="text"
            value={newPhotoCaption}
            onChange={(e)=>setNewPhotoCaption(e.target.value)}
            placeholder="Caption (optional)"
            className={styles.input}
          />
          <button type="button" onClick={addPhotoUrl} className={styles.addBtn} disabled={!newPhotoUrl.trim()}>Add</button>
        </div>
        {photoError && <p className={styles.photoWarning}>{photoError}</p>}
        {formData.photos?.length > 0 && (
          <div className={styles.photoGrid}>
            {formData.photos.map((p, idx) => (
              <div key={idx} className={styles.photoItem}>
                <div className={styles.photoThumbWrapper}>
                  <img src={p.url} alt={p.caption || `Photo ${idx+1}`} className={styles.photoThumb + (p.isCover? ' '+styles.coverBorder:'')} onError={(e)=>{e.currentTarget.classList.add(styles.broken)}} />
                  {p.isCover && <span className={styles.coverBadge}>Cover</span>}
                </div>
                <input
                  type="text"
                  value={p.caption}
                  placeholder="Caption"
                  onChange={(e)=>updatePhotoCaption(idx, e.target.value)}
                  className={styles.inputSmall}
                />
                <div className={styles.photoActions}>
                  <button type="button" onClick={()=>movePhoto(idx,-1)} disabled={idx===0} className={styles.photoMoveBtn}>↑</button>
                  <button type="button" onClick={()=>movePhoto(idx,1)} disabled={idx===formData.photos.length-1} className={styles.photoMoveBtn}>↓</button>
                  <button type="button" onClick={()=>removePhoto(idx)} className={styles.removeFeature} title="Remove">×</button>
                  {!p.isCover && <button type="button" className={styles.photoMoveBtn} onClick={()=>setCoverPhoto(idx)}>★</button>}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className={styles.helpText}>Images are hot-linked. Ensure you have permission to use them. Prefer reasonably small files (&lt;500KB).</p>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="yunsol.hasVisited"
              checked={formData.yunsolExperience.hasVisited}
              onChange={handleInputChange}
            />
            Yunsol has visited this place
          </label>
        </div>
        
        {formData.yunsolExperience.hasVisited && (
          <div className={styles.experienceDetails}>
            <div className={styles.formGroup}>
              <label htmlFor="yunsolRating">Rating (1-3 stars)</label>
              <select
                id="yunsolRating"
                name="yunsol.rating"
                value={formData.yunsolExperience.rating}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="1">⭐ (1 star)</option>
                <option value="2">⭐⭐ (2 stars)</option>
                <option value="3">⭐⭐⭐ (3 stars)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="yunsolLikes">What Yunsol Likes</label>
              <textarea
                id="yunsolLikes"
                name="yunsol.likes"
                value={formData.yunsolExperience.likes}
                onChange={handleInputChange}
                placeholder="What does Yunsol love about this place?"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="yunsolDislikes">What Yunsol Dislikes</label>
              <textarea
                id="yunsolDislikes"
                name="yunsol.dislikes"
                value={formData.yunsolExperience.dislikes}
                onChange={handleInputChange}
                placeholder="What could be better for Yunsol?"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="yunsolNotes">Personal Notes</label>
              <textarea
                id="yunsolNotes"
                name="yunsol.personalNotes"
                value={formData.yunsolExperience.personalNotes}
                onChange={handleInputChange}
                placeholder="Any additional notes about Yunsol's experience..."
                className={styles.textarea}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>
          💾 Save Place
        </button>
        <button type="button" onClick={onCancel} className={styles.btn}>
          ❌ Cancel
        </button>
        {onDelete && (
          <button 
            type="button" 
            onClick={onDelete} 
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            🗑️ Delete Place
          </button>
        )}
      </div>
    </form>
  );
};

export default PlaceForm;
