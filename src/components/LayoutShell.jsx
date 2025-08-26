import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useApp } from '../hooks/useApp';
import { isCurrentUserAdmin } from '../utils/userManager';

const LayoutShell = ({ children }) => {
  const { user } = useApp();
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin === true);
  const navRef = useRef(null);

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

  useEffect(()=>{
    const nav = navRef.current; if(!nav) return;
    const update = () => {
      const active = nav.querySelector('.nav-link.active');
      if (active) {
        const rect = active.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const w = rect.width; const x = rect.left - navRect.left;
        nav.style.setProperty('--nav-underline-w', w+'px');
        nav.style.setProperty('--nav-underline-x', x+'px');
      } else {
        nav.style.setProperty('--nav-underline-w','0');
      }
    };
    update();
    const ro = new ResizeObserver(update); ro.observe(nav);
    window.addEventListener('resize', update);
    const mo = new MutationObserver(update); mo.observe(nav,{attributes:true, subtree:true, attributeFilter:['class']});
    return ()=>{ ro.disconnect(); window.removeEventListener('resize', update); mo.disconnect(); };
  },[]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container-new header-inner header-compact allow-wrap" style={{width:'100%'}}>
          <div className="brand-block">
            <NavLink to="/" className="brand brand-full">Little Trip with Yunsol</NavLink>
            <NavLink to="/" className="brand brand-short">Yunsol Trip</NavLink>
          </div>
          <nav ref={navRef} className="nav-new nav-compact" aria-label="Primary">
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
