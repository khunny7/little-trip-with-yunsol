// Custom hook for user authentication and state management
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createOrUpdateUserRecord } from '../utils/userManager';
import { getUserPreferences, convertToLegacyFormat } from '../utils/userPreferences';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userActions, setUserActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);
        
        if (firebaseUser) {
          // Create or update user record
          const userData = await createOrUpdateUserRecord(firebaseUser);
          setUser({ ...firebaseUser, ...userData });
          
          // Load user preferences and convert to legacy format for compatibility
          const preferences = await getUserPreferences(firebaseUser.uid);
          const actions = convertToLegacyFormat(preferences);
          setUserActions(actions);
        } else {
          setUser(null);
          setUserActions({});
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUserActions = async () => {
    if (user) {
      try {
        const preferences = await getUserPreferences(user.uid);
        const actions = convertToLegacyFormat(preferences);
        setUserActions(actions);
      } catch (err) {
        console.error('Error refreshing user actions:', err);
      }
    }
  };

  return {
    user,
    userActions,
    loading,
    error,
    refreshUserActions,
    isAuthenticated: !!user
  };
};
