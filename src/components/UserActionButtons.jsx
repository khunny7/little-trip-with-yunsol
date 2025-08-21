import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toggleUserAction, getPlaceActions, USER_ACTIONS } from '../utils/userPreferences';
import styles from './UserActionButtons.module.css';

const UserActionButtons = ({ placeId, className = '', showLabels = false, refreshUserActions }) => {
  const { user } = useAuth();
  const [actions, setActions] = useState({ liked: false, hidden: false, pinned: false });
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const loadUserActions = async () => {
      if (user && placeId) {
        try {
          const placeActions = await getPlaceActions(placeId);
          if (placeActions) {
            setActions({
              liked: placeActions.liked || false,
              hidden: placeActions.hidden || false,
              pinned: placeActions.pinned || false
            });
          }
        } catch (error) {
          console.error('Error loading user actions:', error);
        }
      }
    };

    loadUserActions();
  }, [user, placeId]);

  const handleAction = async (actionType) => {
    if (!user) {
      // Could trigger a login modal here
      alert('Please sign in to interact with places!');
      return;
    }

    setLoading(prev => ({ ...prev, [actionType]: true }));
    
    try {
      const newValue = await toggleUserAction(placeId, actionType);
      
      // Update local state
      setActions(prev => ({
        ...prev,
        [actionType === USER_ACTIONS.LIKE ? 'liked' : 
         actionType === USER_ACTIONS.HIDE ? 'hidden' : 'pinned']: newValue
        // All actions are independent - no mutual exclusivity
      }));
      
      // Refresh user actions in parent component
      if (refreshUserActions) {
        await refreshUserActions();
      }
    } catch (error) {
      console.error('Error updating user action:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  if (!user) {
    return (
      <div className={`${styles.actionsContainer} ${className}`}>
        <div className={styles.signInPrompt}>
          👤 Sign in to like and save places
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.actionsContainer} ${className}`}>
      <button
        onClick={() => handleAction(USER_ACTIONS.LIKE)}
        disabled={loading[USER_ACTIONS.LIKE]}
        className={`${styles.actionButton} ${actions.liked ? styles.active : ''} ${styles.likeButton}`}
        title="Like this place"
      >
        {loading[USER_ACTIONS.LIKE] ? (
          <span className={styles.loading}>⟳</span>
        ) : (
          <span className={styles.icon}>
            {actions.liked ? '❤️' : '🤍'}
          </span>
        )}
        {showLabels && <span className={styles.label}>Like</span>}
      </button>

      <button
        onClick={() => handleAction(USER_ACTIONS.HIDE)}
        disabled={loading[USER_ACTIONS.HIDE]}
        className={`${styles.actionButton} ${actions.hidden ? styles.active : ''} ${styles.hideButton}`}
        title="Hide this place"
      >
        {loading[USER_ACTIONS.HIDE] ? (
          <span className={styles.loading}>⟳</span>
        ) : (
          <span className={styles.icon}>
            {actions.hidden ? '🚫' : '👁️'}
          </span>
        )}
        {showLabels && <span className={styles.label}>Hide</span>}
      </button>

      <button
        onClick={() => handleAction(USER_ACTIONS.PIN)}
        disabled={loading[USER_ACTIONS.PIN]}
        className={`${styles.actionButton} ${actions.pinned ? styles.active : ''} ${styles.pinButton}`}
        title={actions.pinned ? 'Remove from plan' : 'Add to plan'}
      >
        {loading[USER_ACTIONS.PIN] ? (
          <span className={styles.loading}>⟳</span>
        ) : (
          <span className={styles.icon}>
            {actions.pinned ? '📌' : '📍'}
          </span>
        )}
        {showLabels && (
          <span className={styles.label}>
            {actions.pinned ? 'Planned' : 'Plan Visit'}
          </span>
        )}
      </button>
    </div>
  );
};

export default UserActionButtons;
