import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toggleUserAction, getUserActionsForPlace, USER_ACTIONS } from '../utils/userActions';
import styles from './UserActionButtons.module.css';

const UserActionButtons = ({ placeId, className = '', showLabels = false }) => {
  const { user, refreshUserActions } = useAuth();
  const [actions, setActions] = useState({ liked: false, disliked: false, pinned: false });
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const loadUserActions = async () => {
      if (user && placeId) {
        try {
          const userActions = await getUserActionsForPlace(placeId);
          if (userActions) {
            setActions({
              liked: userActions.liked || false,
              disliked: userActions.disliked || false,
              pinned: userActions.pinned || false
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
         actionType === USER_ACTIONS.DISLIKE ? 'disliked' : 'pinned']: newValue,
        // Handle mutual exclusivity for like/dislike
        ...(actionType === USER_ACTIONS.LIKE && newValue ? { disliked: false } : {}),
        ...(actionType === USER_ACTIONS.DISLIKE && newValue ? { liked: false } : {})
      }));
      
      // Refresh user actions in parent component
      await refreshUserActions();
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
        onClick={() => handleAction(USER_ACTIONS.DISLIKE)}
        disabled={loading[USER_ACTIONS.DISLIKE]}
        className={`${styles.actionButton} ${actions.disliked ? styles.active : ''} ${styles.dislikeButton}`}
        title="Dislike this place"
      >
        {loading[USER_ACTIONS.DISLIKE] ? (
          <span className={styles.loading}>⟳</span>
        ) : (
          <span className={styles.icon}>
            {actions.disliked ? '👎' : '👎🏻'}
          </span>
        )}
        {showLabels && <span className={styles.label}>Dislike</span>}
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
