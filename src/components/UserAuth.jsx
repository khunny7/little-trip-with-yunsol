import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import Avatar from './Avatar';
import styles from './UserAuth.module.css';
import { signInWithGoogleSmart } from '../utils/authHelpers';

const UserAuth = ({ user, onClose, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogleSmart(auth);
      if (result) onClose && onClose();
    } catch (error) {
      // Check if it's a popup blocked error and suggest alternatives
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        setError('Popup was blocked. Please enable popups for this site or try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        setError('Google Sign-In not supported in this environment. Try the email option.');
      } else {
        setError('Failed to sign in with Google');
      }
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onClose && onClose();
    } catch (error) {
      setError('Failed to sign out');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    // User is signed in - show user info and sign out
    return (
      <div className={`${styles.authContainer} ${className}`}>
        <div className={styles.userInfo}>
          <Avatar 
            src={user.photoURL}
            alt="Profile"
            size="large"
            fallbackInitials={user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            className={styles.userAvatar}
          />
          <div className={styles.userDetails}>
            <div className={styles.userName}>
              {user.displayName || 'User'}
            </div>
            <div className={styles.userEmail}>
              {user.email}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          disabled={loading}
          className={`${styles.button} ${styles.signOutButton}`}
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  // User is not signed in - show sign in/up form
  return (
    <div className={`${styles.authContainer} ${className}`}>
      <div className={styles.authHeader}>
  <h3>Sign In</h3>
  <p>Sign in with Google to like places and plan your visits!</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`${styles.button} ${styles.googleButton}`}
      >
        {loading ? (
          'Signing in...'
        ) : (
          <>
            <span className={styles.googleIcon}>🚀</span>
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
};

export default UserAuth;
