import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import styles from './UserAuth.module.css';

const UserAuth = ({ user, onClose, className = '' }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose && onClose();
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose && onClose();
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('Email already in use');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError('Authentication failed');
      }
      console.error('Email auth error:', error);
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
          <div className={styles.userAvatar}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
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
        <h3>{isSignUp ? 'Create Account' : 'Sign In'}</h3>
        <p>Sign in to like places and plan your visits!</p>
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

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <form onSubmit={handleEmailAuth} className={styles.emailForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.emailButton}`}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className={styles.toggleAuth}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className={styles.linkButton}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default UserAuth;
