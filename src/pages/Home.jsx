import React, { useEffect, useState, lazy, Suspense } from 'react'
import LayoutShell from '../components/LayoutShell'
import PlaceCardNew from '../components/PlaceCardNew'
import Filter from '../components/Filter'
const MapView = lazy(()=> import('../components/MapView'))
const ListView = lazy(()=> import('../components/ListView'))
import { getPlaces, getTips } from '../data/dataService'
import { useApp } from '../hooks/useApp'
import useFilteredPlaces from '../hooks/useFilteredPlaces'
import { USER_ACTIONS, toggleUserAction } from '../utils/userPreferences'

const Home = () => {
  const { userPreferences, refreshUserPreferences } = useApp?.() || {};
  const [places, setPlaces] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewType, setViewType] = useState('cards')
  const [filters, setFilters] = useState({
    features: [], ageRange: [0,96], pricing: [], visitedOnly:false, yunsolRating:[0,3], likedOnly:false, pinnedOnly:false, hideHidden:true, yunsolPick:false
  })
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [sort, setSort] = useState('rating-desc')

  // local optimistic state
  const [prefSnapshot, setPrefSnapshot] = useState(userPreferences);
  useEffect(()=>{ setPrefSnapshot(userPreferences); },[userPreferences]);

  useEffect(()=>{
    let alive = true
    const load = async () => {
      try {
        setLoading(true)
        const [p,t] = await Promise.all([getPlaces(), getTips()])
        if (alive){ setPlaces(Array.isArray(p)?p:[]); setTips(Array.isArray(t)?t:[]) }
      } catch(e){ if(alive) setError('Failed to load data'); console.error(e) } finally { if(alive) setLoading(false) }
    }
    load(); return ()=>{alive=false}
  },[])

  const filteredPlaces = useFilteredPlaces(places, userPreferences, filters, sort)

  if (loading) return <LayoutShell><div className="auto-grid" style={{'--auto-grid-min':'240px'}}>{Array.from({length:6}).map((_,i)=>(<div key={i} className="skeleton-card">
    <div className="place-visual ratio-16x9 skeleton" />
    <div className="pad-md" style={{display:'flex', flexDirection:'column', gap:12}}>
      <div className="skeleton skeleton-line" style={{height:16, width:'60%'}} />
      <div className="skeleton skeleton-line" style={{height:12, width:'100%'}} />
      <div className="skeleton skeleton-line" style={{height:12, width:'90%'}} />
      <div className="skeleton-chip-row">{Array.from({length:4}).map((_,c)=><div key={c} className="skeleton skeleton-chip" />)}</div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:4}}>
        <div className="skeleton skeleton-line" style={{height:18, width:70, borderRadius:20}} />
        <div className="skeleton skeleton-line" style={{height:18, width:50, borderRadius:20}} />
      </div>
    </div>
  </div>))}</div></LayoutShell>
  if (error) return <LayoutShell><p className="text-dim">{error}</p></LayoutShell>

  const toggleQuick = (key) => setFilters(f => ({...f, [key]: !f[key]}))

  const updatePrefsOptimistic = async (placeId, actionType) => {
    try {
      // optimistic toggle
      setPrefSnapshot(prev => {
        if (!prev) return prev; // if none yet
        const map = { [USER_ACTIONS.LIKE]: 'liked', [USER_ACTIONS.HIDE]: 'hidden', [USER_ACTIONS.PIN]: 'pinned' };
        const field = map[actionType]; if (!field) return prev;
        const arr = new Set(prev[field]||[]);
        if (arr.has(placeId)) arr.delete(placeId); else arr.add(placeId);
        return { ...prev, [field]: Array.from(arr) };
      });
      await toggleUserAction(placeId, actionType);
      refreshUserPreferences?.();
    } catch(e){ console.error('Toggle action failed', e); }
  };

  const mapPlaceFlags = (pl) => {
    const liked = prefSnapshot?.liked?.includes(pl.id);
    const hidden = prefSnapshot?.hidden?.includes(pl.id);
    const pinned = prefSnapshot?.pinned?.includes(pl.id);
    return { ...pl, flags:{ liked, hidden, pinned } };
  };

  const enrichedPlaces = filteredPlaces.map(mapPlaceFlags);

  // handlers passed to card
  const handleLike = (pl) => updatePrefsOptimistic(pl.id, USER_ACTIONS.LIKE);
  const handlePin = (pl) => updatePrefsOptimistic(pl.id, USER_ACTIONS.PIN);
  const handleHide = (pl) => updatePrefsOptimistic(pl.id, USER_ACTIONS.HIDE);

  return (
    <LayoutShell>
      <div className="stack-lg">
        <header className="stack-sm">
          <h1 className="h2" style={{letterSpacing:'-1px'}}>Discover Places</h1>
          <p className="text-dim" style={{maxWidth:560}}>Curated toddler-friendly experiences—modern, calm, and parent-focused while keeping a gentle playful touch.</p>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
            <button className="btn" onClick={()=> setIsFilterExpanded(v=>!v)}>{isFilterExpanded? 'Hide Filters':'Show Filters'}</button>
            <div className="view-toggle" style={{background:'var(--color-surface-alt)', border:'1px solid var(--color-border)', padding:4, borderRadius:12, display:'flex', gap:4}}>
              {['cards','list','map'].map(v=> (
                <button
                  key={v}
                  onClick={()=> setViewType(v)}
                  className={`btn btn-seg${viewType===v?' active':''}`}
                  style={{minWidth:60}}
                >{v}</button>
              ))}
            </div>
            <span className="text-faint" style={{fontSize:'0.7rem'}}>{filteredPlaces.length} / {places.length}</span>
          </div>
          {/* Quick Filters */}
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:8, alignItems:'center'}}>
            <button className={`btn btn-chip${filters.likedOnly?' active':''}`} onClick={()=>toggleQuick('likedOnly')} title="Only liked">❤️ Liked</button>
            <button className={`btn btn-chip${filters.pinnedOnly?' active':''}`} onClick={()=>toggleQuick('pinnedOnly')} title="Only planned">📌 Planned</button>
            <button className={`btn btn-chip${filters.hideHidden?' active':''}`} onClick={()=>toggleQuick('hideHidden')} title="Hide hidden">🙈 Hide Hidden</button>
            <button className={`btn btn-chip${filters.yunsolPick?' active':''}`} onClick={()=>toggleQuick('yunsolPick')} title="Yunsol's picks">👶 Picks</button>
            <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:6}}>
              <label style={{fontSize:12, color:'var(--color-text-dim)'}}>Sort:</label>
              <select value={sort} onChange={e=> setSort(e.target.value)} style={{fontSize:12, padding:'6px 8px', borderRadius:8, border:'1px solid var(--color-border)', background:'var(--color-surface)'}}>
                <option value="rating-desc">Rating High→Low</option>
                <option value="rating-asc">Rating Low→High</option>
                <option value="recent-visit">Recent Visit</option>
                <option value="name-asc">Name A→Z</option>
                <option value="name-desc">Name Z→A</option>
              </select>
            </div>
          </div>
        </header>
        {isFilterExpanded && (
          <div style={{border:'1px solid var(--color-border)', background:'var(--color-surface)', borderRadius:16, padding:16}}>
            <Filter places={places} activeFilters={filters} onFilterChange={setFilters} />
          </div>
        )}
        <section>
          <Suspense fallback={<p className="text-dim" style={{padding:16}}>Loading view…</p>}>
            {viewType==='cards' && (
              <div className="place-grid-new">
                {enrichedPlaces.map(p => <PlaceCardNew key={p.id} place={p} onToggleLike={handleLike} onTogglePin={handlePin} onToggleHide={handleHide} />)}
              </div>
            )}
            {viewType==='list' && <ListView places={filteredPlaces} />}
            {viewType==='map' && <MapView places={filteredPlaces} />}
          </Suspense>
        </section>
        {tips.length>0 && (
          <section className="stack-md">
            <h2 className="h3">Tips</h2>
            <ul style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', listStyle:'none', padding:0, margin:0}}>
              {tips.map(t=> <li key={t.id} className="card" style={{padding:16}}><strong>{t.title}</strong><p style={{fontSize:'0.75rem'}}>{t.content}</p></li>)}
            </ul>
          </section>
        )}
      </div>
    </LayoutShell>
  )
}

export default Home
