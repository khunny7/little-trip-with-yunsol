import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AdminStatusChecker = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        try {
          const adminDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          setIsAdmin(adminDoc.exists() && adminDoc.data()?.isAdmin === true);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    // Check immediately
    checkAdminStatus();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(checkAdminStatus);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Checking admin status...</div>;
  }

  return (
    <div style={{ 
      padding: '10px', 
      margin: '10px', 
      border: '1px solid #ddd', 
      borderRadius: '5px',
      backgroundColor: isAdmin ? '#d4edda' : '#f8d7da'
    }}>
      <h4>Admin Status Check</h4>
      <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
      <p><strong>UID:</strong> {user ? user.uid : 'N/A'}</p>
      <p><strong>Admin Status:</strong> {isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
      {user && !isAdmin && (
        <p style={{ color: '#721c24', fontSize: '0.9em' }}>
          Note: You are logged in but not an admin. Contact an existing admin to grant you access.
        </p>
      )}
    </div>
  );
};

export default AdminStatusChecker;
