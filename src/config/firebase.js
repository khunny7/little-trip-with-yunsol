// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, getRedirectResult } from 'firebase/auth';

// Your web app's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnQjPVoVjKsK8ZJpywV5P9iSujdaOyUa0",
  authDomain: "little-trip-with-yunsol-43695.firebaseapp.com", 
  projectId: "little-trip-with-yunsol-43695",
  storageBucket: "little-trip-with-yunsol-43695.firebasestorage.app",
  messagingSenderId: "124206106338",
  appId: "1:124206106338:web:c65f2979f9cb4a66a3c0bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Ensure persistence works in embedded/packaged browsers
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Non-fatal; fallback to default behavior if persistence cannot be set
});

// Consume redirect results early so UI can react after a redirect-based sign-in
getRedirectResult(auth)
  .then((result) => {
    // If sign-in succeeded via redirect, auth state will change; optionally notify listeners/UI
    if (result?.user) {
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('auth')
          bc.postMessage({ type: 'redirect-complete' })
          bc.close()
        }
      } catch {
        // Best-effort broadcast only; safe to ignore failures
      }
    }
  })
  .catch(() => {
    // Ignore if no redirect result or errors not relevant here
  });

// Configure auth settings for better development experience
auth.settings = {
  appVerificationDisabledForTesting: false,
};

export default app;
