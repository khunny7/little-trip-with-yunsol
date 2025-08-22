// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Configure auth settings for better development experience
auth.settings = {
  appVerificationDisabledForTesting: false,
};

export default app;
