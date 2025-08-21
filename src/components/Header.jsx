import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const Header = ({ activeSection = 'places', onNavigate = () => {} }) => {
  const handleNavClick = (section, event) => {
    event.preventDefault();
    onNavigate(section);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={(e) => handleNavClick('places', e)}>
            Little Trip with Yunsol
          </Link>
          <nav className="nav">
            <a 
              href="#places" 
              className={activeSection === 'places' ? 'active' : ''}
              onClick={(e) => handleNavClick('places', e)}
            >
              Places
            </a>
            <a 
              href="#tips" 
              className={activeSection === 'tips' ? 'active' : ''}
              onClick={(e) => handleNavClick('tips', e)}
            >
              Tips
            </a>
            <a 
              href="#about" 
              className={activeSection === 'about' ? 'active' : ''}
              onClick={(e) => handleNavClick('about', e)}
            >
              About
            </a>
            <a 
              href="#profile" 
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={(e) => handleNavClick('profile', e)}
            >
              My Page
            </a>
            <Link to="/admin" title="Manage Places">⚙️</Link>
            <UserMenu onNavigate={onNavigate} />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
