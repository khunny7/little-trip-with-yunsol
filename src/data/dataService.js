// Data utility functions for managing places and tips
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

/**
 * Get all places from the data source
 * @returns {Promise<Array>} Array of places
 */
export const getPlaces = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'places'));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error loading places:', error);
    // Fallback to JSON file for development
    try {
      const response = await import('./places.json');
      return response.default.places || [];
    } catch (fallbackError) {
      console.error('Error loading fallback places:', fallbackError);
      return [];
    }
  }
};

/**
 * Get all tips from the data source
 * @returns {Promise<Array>} Array of tips
 */
export const getTips = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tips'));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error loading tips:', error);
    // Fallback to JSON file for development
    try {
      const response = await import('./places.json');
      return response.default.tips || [];
    } catch (fallbackError) {
      console.error('Error loading fallback tips:', fallbackError);
      return [];
    }
  }
};

/**
 * Get a place by ID
 * @param {string|number} id - The place ID (can be string for Firebase or number for JSON)
 * @returns {Promise<Object|null>} Place object or null if not found
 */
export const getPlaceById = async (id) => {
  try {
    // Try Firebase first
    const docRef = doc(db, 'places', String(id));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error('Error loading place from Firebase:', error);
  }
  
  // Fallback to JSON file for development
  try {
    const places = await getPlaces();
    // Handle both string and numeric IDs
    return places.find(place => 
      place.id === id || 
      place.id === parseInt(id) || 
      String(place.id) === String(id)
    ) || null;
  } catch (fallbackError) {
    console.error('Error loading fallback place:', fallbackError);
    return null;
  }
};

/**
 * Filter places by features
 * @param {Array<string>} features - Features to filter by
 * @returns {Promise<Array>} Filtered array of places
 */
export const getPlacesByFeatures = async (features) => {
  try {
    // For Firebase, we'll get all places and filter client-side
    // In a more advanced setup, you could use Firebase queries with array-contains
    const places = await getPlaces();
    return places.filter(place => 
      features.some(feature => 
        place.features && place.features.some(placeFeature => 
          placeFeature.toLowerCase().includes(feature.toLowerCase())
        )
      )
    );
  } catch (error) {
    console.error('Error filtering places:', error);
    return [];
  }
};

/**
 * Filter places by age range
 * @param {Array<number>} ageRange - Age range [min, max] in months
 * @returns {Promise<Array>} Filtered array of places
 */
export const getPlacesByAge = async (ageRange) => {
  try {
    const places = await getPlaces();
    const [minAge, maxAge] = ageRange;
    
    return places.filter(place => {
      if (!place.ageRange || !Array.isArray(place.ageRange)) return false;
      const [placeMin, placeMax] = place.ageRange;
      // Check if there's any overlap between the requested range and place range
      return minAge <= placeMax && maxAge >= placeMin;
    });
  } catch (error) {
    console.error('Error filtering places by age:', error);
    return [];
  }
};

/**
 * Add a new place (for future admin functionality)
 * @param {Object} newPlace - New place object
 * @returns {Promise<string|boolean>} Document ID on success, false on failure
 */
export const addPlace = async (newPlace) => {
  try {
    const docRef = await addDoc(collection(db, 'places'), newPlace);
    return docRef.id;
  } catch (error) {
    console.error('Error adding place:', error);
    return false;
  }
};

/**
 * Update an existing place (for future admin functionality)
 * @param {string} id - Place ID to update
 * @param {Object} updatedPlace - Updated place data
 * @returns {Promise<boolean>} Success status
 */
export const updatePlace = async (id, updatedPlace) => {
  try {
    const docRef = doc(db, 'places', id);
    await updateDoc(docRef, updatedPlace);
    return true;
  } catch (error) {
    console.error('Error updating place:', error);
    return false;
  }
};

/**
 * Delete a place (for future admin functionality)
 * @param {string} id - Place ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePlace = async (id) => {
  try {
    const docRef = doc(db, 'places', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting place:', error);
    return false;
  }
};
