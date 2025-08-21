import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createOrUpdateUserRecord } from '../utils/userManager';
import { Link } from 'react-router-dom';
import styles from './Setup.module.css';

function Setup() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setStatus({ message: 'Signing in with Google...', type: 'loading' });
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user record (as first user, make them admin)
      await createOrUpdateUserRecord(user, { 
        isAdmin: true, // Make first user admin automatically
        createdVia: 'google-setup'
      });
      
      console.log('Google Sign-in successful:', user);
      setStatus({ message: 'Google Sign-in successful!', type: 'success' });
      
      // Redirect to admin or handle successful authentication
      navigate('/admin-panel');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setStatus({ 
        message: `Google Sign-in failed: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({ message: 'Passwords do not match!', type: 'error' });
      return;
    }

    setIsCreating(true);
    setStatus({ message: '', type: '' });

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Create user record in users collection (as first user, make them admin)
      await createOrUpdateUserRecord(user, { 
        isAdmin: true, // Make first user admin automatically
        createdVia: 'setup-page'
      });
      
      setStatus({ 
        message: `Admin account created successfully! Redirecting to admin panel...`, 
        type: 'success' 
      });
      setFormData({ email: '', password: '', confirmPassword: '' });
      
      // Redirect to admin panel after successful account creation
      setTimeout(() => {
        navigate('/admin-panel');
      }, 2000);
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setStatus({ message: `Failed to create account: ${errorMessage}`, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupBox}>
        <div className={styles.setupHeader}>
          <h1>🔐 Admin Setup</h1>
          <p>Create your admin account for Little Trip</p>
        </div>
        
        <div className={styles.note}>
          <strong>📋 Setup Instructions:</strong><br />
          1. Enter your email and a secure password<br />
          2. Click "Create Admin Account"<br />
          3. Once created, you can access the admin panel<br />
          4. For security, remove this setup route in production
        </div>

        <form onSubmit={handleSubmit} className={styles.setupForm}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Admin Password (min 6 characters)"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
            className={styles.input}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            minLength="6"
            className={styles.input}
          />
          <button 
            type="submit" 
            disabled={isCreating}
            className={styles.setupButton}
          >
            {isCreating ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
        
        <div className={styles.divider}>or</div>
        
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSigningIn}
          className={styles.googleButton}
        >
          {isGoogleSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        {status.message && (
          <div className={`${styles.status} ${styles[status.type]}`}>
            {status.message}
          </div>
        )}
        
        <div className={styles.links}>
          <Link to="/admin">Go to Admin Panel</Link> | 
          <Link to="/">Back to Site</Link>
        </div>
      </div>
    </div>
  );
};

export default Setup;
