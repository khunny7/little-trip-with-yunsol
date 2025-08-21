import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserPreferences, getUserPreferenceStats } from '../utils/userPreferences';
import { getPlaces } from '../data/dataService';
import PlaceCard from './PlaceCard';

const UserProfileSection = ({ user }) => {
  const { refreshUserActions } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [stats, setStats] = useState({ liked: 0, hidden: 0, pinned: 0 });
  const [activeTab, setActiveTab] = useState('liked'); // 'liked', 'pinned', 'hidden'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load user preferences and places data concurrently
        const [userPrefs, placesData] = await Promise.all([
          getUserPreferences(user.uid),
          getPlaces()
        ]);

        setPreferences(userPrefs);
        setAllPlaces(placesData);
        
        // Calculate stats
        const statsData = getUserPreferenceStats(userPrefs);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading user profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) {
    return (
      <section id="profile" className="profile-section">
        <div className="container">
          <div className="auth-prompt">
            <h2>Sign In to View Your Profile</h2>
            <p>Please sign in to see your liked places, planned trips, and more.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="profile" className="profile-section">
        <div className="container">
          <div className="loading-state">
            <h2>🌟 Loading your profile...</h2>
            <div className="spinner">⭐</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="profile" className="profile-section">
        <div className="container">
          <div className="error-state">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Filter places based on active tab
  const getFilteredPlaces = () => {
    if (!preferences || !allPlaces.length) return [];

    const placeIds = preferences[activeTab] || [];
    return allPlaces.filter(place => placeIds.includes(place.id.toString()));
  };

  const filteredPlaces = getFilteredPlaces();

  return (
    <section id="profile" className="profile-section">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-hero">
          <div className="user-info">
            <div className="user-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} />
              ) : (
                <div className="avatar-placeholder">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <h1>{user.displayName || 'Your Profile'}</h1>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-info">
                <div className="stat-number">{stats.liked}</div>
                <div className="stat-label">Liked Places</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📌</div>
              <div className="stat-info">
                <div className="stat-number">{stats.pinned}</div>
                <div className="stat-label">Planned Places</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁️‍🗨️</div>
              <div className="stat-info">
                <div className="stat-number">{stats.hidden}</div>
                <div className="stat-label">Hidden Places</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ Liked Places ({stats.liked})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pinned' ? 'active' : ''}`}
            onClick={() => setActiveTab('pinned')}
          >
            📌 Planned Places ({stats.pinned})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'hidden' ? 'active' : ''}`}
            onClick={() => setActiveTab('hidden')}
          >
            👁️‍🗨️ Hidden Places ({stats.hidden})
          </button>
        </div>

        {/* Places Grid */}
        <div className="profile-content">
          {filteredPlaces.length > 0 ? (
            <div className="places-grid">
              {filteredPlaces.map((place) => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  refreshUserActions={refreshUserActions}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'liked' && '💝'}
                {activeTab === 'pinned' && '📍'}
                {activeTab === 'hidden' && '👀'}
              </div>
              <h3>No {activeTab} places yet</h3>
              <p>
                {activeTab === 'liked' && 'Start liking places to see them here!'}
                {activeTab === 'pinned' && 'Pin places you want to visit to see them here!'}
                {activeTab === 'hidden' && 'Hidden places will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserProfileSection;
