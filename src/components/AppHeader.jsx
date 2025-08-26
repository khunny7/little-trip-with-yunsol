import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';

/**
 * Unified application header used across discover (shell) and place detail pages.
 * Props:
 *  - user
 *  - isAdmin
 *  - showBack (boolean)
 *  - onBack (function)
 *  - extraActions (node) additional right side actions (e.g., Edit button)
 *  - includeNav (boolean) show primary nav (default true)
 *  - editing (boolean) show small editing badge
 */
const AppHeader = ({
  isAdmin,
  showBack = false,
  onBack = () => {},
  extraActions = null,
  includeNav = true,
  editing = false,
}) => {
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current; if(!nav) return;
    const update = () => {
      const active = nav.querySelector('.nav-link.active');
      if (active) {
        const rect = active.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        nav.style.setProperty('--nav-underline-w', rect.width + 'px');
        nav.style.setProperty('--nav-underline-x', (rect.left - navRect.left) + 'px');
      } else {
        nav.style.setProperty('--nav-underline-w','0');
      }
    };
    update();
    const ro = new ResizeObserver(update); ro.observe(nav);
    window.addEventListener('resize', update);
    const mo = new MutationObserver(update); mo.observe(nav,{attributes:true, subtree:true, attributeFilter:['class']});
    return () => { ro.disconnect(); window.removeEventListener('resize', update); mo.disconnect(); };
  }, []);

  return (
    <header className="app-header app-header-pro">
      <div className="container-new header-inner header-compact allow-wrap" style={{width:'100%'}}>
        {showBack && (
          <button onClick={onBack} className="back-button" style={{marginRight:'4px'}}>←</button>
        )}
        <div className="brand-block" style={{display:'flex', alignItems:'center'}}>
          <NavLink to="/" className="brand brand-full">Little Trip with Yunsol</NavLink>
          <NavLink to="/" className="brand brand-short">Yunsol Trip</NavLink>
          {editing && <span className="header-badge" aria-label="Editing mode">EDITING</span>}
        </div>
        {includeNav && (
          <nav ref={navRef} className="nav-new nav-compact" aria-label="Primary">
            <NavLink to="/" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Discover">Discover</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Admin">Admin</NavLink>
            )}
            <NavLink to="/profile" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Saved">Saved</NavLink>
          </nav>
        )}
        <div className="header-actions" style={{marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center'}}>
          {extraActions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
