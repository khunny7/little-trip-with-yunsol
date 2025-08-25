// Common utility functions used across the application

/** Format age from months to readable short string */
export const formatAge = (months) => {
  if (months < 12) return `${months}m`;
  if (months === 12) return '1y';
  if (months % 12 === 0) { const y = months/12; return `${y}y`; }
  const y = Math.floor(months/12); const m = months % 12; return `${y}y ${m}m`;
};

/** Format age range from array to short string */
export const formatAgeRange = (ageRange) => {
  if (!ageRange || ageRange.length !== 2) return 'All ages';
  return `${formatAge(ageRange[0])} - ${formatAge(ageRange[1])}`;
};
