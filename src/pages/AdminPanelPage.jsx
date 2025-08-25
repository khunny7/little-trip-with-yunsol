import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AdminPanel from '../components/AdminPanel';
import LayoutShell from '../components/LayoutShell';

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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <LayoutShell>
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
      </LayoutShell>
    );
  }

  if (!user) {
    return (
      <LayoutShell>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Please sign in to access admin.</h2>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="stack-lg">
        <header className="stack-sm">
          <h1 className="h2" style={{ letterSpacing: '-1px' }}>Admin Panel</h1>
          <p className="text-dim" style={{ maxWidth: 560 }}>Manage places, tips, and user data.</p>
        </header>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <AdminPanel user={user} onLogout={handleLogout} />
        </div>
      </div>
    </LayoutShell>
  );
};

export default AdminPanelPage;
