import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { getUserPreferenceStats } from '../utils/userPreferences';
import Avatar from '../components/Avatar';
import LayoutShell from '../components/LayoutShell';
import PlaceCardNew from '../components/PlaceCardNew';

const UserProfile = () => {
  const { user, userPreferences, refreshUserPreferences, places } = useApp();
  const [activeTab, setActiveTab] = useState('liked');

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

  const stats = getUserPreferenceStats(userPreferences);
  const tabIds = { liked:'liked', pinned:'pinned', hidden:'hidden' };
  const filteredPlaces = places.filter(p => (userPreferences?.[activeTab]||[]).includes(p.id));

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
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.liked} Liked</span></div>
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.pinned} Planned</span></div>
              <div className="card" style={{padding:'12px 16px', boxShadow:'none', borderRadius:12}}><span style={{fontSize:12, fontWeight:600}}>{stats.hidden} Hidden</span></div>
            </div>
          </div>
        </section>

        <section className="stack-md">
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {Object.keys(tabIds).map(tab => (
              <button key={tab} onClick={()=> setActiveTab(tab)} className={`btn btn-chip${activeTab===tab? ' active':''}`}>{tab.charAt(0).toUpperCase()+tab.slice(1)} ({stats[tab]})</button>
            ))}
          </div>
          <div>
            {filteredPlaces.length ? (
              <div className="place-grid-new">
                {filteredPlaces.map(pl => <PlaceCardNew key={pl.id} place={pl} />)}
              </div>
            ) : (
              <div className="card" style={{textAlign:'center'}}>
                <p className="text-dim" style={{margin:0}}>No {activeTab} places yet.</p>
                <Link to="/" className="btn btn-primary" style={{marginTop:12}}>Browse Places</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </LayoutShell>
  );
};

export default UserProfile;
