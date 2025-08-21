// Custom hook for user authentication and state management
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createOrUpdateUserRecord } from '../utils/userManager';
import { getAllUserActions } from '../utils/userActions';

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
          
          // Load user actions
          const actions = await getAllUserActions(firebaseUser.uid);
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
        const actions = await getAllUserActions(user.uid);
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
