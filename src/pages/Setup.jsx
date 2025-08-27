import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signInWithGoogleSmart } from '../utils/authHelpers';
import { createOrUpdateUserRecord } from '../utils/userManager';
import styles from './Setup.module.css';

function Setup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setStatus({ message: 'Signing in with Google...', type: 'loading' });
    try {
      const result = await signInWithGoogleSmart(auth);
      if (!result) return; // redirect flow; result handled on return
      const user = result.user;
      await createOrUpdateUserRecord(user, { isAdmin: true, createdVia: 'google-setup' });
      setStatus({ message: 'Google Sign-in successful!', type: 'success' });
      navigate('/admin-panel');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setStatus({ message: `Google Sign-in failed: ${error.message}`, type: 'error' });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupBox}>
        <div className={styles.setupHeader}>
          <h1>🔐 Admin Setup</h1>
          <p>Sign in with Google to create your admin account</p>
        </div>

        <div className={styles.note}>
          <strong>📋 Setup Instructions:</strong><br />
          1. Click "Continue with Google"<br />
          2. Grant admin to the first user in Firestore if needed<br />
          3. Remove this setup route in production
        </div>

        {status.message && (
          <div className={status.type === 'error' ? styles.error : styles.success}>
            {status.message}
          </div>
        )}

        <div className={styles.setupForm}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className={`${styles.submitButton} ${styles.googleButton}`}
          >
            {isGoogleSigningIn ? 'Signing in...' : '🚀 Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setup;
