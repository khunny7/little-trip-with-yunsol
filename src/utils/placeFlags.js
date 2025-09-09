// Utility helpers for deriving/enriching place flag state (liked / hidden / pinned)
// Centralized so Home, UserProfile, etc. can stay in sync.

export const deriveFlags = (placeId, userPreferences) => {
  if (!userPreferences) return { liked: false, hidden: false, pinned: false };
  return {
    liked: userPreferences.liked?.includes(placeId) || false,
    hidden: userPreferences.hidden?.includes(placeId) || false,
    pinned: userPreferences.pinned?.includes(placeId) || false
  };
};

export const enrichPlacesWithFlags = (places = [], userPreferences) => {
  return places.map(p => ({ ...p, flags: deriveFlags(p.id, userPreferences) }));
};
