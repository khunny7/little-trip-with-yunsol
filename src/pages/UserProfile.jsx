import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserPreferences, getUserPreferenceStats } from '../utils/userPreferences';
import { getPlaces } from '../data/dataService';
import PlaceCard from '../components/PlaceCard';
import Avatar from '../components/Avatar';
import Layout from '../components/Layout';
import './UserProfile.css';

const UserProfile = () => {
  const { user, refreshUserActions } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [stats, setStats] = useState({ liked: 0, hidden: 0, pinned: 0 });
  const [activeTab, setActiveTab] = useState('liked'); // 'liked', 'pinned', 'hidden'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load user preferences and places concurrently
        const [userPrefs, placesData] = await Promise.all([
          getUserPreferences(user.uid),
          getPlaces()
        ]);
        
        setPreferences(userPrefs);
        setAllPlaces(placesData);
        setStats(getUserPreferenceStats(userPrefs));
      } catch (err) {
        console.error('Error loading user profile data:', err);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter places based on active tab
  const getFilteredPlaces = () => {
    if (!preferences || !allPlaces.length) return [];
    
    const placeIds = preferences[activeTab] || [];
    return allPlaces.filter(place => placeIds.includes(place.id));
  };

  const filteredPlaces = getFilteredPlaces();

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="auth-required">
            <h2>🔒 Sign In Required</h2>
            <p>Please sign in to view your profile and saved places.</p>
            <Link to="/" className="home-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="loading-state">
            <h2>Loading your profile...</h2>
            <div className="loading-spinner">⟳</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="error-state">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
            <Link to="/" className="home-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="user-profile">
        {/* Profile Header */}
        <section className="profile-hero">
          <div className="profile-container">
            <div className="user-info">
              <Avatar 
              src={user.photoURL}
              alt={user.displayName || 'User'}
              size="xlarge"
              fallbackInitials={(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              className="user-avatar"
            />
              <div className="user-details">
                <h1>{user.displayName || 'Your Profile'}</h1>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="profile-stats">
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
            <div className="stat-icon">🙈</div>
            <div className="stat-info">
              <div className="stat-number">{stats.hidden}</div>
              <div className="stat-label">Hidden Places</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="profile-tabs">
        <div className="tabs-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              <span className="tab-icon">❤️</span>
              Liked Places ({stats.liked})
            </button>
            <button
              className={`tab-button ${activeTab === 'pinned' ? 'active' : ''}`}
              onClick={() => setActiveTab('pinned')}
            >
              <span className="tab-icon">📌</span>
              Planned Places ({stats.pinned})
            </button>
            <button
              className={`tab-button ${activeTab === 'hidden' ? 'active' : ''}`}
              onClick={() => setActiveTab('hidden')}
            >
              <span className="tab-icon">🙈</span>
              Hidden Places ({stats.hidden})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {filteredPlaces.length > 0 ? (
              <div className="places-grid">
                {filteredPlaces.map(place => (
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
                  {activeTab === 'liked' && '❤️'}
                  {activeTab === 'pinned' && '📌'}
                  {activeTab === 'hidden' && '🙈'}
                </div>
                <h3>No {activeTab} places yet</h3>
                <p>
                  {activeTab === 'liked' && 'Start liking places to see them here!'}
                  {activeTab === 'pinned' && 'Pin places you want to visit to see them here!'}
                  {activeTab === 'hidden' && 'Hidden places will appear here.'}
                </p>
                <Link to="/" className="browse-link">
                  Browse Places
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default UserProfile;
