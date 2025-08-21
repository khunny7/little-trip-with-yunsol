// User Management Utilities for Firebase
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Create or update user record when they sign in
export const createOrUpdateUserRecord = async (user, additionalData = {}) => {
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if user already exists
    const userDoc = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      lastSignIn: new Date().toISOString(),
      ...additionalData
    };

    if (userDoc.exists()) {
      // Update existing user with last sign-in time
      await updateDoc(userRef, {
        lastSignIn: userData.lastSignIn,
        emailVerified: userData.emailVerified,
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
      console.log(`User record updated for: ${user.email}`);
    } else {
      // Create new user record with default non-admin status
      await setDoc(userRef, {
        ...userData,
        isAdmin: false, // Default to non-admin
        createdAt: new Date().toISOString(),
        provider: user.providerData[0]?.providerId || 'email'
      });
      console.log(`New user record created for: ${user.email}`);
    }

    return userData;
  } catch (error) {
    console.error('Error creating/updating user record:', error);
    throw error;
  }
};

// Check if current user is admin
export const isCurrentUserAdmin = async () => {
  if (!auth.currentUser) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    return userDoc.exists() && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Get all admin users
export const getAdminUsers = async () => {
  try {
    const adminsQuery = query(collection(db, 'users'), where('isAdmin', '==', true));
    const adminsSnapshot = await getDocs(adminsQuery);
    const admins = [];
    adminsSnapshot.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() });
    });
    return admins;
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
};

// Make user admin (admin only operation)
export const makeUserAdmin = async (userId, isAdmin = true) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin,
      adminUpdatedAt: new Date().toISOString(),
      adminUpdatedBy: auth.currentUser?.uid || 'system'
    });
    console.log(`User ${userId} admin status updated to: ${isAdmin}`);
    return true;
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
