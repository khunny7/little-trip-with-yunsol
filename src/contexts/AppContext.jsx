import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createOrUpdateUserRecord } from '../utils/userManager';
import { getUserPreferences, getUserPreferenceStats, toggleUserAction, USER_ACTIONS } from '../utils/userPreferences';
import { isPWA, getLocalPreferences, setLocalPreferences, toggleLocalAction } from '../utils/localPrefs';
import { getPlaces, getTips } from '../data/dataService';
import { AppContext } from './context';

// App Provider component
export const AppProvider = ({ children }) => {
  // Core app state
  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [optimisticPreferences, setOptimisticPreferences] = useState(null);
  const [pendingActions, setPendingActions] = useState({});
  const [userStats, setUserStats] = useState({ liked: 0, hidden: 0, pinned: 0 });
  
  // Loading states
  const [loading, setLoading] = useState({
    auth: true,
    places: true,
    tips: true,
    userPreferences: false
  });
  
  // Error states
  const [error, setError] = useState({
    auth: null,
    places: null,
    tips: null,
    userPreferences: null
  });

  // Helper function to update loading state
  const updateLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to update error state
  const updateError = useCallback((key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  }, []);

  // Load places data
  const loadPlaces = useCallback(async () => {
    try {
      updateLoading('places', true);
      updateError('places', null);
      
      const placesData = await getPlaces();
      setPlaces(placesData);
    } catch (err) {
      console.error('Error loading places:', err);
      updateError('places', 'Failed to load places data');
    } finally {
      updateLoading('places', false);
    }
  }, [updateLoading, updateError]);

  // Load tips data
  const loadTips = useCallback(async () => {
    try {
      updateLoading('tips', true);
      updateError('tips', null);
      
      const tipsData = await getTips();
      setTips(tipsData);
    } catch (err) {
      console.error('Error loading tips:', err);
      updateError('tips', 'Failed to load tips data');
    } finally {
      updateLoading('tips', false);
    }
  }, [updateLoading, updateError]);

  // Load user preferences (localStorage for not-signed-in, Firebase for signed-in)
  const loadUserPreferences = useCallback(async (userId) => {
    if (!userId) {
      // Use localStorage for anonymous users (web or PWA)
      const preferences = getLocalPreferences();
      const stats = getUserPreferenceStats(preferences);
      setUserPreferences(preferences);
      setUserStats(stats);
      setOptimisticPreferences(preferences);
      return;
    }
    try {
      updateLoading('userPreferences', true);
      updateError('userPreferences', null);
      const preferences = await getUserPreferences(userId);
      const stats = getUserPreferenceStats(preferences);
      setUserPreferences(preferences);
      setUserStats(stats);
      setOptimisticPreferences(preferences);
    } catch (err) {
      console.error('Error loading user preferences:', err);
      updateError('userPreferences', 'Failed to load user preferences');
    } finally {
      updateLoading('userPreferences', false);
    }
  }, [updateLoading, updateError]);

  // Refresh user preferences (for after user actions)
  const refreshUserPreferences = useCallback(async () => {
    if (user?.uid) {
      await loadUserPreferences(user.uid);
    }
  }, [user, loadUserPreferences]);

  // Refresh places data
  const refreshPlaces = useCallback(async () => {
    await loadPlaces();
  }, [loadPlaces]);

  // Refresh tips data
  const refreshTips = useCallback(async () => {
    await loadTips();
  }, [loadTips]);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        updateLoading('auth', true);
        updateError('auth', null);
        
        if (firebaseUser) {
          // Create or update user record
          const userData = await createOrUpdateUserRecord(firebaseUser);
          const enhancedUser = { ...firebaseUser, ...userData };
          setUser(enhancedUser);
          // Load user preferences
          await loadUserPreferences(firebaseUser.uid);
        } else {
          setUser(null);
          // Immediately load local preferences for signed-out state
          const preferences = getLocalPreferences();
          const stats = getUserPreferenceStats(preferences);
          setUserPreferences(preferences);
          setOptimisticPreferences(preferences);
          setUserStats(stats);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        updateError('auth', 'Authentication error');
      } finally {
        updateLoading('auth', false);
      }
    });

    return () => unsubscribe();
  }, [loadUserPreferences, updateLoading, updateError]);

  // Load initial data
  useEffect(() => {
    loadPlaces();
    loadTips();
  }, [loadPlaces, loadTips]);

  // Keep optimistic prefs in sync when no pending actions
  useEffect(()=>{
    if (userPreferences && Object.keys(pendingActions).length===0){
      setOptimisticPreferences(userPreferences);
    }
  },[userPreferences, pendingActions]);

  // Optimistic toggle (localStorage for not-signed-in, Firebase for signed-in)
  const optimisticToggle = useCallback(async (placeId, actionType) => {
    if (!user?.uid) {
      // Use localStorage for anonymous users (web or PWA)
      const fieldMap = { [USER_ACTIONS.LIKE]: 'liked', [USER_ACTIONS.HIDE]: 'hidden', [USER_ACTIONS.PIN]: 'pinned' };
      const field = fieldMap[actionType]; if (!field) return;
      const newPrefs = toggleLocalAction(placeId, field);
      setOptimisticPreferences(newPrefs);
      setUserPreferences(newPrefs);
      setUserStats(getUserPreferenceStats(newPrefs));
      return;
    }
    const fieldMap = { [USER_ACTIONS.LIKE]: 'liked', [USER_ACTIONS.HIDE]: 'hidden', [USER_ACTIONS.PIN]: 'pinned' };
    const field = fieldMap[actionType]; if (!field) return;
    setOptimisticPreferences(prev => {
      if (!prev) return prev;
      const set = new Set(prev[field]||[]);
      if (set.has(placeId)) set.delete(placeId); else set.add(placeId);
      return { ...prev, [field]: Array.from(set) };
    });
    const key = `${placeId}:${actionType}`;
    setPendingActions(p=> ({...p, [key]:true}));
    try {
      await toggleUserAction(placeId, actionType);
      await refreshUserPreferences();
    } catch(e){
      console.error('Optimistic toggle failed', e);
      await refreshUserPreferences();
    } finally {
      setPendingActions(p=> { const c={...p}; delete c[key]; return c; });
    }
  },[user, refreshUserPreferences]);

  // Computed values
  const isAuthenticated = !!user;
  const isInitialLoading = loading.auth || loading.places || loading.tips;
  const hasErrors = Object.values(error).some(err => err !== null);

  // Context value
  const contextValue = {
    // Core data
    user,
    places,
    tips,
  userPreferences,
  optimisticPreferences,
    userStats,
    
    // State flags
    isAuthenticated,
    isInitialLoading,
    hasErrors,
    loading,
    error,
    
    // Actions
  refreshUserPreferences,
    refreshPlaces,
    refreshTips,
    loadUserPreferences,
  optimisticToggle,
  pendingActions,
    
    // Helper functions
    updateLoading,
    updateError
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
