import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AdminPanel from '../components/AdminPanel';

const AdminPanelPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User will be redirected to login page by ProtectedRoute
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading admin panel...</h2>
        </div>
      </div>
    );
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
};

export default AdminPanelPage;
