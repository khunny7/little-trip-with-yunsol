import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import UserAuth from './UserAuth';
import Avatar from './Avatar';
import { getUserPreferenceStats } from '../utils/userPreferences';
import { isPWA } from '../utils/localPrefs';
import { ThemeContext } from '../design/ThemeContext';
import styles from './UserMenu.module.css';

const UserMenu = ({ className = '', onNavigate = null }) => {
  const { user, userPreferences, loading } = useApp();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuRef = useRef(null);

  const stats = getUserPreferenceStats(userPreferences);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (loading.auth) {
    return (
      <div className={`${styles.userMenu} ${className}`}>
        <div className={styles.loading}>⟳</div>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.userMenu} ${className}`} ref={menuRef}>
        {user ? (
          <>
            <button
              onClick={toggleTheme}
              className={`${styles.themeToggle} ${theme==='dark'? styles.dark:''}`}
              aria-label={`Switch to ${theme==='dark' ? 'light' : 'dark'} theme`}
              aria-pressed={theme==='dark'}
              title={theme==='dark' ? 'Light mode' : 'Dark mode'}
            >
              <span className={styles.sun} aria-hidden>🌞</span>
              <span className={styles.moon} aria-hidden>🌙</span>
            </button>
            <button onClick={toggleMenu} className={styles.userButton}>
              <Avatar 
                src={user.photoURL}
                alt="Profile"
                size="medium"
                fallbackInitials={user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                className={styles.userAvatar}
              />
              <span className={styles.userName}>
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <span className={styles.dropdownArrow}>
                {isMenuOpen ? '▼' : '▶'}
              </span>
            </button>

            {isMenuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.userStats}>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>❤️</span>
                    <span className={styles.statValue}>{stats.liked}</span>
                    <span className={styles.statLabel}>Liked</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>📌</span>
                    <span className={styles.statValue}>{stats.pinned}</span>
                    <span className={styles.statLabel}>Planned</span>
                  </div>
                </div>
                {onNavigate ? (
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      onNavigate('profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    💾 Saved Places
                  </button>
                ) : (
                  <Link 
                    to="/profile"
                    className={styles.menuItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    💾 Saved Places
                  </Link>
                )}
                <button 
                  onClick={openAuthModal}
                  className={styles.menuItem}
                >
                  🔐 Sign Out
                </button>
              </div>
            )}
          </>
        ) : (
          // Hide sign in button in PWA mode since login is not available
          !isPWA() && (
            <button onClick={openAuthModal} className={styles.signInButton}>
              <span className={styles.signInIcon}>👤</span>
              Sign In
            </button>
          )
        )}
      </div>

      {/* Authentication Modal */}
      {isAuthModalOpen && createPortal(
        <div className={styles.modal} onClick={closeAuthModal}>
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.closeButton}
              onClick={closeAuthModal}
            >
              ✕
            </button>
            <UserAuth user={user} onClose={closeAuthModal} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserMenu;
