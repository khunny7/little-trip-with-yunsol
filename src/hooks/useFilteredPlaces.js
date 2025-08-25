import { useMemo } from 'react'

// Helper to test age range overlap
const ageOverlap = (filterRange, placeRange) => {
  if (!Array.isArray(filterRange) || !Array.isArray(placeRange)) return true
  return filterRange[0] <= placeRange[1] && placeRange[0] <= filterRange[1]
}

/**
 * Derive filtered & sorted places list from raw inputs.
 * @param {Array} places
 * @param {Object|null} userPreferences
 * @param {Object} filters
 * @param {string} sort
 */
export const useFilteredPlaces = (places, userPreferences, filters, sort) => {
  return useMemo(()=>{
    const likedSet = new Set(userPreferences?.liked||[])
    const hiddenSet = new Set(userPreferences?.hidden||[])
    const pinnedSet = new Set(userPreferences?.pinned||[])

    let result = places.filter(pl => {
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

    result.sort((a,b)=>{
      switch(sort){
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'rating-desc': return (b.yunsolExperience?.rating||0) - (a.yunsolExperience?.rating||0)
        case 'rating-asc': return (a.yunsolExperience?.rating||0) - (b.yunsolExperience?.rating||0)
        case 'recent-visit': return new Date(b.yunsolExperience?.lastVisited||0) - new Date(a.yunsolExperience?.lastVisited||0)
        default: return 0
      }
    })

    return result
  },[places, userPreferences, filters, sort])
}

export default useFilteredPlaces
