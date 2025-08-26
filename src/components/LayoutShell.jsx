import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useApp } from '../hooks/useApp';
import { isCurrentUserAdmin } from '../utils/userManager';

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
      <header className="app-header">
        <div className="container-new header-inner header-compact allow-wrap" style={{width:'100%'}}>
          <div className="brand-block">
            <NavLink to="/" className="brand brand-full">Little Trip with Yunsol</NavLink>
            <NavLink to="/" className="brand brand-short">Yunsol Trip</NavLink>
          </div>
          <nav className="nav-new nav-compact" aria-label="Primary">
            <NavLink to="/" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Discover">Discover</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Admin">Admin</NavLink>
            )}
            <NavLink to="/profile" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Saved">Saved</NavLink>
          </nav>
          <div className="header-actions">
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="container-new" style={{paddingTop:'var(--space-7)', paddingBottom:'var(--space-8)'}}>
        {children}
      </main>
    </div>
  );
};

export default LayoutShell;
