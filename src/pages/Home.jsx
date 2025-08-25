import React, { useEffect, useState, lazy, Suspense } from 'react'
import LayoutShell from '../components/LayoutShell'
import PlaceCardNew from '../components/PlaceCardNew'
import Filter from '../components/Filter'
const MapView = lazy(()=> import('../components/MapView'))
const ListView = lazy(()=> import('../components/ListView'))
import { getPlaces, getTips } from '../data/dataService'
import { useApp } from '../hooks/useApp'
import useFilteredPlaces from '../hooks/useFilteredPlaces'

const Home = () => {
  const { userPreferences } = useApp?.() || {};
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

  if (loading) return <LayoutShell><p className="text-dim">Loading content…</p></LayoutShell>
  if (error) return <LayoutShell><p className="text-dim">{error}</p></LayoutShell>

  const toggleQuick = (key) => setFilters(f => ({...f, [key]: !f[key]}))

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
                {filteredPlaces.map(p => <PlaceCardNew key={p.id} place={p} />)}
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
