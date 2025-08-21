import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import UserAuth from './UserAuth';
import { getUserActionStats } from '../utils/userActions';
import styles from './UserMenu.module.css';

const UserMenu = ({ className = '' }) => {
  const { user, userActions, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuRef = useRef(null);

  const stats = getUserActionStats(userActions);

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

  if (loading) {
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
            <button onClick={toggleMenu} className={styles.userButton}>
              <div className={styles.userAvatar}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
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
                <button 
                  onClick={openAuthModal}
                  className={styles.menuItem}
                >
                  👤 Account Settings
                </button>
              </div>
            )}
          </>
        ) : (
          <button onClick={openAuthModal} className={styles.signInButton}>
            <span className={styles.signInIcon}>👤</span>
            Sign In
          </button>
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
