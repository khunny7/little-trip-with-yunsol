import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signInWithGoogleSmart } from '../utils/authHelpers';
import { createOrUpdateUserRecord } from '../utils/userManager';
import AdminPanel from '../components/AdminPanel';
import AdminStatusChecker from '../components/AdminStatusChecker';
import styles from './Admin.module.css';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isGoogleLogging, setIsGoogleLogging] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Create or update user record when they sign in
        try {
          await createOrUpdateUserRecord(user);
        } catch (error) {
          console.error('Error creating user record:', error);
        }
        
        // Redirect to admin panel
        navigate('/admin-panel');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Email/password sign-in removed; only Google is supported

  const handleGoogleSignIn = async () => {
    setIsGoogleLogging(true);
    setLoginError('');
    
    try {
      await signInWithGoogleSmart(auth);
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        errorMessage = 'Google Sign-In not supported here. Use email sign-in instead.';
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsGoogleLogging(false);
    }
  };

  // No inputs to handle

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginHeader}>
            <h1>🏰 Little Trip Admin</h1>
            <p>Please sign in to manage places</p>
          </div>
          <div className={styles.loginForm}>
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLogging}
              className={`${styles.loginButton} ${styles.googleButton}`}
            >
              {isGoogleLogging ? 'Signing in...' : '🚀 Sign in with Google'}
            </button>
          </div>
          
          {loginError && (
            <div className={styles.error}>
              {loginError}
            </div>
          )}
          
          <AdminStatusChecker />
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect will happen in useEffect
  return null;
};

export default Admin;
