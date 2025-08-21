// User Actions Service - Handle likes, dislikes, and pins
import { auth, db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';

// User action types
export const USER_ACTIONS = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  PIN: 'pin'
};

/**
 * Get user's action for a specific place
 * @param {string} placeId - The place ID
 * @param {string} userId - The user ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} - User actions for the place
 */
export const getUserActionsForPlace = async (placeId, userId = null) => {
  const currentUserId = userId || auth.currentUser?.uid;
  if (!currentUserId) return null;

  try {
    const actionRef = doc(db, 'userActions', `${currentUserId}_${placeId}`);
    const actionDoc = await getDoc(actionRef);
    
    if (actionDoc.exists()) {
      return actionDoc.data();
    }
    
    return {
      userId: currentUserId,
      placeId,
      liked: false,
      disliked: false,
      pinned: false,
      createdAt: null,
      updatedAt: null
    };
  } catch (error) {
    console.error('Error getting user actions:', error);
    return null;
  }
};

/**
 * Get all user actions for the current user
 * @param {string} userId - The user ID (optional, uses current user if not provided)
 * @returns {Promise<Array>} - Array of all user actions
 */
export const getAllUserActions = async (userId = null) => {
  const currentUserId = userId || auth.currentUser?.uid;
  if (!currentUserId) return [];

  try {
    const actionsQuery = query(
      collection(db, 'userActions'),
      where('userId', '==', currentUserId)
    );
    
    const querySnapshot = await getDocs(actionsQuery);
    const actions = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      actions[data.placeId] = data;
    });
    
    return actions;
  } catch (error) {
    console.error('Error getting all user actions:', error);
    return {};
  }
};

/**
 * Set user action for a place (like, dislike, or pin)
 * @param {string} placeId - The place ID
 * @param {string} actionType - The action type (like, dislike, pin)
 * @param {boolean} value - True to set action, false to remove
 * @returns {Promise<boolean>} - Success status
 */
export const setUserAction = async (placeId, actionType, value) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be logged in to perform this action');
  }

  try {
    const actionRef = doc(db, 'userActions', `${userId}_${placeId}`);
    const existingDoc = await getDoc(actionRef);
    
    const now = new Date().toISOString();
    let actionData;
    
    if (existingDoc.exists()) {
      // Update existing document
      actionData = existingDoc.data();
      
      // Handle mutual exclusivity for like/dislike
      if (actionType === USER_ACTIONS.LIKE && value) {
        actionData.liked = true;
        actionData.disliked = false; // Remove dislike if setting like
      } else if (actionType === USER_ACTIONS.DISLIKE && value) {
        actionData.disliked = true;
        actionData.liked = false; // Remove like if setting dislike
      } else if (actionType === USER_ACTIONS.PIN) {
        actionData.pinned = value;
      } else {
        // Removing an action
        actionData[actionType === USER_ACTIONS.LIKE ? 'liked' : 
                   actionType === USER_ACTIONS.DISLIKE ? 'disliked' : 'pinned'] = false;
      }
      
      actionData.updatedAt = now;
      
      await updateDoc(actionRef, actionData);
    } else {
      // Create new document
      actionData = {
        userId,
        placeId,
        liked: actionType === USER_ACTIONS.LIKE ? value : false,
        disliked: actionType === USER_ACTIONS.DISLIKE ? value : false,
        pinned: actionType === USER_ACTIONS.PIN ? value : false,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(actionRef, actionData);
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
  const currentActions = await getUserActionsForPlace(placeId);
  if (!currentActions) return false;
  
  let currentValue;
  switch (actionType) {
    case USER_ACTIONS.LIKE:
      currentValue = currentActions.liked;
      break;
    case USER_ACTIONS.DISLIKE:
      currentValue = currentActions.disliked;
      break;
    case USER_ACTIONS.PIN:
      currentValue = currentActions.pinned;
      break;
    default:
      return false;
  }
  
  const newValue = !currentValue;
  await setUserAction(placeId, actionType, newValue);
  return newValue;
};

/**
 * Get places filtered by user actions
 * @param {Array} places - Array of places
 * @param {Object} userActions - User actions object
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered places
 */
export const filterPlacesByUserActions = (places, userActions, filters) => {
  if (!userActions || Object.keys(userActions).length === 0) {
    return places;
  }
  
  return places.filter(place => {
    const placeActions = userActions[place.id];
    if (!placeActions) return true;
    
    // Apply user action filters
    if (filters.likedOnly && !placeActions.liked) return false;
    if (filters.pinnedOnly && !placeActions.pinned) return false;
    if (filters.hideDisliked && placeActions.disliked) return false;
    
    return true;
  });
};

/**
 * Get statistics about user actions
 * @param {Object} userActions - User actions object
 * @returns {Object} - Statistics
 */
export const getUserActionStats = (userActions) => {
  if (!userActions) return { liked: 0, disliked: 0, pinned: 0 };
  
  const stats = { liked: 0, disliked: 0, pinned: 0 };
  
  Object.values(userActions).forEach(action => {
    if (action.liked) stats.liked++;
    if (action.disliked) stats.disliked++;
    if (action.pinned) stats.pinned++;
  });
  
  return stats;
};
