import React from 'react';
import { NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';

/*
 * Polished unified application header.
 * Changes:
 *  - Added brand mark + wrapped text for better spacing.
 *  - Removed JS-driven underline animation; replaced with pure CSS per-link underline.
 *  - Added accessible aria-current handling via NavLink.
 */
const AppHeader = ({
  isAdmin,
  showBack = false,
  onBack = () => {},
  extraActions = null,
  includeNav = true,
  editing = false,
}) => {
  return (
    <header className="app-header app-header-pro app-header-polished">
      <div className="container-new header-inner header-compact allow-wrap header-inner-polished" style={{width:'100%'}}>
        {showBack && (
          <button onClick={onBack} className="back-button" aria-label="Go Back" title="Back">←</button>
        )}
        <div className="brand-block">
          <NavLink to="/" className="brand" title="Home">
            <img src="/icons/icon-maskable.svg" alt="" width="28" height="28" className="brand-mark" aria-hidden="true" />
            <span className="brand-text">Little Trip with Yunsol</span>
            <span className="brand-text-short">Yunsol Trip</span>
          </NavLink>
          {editing && <span className="header-badge" aria-label="Editing mode">EDITING</span>}
        </div>
        {includeNav && (
          <nav className="nav-new nav-compact nav-polished" aria-label="Primary">
            <NavLink to="/" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Discover">Discover</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Admin">Admin</NavLink>
            )}
            <NavLink to="/profile" className={({isActive})=> 'nav-link'+(isActive?' active':'')} title="Saved">Saved</NavLink>
          </nav>
        )}
        <div className="header-actions" style={{marginLeft:'auto'}}>
          {extraActions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
