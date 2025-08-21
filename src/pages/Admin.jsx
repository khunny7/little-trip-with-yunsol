import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createOrUpdateUserRecord } from '../utils/userManager';
import AdminPanel from '../components/AdminPanel';
import AdminStatusChecker from '../components/AdminStatusChecker';
import styles from './Admin.module.css';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsLogging(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLogging(true);
    setLoginError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsGoogleLogging(false);
    }
  };

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

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
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <button 
              type="submit" 
              disabled={isLogging}
              className={styles.loginButton}
            >
              {isLogging ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className={styles.divider}>
              <span>or</span>
            </div>
            
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLogging}
              className={`${styles.loginButton} ${styles.googleButton}`}
            >
              {isGoogleLogging ? 'Signing in...' : '🚀 Sign in with Google'}
            </button>
          </form>
          
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
