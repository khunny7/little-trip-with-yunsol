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
    yunsolExperience: {
      hasVisited: false,
      rating: 3,
      likes: '',
      dislikes: '',
      personalNotes: ''
    }
  });
  
  const [newFeature, setNewFeature] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const placeData = {
      ...formData,
      ageRange: [formData.ageMin, formData.ageMax],
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
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://example.com"
          className={styles.input}
        />
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
