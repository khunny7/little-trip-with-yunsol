import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { isCurrentUserAdmin } from '../utils/userManager';
import AppHeader from './AppHeader';

const LayoutShell = ({ children }) => {
  const { user } = useApp();
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin === true);

  useEffect(() => {
    let active = true;
    const resolveAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      if (user.isAdmin === true || user.isAdmin === false) {
        setIsAdmin(user.isAdmin === true);
      } else {
        try {
          const flag = await isCurrentUserAdmin();
          if (active) setIsAdmin(flag);
        } catch { /* ignore */ }
      }
    };
    resolveAdmin();
    return () => { active = false; };
  }, [user]);

  return (
    <div className="app-shell">
      <AppHeader isAdmin={isAdmin} />
      <main className="container-new" style={{paddingTop:'var(--space-8)', paddingBottom:'var(--space-8)'}}>
        {children}
      </main>
    </div>
  );
};

export default LayoutShell;
