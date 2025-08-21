// User Preferences Service - Handle user preferences with array-based structure
import { auth, db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// User action types
export const USER_ACTIONS = {
  LIKE: 'like',
  HIDE: 'hide',
  PIN: 'pin'
};

/**
 * Get user preferences document
 * @param {string} userId - The user ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} - User preferences object
 */
export const getUserPreferences = async (userId = null) => {
  const currentUserId = userId || auth.currentUser?.uid;
  if (!currentUserId) return null;

  try {
    const preferencesRef = doc(db, 'userPreferences', currentUserId);
    const preferencesDoc = await getDoc(preferencesRef);
    
    if (preferencesDoc.exists()) {
      return preferencesDoc.data();
    }
    
    // Return default structure if document doesn't exist
    return {
      userId: currentUserId,
      liked: [],
      hidden: [],
      pinned: [],
      createdAt: null,
      updatedAt: null
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

/**
 * Check if a place has a specific action
 * @param {string} placeId - The place ID
 * @param {string} actionType - The action type (like, hide, pin)
 * @param {Object} preferences - User preferences object (optional, will fetch if not provided)
 * @returns {Promise<boolean>} - Whether the place has the action
 */
export const hasPlaceAction = async (placeId, actionType, preferences = null) => {
  if (!preferences) {
    preferences = await getUserPreferences();
  }
  
  if (!preferences) return false;
  
  // Map action types to field names
  const fieldName = actionType === USER_ACTIONS.LIKE ? 'liked' : 
                   actionType === USER_ACTIONS.HIDE ? 'hidden' : 
                   actionType === USER_ACTIONS.PIN ? 'pinned' : actionType;
  
  const actionArray = preferences[fieldName] || [];
  return actionArray.includes(placeId);
};

/**
 * Get all actions for a specific place
 * @param {string} placeId - The place ID
 * @param {Object} preferences - User preferences object (optional, will fetch if not provided)
 * @returns {Promise<Object>} - Object with liked, hidden, pinned boolean values
 */
export const getPlaceActions = async (placeId, preferences = null) => {
  if (!preferences) {
    preferences = await getUserPreferences();
  }
  
  if (!preferences) {
    return { liked: false, hidden: false, pinned: false };
  }
  
  return {
    liked: (preferences.liked || []).includes(placeId),
    hidden: (preferences.hidden || []).includes(placeId),
    pinned: (preferences.pinned || []).includes(placeId)
  };
};

/**
 * Set user action for a place
 * @param {string} placeId - The place ID
 * @param {string} actionType - The action type (like, hide, pin)
 * @param {boolean} value - True to add action, false to remove
 * @returns {Promise<boolean>} - Success status
 */
export const setUserAction = async (placeId, actionType, value) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be logged in to perform this action');
  }

  try {
    const preferencesRef = doc(db, 'userPreferences', userId);
    const existingDoc = await getDoc(preferencesRef);
    
    const now = new Date().toISOString();
    
    if (existingDoc.exists()) {
      // Update existing document
      const updateData = {
        updatedAt: now
      };
      
      // Map action types to field names
      const fieldName = actionType === USER_ACTIONS.LIKE ? 'liked' : 
                       actionType === USER_ACTIONS.HIDE ? 'hidden' : 
                       actionType === USER_ACTIONS.PIN ? 'pinned' : actionType;
      
      if (value) {
        // Add placeId to the action array
        updateData[fieldName] = arrayUnion(placeId);
      } else {
        // Remove placeId from the action array
        updateData[fieldName] = arrayRemove(placeId);
      }
      
      await updateDoc(preferencesRef, updateData);
    } else {
      // Create new document
      const preferencesData = {
        userId,
        liked: actionType === USER_ACTIONS.LIKE && value ? [placeId] : [],
        hidden: actionType === USER_ACTIONS.HIDE && value ? [placeId] : [],
        pinned: actionType === USER_ACTIONS.PIN && value ? [placeId] : [],
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(preferencesRef, preferencesData);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting user action:', error);
    throw error;
  }
};

/**
 * Toggle user action (convenience method)
 * @param {string} placeId - The place ID
 * @param {string} actionType - The action type
 * @returns {Promise<boolean>} - New state of the action
 */
export const toggleUserAction = async (placeId, actionType) => {
  const currentValue = await hasPlaceAction(placeId, actionType);
  const newValue = !currentValue;
  await setUserAction(placeId, actionType, newValue);
  return newValue;
};

/**
 * Get places filtered by user preferences
 * @param {Array} places - Array of places
 * @param {Object} preferences - User preferences object
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered places
 */
export const filterPlacesByUserPreferences = (places, preferences, filters) => {
  if (!preferences) {
    return places;
  }
  
  const likedPlaces = preferences.liked || [];
  const hiddenPlaces = preferences.hidden || [];
  const pinnedPlaces = preferences.pinned || [];
  
  return places.filter(place => {
    // Apply user action filters
    if (filters.likedOnly && !likedPlaces.includes(place.id)) return false;
    if (filters.pinnedOnly && !pinnedPlaces.includes(place.id)) return false;
    if (filters.hideHidden && hiddenPlaces.includes(place.id)) return false;
    
    return true;
  });
};

/**
 * Get statistics about user preferences
 * @param {Object} preferences - User preferences object
 * @returns {Object} - Statistics
 */
export const getUserPreferenceStats = (preferences) => {
  if (!preferences) return { liked: 0, hidden: 0, pinned: 0 };
  
  return {
    liked: (preferences.liked || []).length,
    hidden: (preferences.hidden || []).length,
    pinned: (preferences.pinned || []).length
  };
};

/**
 * Convert user preferences to legacy format for compatibility
 * @param {Object} preferences - User preferences object
 * @returns {Object} - Legacy format object
 */
export const convertToLegacyFormat = (preferences) => {
  if (!preferences) return {};
  
  const legacyActions = {};
  const allPlaceIds = new Set([
    ...(preferences.liked || []),
    ...(preferences.hidden || []),
    ...(preferences.pinned || [])
  ]);
  
  allPlaceIds.forEach(placeId => {
    legacyActions[placeId] = {
      userId: preferences.userId,
      placeId,
      liked: (preferences.liked || []).includes(placeId),
      hidden: (preferences.hidden || []).includes(placeId),
      pinned: (preferences.pinned || []).includes(placeId)
    };
  });
  
  return legacyActions;
};
