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
        <div className="container-new header-inner" style={{width:'100%'}}>
          <NavLink to="/" className="brand">Little Trip with Yunsol</NavLink>
          <nav className="nav-new" style={{flexWrap:'wrap'}}>
            <NavLink to="/" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Discover</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Admin</NavLink>
            )}
            <NavLink to="/profile" className={({isActive})=> 'nav-link'+(isActive?' active':'')}>Saved</NavLink>
          </nav>
          <div style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center'}}>
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
