import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { getUserPreferenceStats, USER_ACTIONS } from '../utils/userPreferences';
import Avatar from '../components/Avatar';
import LayoutShell from '../components/LayoutShell';
import PlaceCardNew from '../components/PlaceCardNew';
import { enrichPlacesWithFlags } from '../utils/placeFlags';

const UserProfile = () => {
  const { user, userPreferences, optimisticPreferences, optimisticToggle, refreshUserPreferences, places, loading } = useApp();

  useEffect(()=>{ refreshUserPreferences?.(); },[refreshUserPreferences]);

  if (!user) {
    return (
      <LayoutShell>
        <div className="card" style={{maxWidth:480, margin:'40px auto'}}>
          <h2 className="h3" style={{marginTop:0}}>Sign In Required</h2>
          <p className="text-dim" style={{fontSize:'0.85rem'}}>Please sign in to view your saved places.</p>
          <Link to="/" className="btn btn-primary" style={{marginTop:16}}>← Back Home</Link>
        </div>
      </LayoutShell>
    );
  }

  const stats = getUserPreferenceStats(optimisticPreferences || userPreferences);
  const prefs = optimisticPreferences || userPreferences || {};
  // Segment places by type
  const plannedIds = prefs.pinned || [];
  const likedIds = (prefs.liked || []).filter(id => !plannedIds.includes(id));
  const hiddenIds = prefs.hidden || [];
  const plannedPlaces = enrichPlacesWithFlags(places.filter(p => plannedIds.includes(p.id)), prefs);
  const likedPlaces = enrichPlacesWithFlags(places.filter(p => likedIds.includes(p.id)), prefs);
  const hiddenPlaces = enrichPlacesWithFlags(places.filter(p => hiddenIds.includes(p.id)), prefs);

  const handleLike = (pl) => optimisticToggle?.(pl.id, USER_ACTIONS.LIKE);
  const handlePin = (pl) => optimisticToggle?.(pl.id, USER_ACTIONS.PIN);
  const handleHide = (pl) => optimisticToggle?.(pl.id, USER_ACTIONS.HIDE);

  if (loading?.userPreferences && !userPreferences) {
    return (
      <LayoutShell>
        <div className="card" style={{maxWidth:480, margin:'40px auto'}}>
          <h2 className="h3" style={{marginTop:0}}>Loading Saved Places…</h2>
          <p className="text-dim" style={{fontSize:'0.85rem'}}>Fetching your preferences.</p>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="stack-lg">
        <section className="card" style={{display:'flex', gap:24, alignItems:'center'}}>
          <Avatar 
            src={user.photoURL}
            alt={user.displayName || 'User'}
            size="xlarge"
            fallbackInitials={(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          />
          <div className="stack-sm" style={{flex:1}}>
            <h1 className="h3" style={{margin:0}}>Saved Places</h1>
            <p className="text-faint" style={{fontSize:'0.75rem', margin:0}}>{user.email}</p>
            <div style={{display:'flex', gap:12, marginTop:12}}>
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.pinned} Planned</span></div>
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.liked} Liked</span></div>
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.hidden} Hidden</span></div>
            </div>
          </div>
        </section>

        <section className="stack-md">
          <h2 className="h4" style={{marginBottom:4}}>Planned</h2>
          <p className="text-dim" style={{marginTop:0, marginBottom:16, fontSize:'0.95rem'}}>Places you’ve pinned for planning your trip. Drag and drop or reorder in your itinerary (coming soon).</p>
          {plannedPlaces.length ? (
            <div className="place-grid-new">
              {plannedPlaces.map(pl => (
                <PlaceCardNew
                  key={pl.id}
                  place={pl}
                  onToggleLike={handleLike}
                  onTogglePin={handlePin}
                  onToggleHide={handleHide}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{textAlign:'center'}}>
              <p className="text-dim" style={{margin:0}}>No planned places yet.</p>
              <Link to="/" className="btn btn-primary" style={{marginTop:12}}>Browse Places</Link>
            </div>
          )}
        </section>

        <section className="stack-md">
          <h2 className="h4" style={{marginBottom:4}}>Liked</h2>
          {likedPlaces.length ? (
            <div className="place-grid-new">
              {likedPlaces.map(pl => (
                <PlaceCardNew
                  key={pl.id}
                  place={pl}
                  onToggleLike={handleLike}
                  onTogglePin={handlePin}
                  onToggleHide={handleHide}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{textAlign:'center'}}>
              <p className="text-dim" style={{margin:0}}>No liked places yet.</p>
              <Link to="/" className="btn btn-primary" style={{marginTop:12}}>Browse Places</Link>
            </div>
          )}
        </section>

        <section className="stack-md">
          <h2 className="h4" style={{marginBottom:4}}>Hidden</h2>
          {hiddenPlaces.length ? (
            <div className="place-grid-new">
              {hiddenPlaces.map(pl => (
                <PlaceCardNew
                  key={pl.id}
                  place={pl}
                  onToggleLike={handleLike}
                  onTogglePin={handlePin}
                  onToggleHide={handleHide}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{textAlign:'center'}}>
              <p className="text-dim" style={{margin:0}}>No hidden places yet.</p>
              <Link to="/" className="btn btn-primary" style={{marginTop:12}}>Browse Places</Link>
            </div>
          )}
        </section>
      </div>
    </LayoutShell>
  );
};

export default UserProfile;
