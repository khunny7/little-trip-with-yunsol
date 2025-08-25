import React, { useEffect, useState, useMemo } from 'react'
import LayoutShell from '../components/LayoutShell'
import PlaceCardNew from '../components/PlaceCardNew'
import Filter from '../components/Filter'
import MapView from '../components/MapView'
import ListView from '../components/ListView'
import { getPlaces, getTips } from '../data/dataService'
import { useApp } from '../hooks/useApp'

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

  const ageOverlap = (a,b)=> a[0] <= b[1] && b[0] <= a[1]

  const filteredPlaces = useMemo(()=>{
    const likedSet = new Set(userPreferences?.liked||[])
    const hiddenSet = new Set(userPreferences?.hidden||[])
    const pinnedSet = new Set(userPreferences?.pinned||[])
    let res = places.filter(pl => {
      if (filters.features.length && !filters.features.every(f=> pl.features?.includes(f))) return false
      if (filters.ageRange && pl.ageRange && !ageOverlap(filters.ageRange, pl.ageRange)) return false
      if (filters.pricing.length && !filters.pricing.includes(pl.pricing)) return false
      if (filters.visitedOnly && !(pl.yunsolExperience?.hasVisited)) return false
      if (filters.yunsolPick && !pl.yunsolExperience?.hasVisited) return false
      if (filters.yunsolRating && pl.yunsolExperience?.rating != null){
        const r = pl.yunsolExperience.rating
        if (r < filters.yunsolRating[0] || r > filters.yunsolRating[1]) return false
      } else if (filters.yunsolRating[0] > 0) return false
      if (filters.likedOnly && !likedSet.has(pl.id)) return false
      if (filters.pinnedOnly && !pinnedSet.has(pl.id)) return false
      if (filters.hideHidden && hiddenSet.has(pl.id)) return false
      return true
    })
    // Sorting
    res.sort((a,b)=>{
      switch(sort){
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'rating-desc': return (b.yunsolExperience?.rating||0) - (a.yunsolExperience?.rating||0)
        case 'rating-asc': return (a.yunsolExperience?.rating||0) - (b.yunsolExperience?.rating||0)
        case 'recent-visit': return new Date(b.yunsolExperience?.lastVisited||0) - new Date(a.yunsolExperience?.lastVisited||0)
        default: return 0
      }
    })
    return res
  },[places, filters, userPreferences, sort])

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
          {viewType==='cards' && (
            <div className="place-grid-new">
              {filteredPlaces.map(p => <PlaceCardNew key={p.id} place={p} />)}
            </div>
          )}
          {viewType==='list' && <ListView places={filteredPlaces} />}
          {viewType==='map' && <MapView places={filteredPlaces} />}
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
