// Common utility functions used across the application

/**
 * Format age from months to readable string
 * @param {number} months - Age in months
 * @returns {string} Formatted age string
 */
export const formatAge = (months) => {
  if (months < 12) {
    return `${months} months`;
  } else if (months === 12) {
    return '1 year';
  } else if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} months`;
  }
};

/**
 * Format age range from array to readable string
 * @param {number[]} ageRange - Array with min and max age in months
 * @returns {string} Formatted age range string
 */
export const formatAgeRange = (ageRange) => {
  if (!ageRange || ageRange.length !== 2) return 'All ages';
  return `${formatAge(ageRange[0])} - ${formatAge(ageRange[1])}`;
};

/**
 * Format pricing for display
 * @param {string} pricing - Pricing code (Free, $, $$, $$$)
 * @returns {string} Display text for pricing
 */
export const formatPricing = (pricing) => {
  const pricingMap = {
    'Free': 'Free',
    '$': 'Budget-friendly',
    '$$': 'Moderate',
    '$$$': 'Premium'
  };
  return pricingMap[pricing] || pricing;
};

/**
 * Sort places based on the selected sort option
 * @param {Array} places - Array of places to sort
 * @param {string} sortBy - Sort option key
 * @returns {Array} Sorted places array
 */
export const sortPlaces = (places, sortBy) => {
  if (!places || !Array.isArray(places)) return [];
  
  const sortedPlaces = [...places];
  
  switch (sortBy) {
    case 'rating-desc':
      return sortedPlaces.sort((a, b) => 
        (b.yunsolExperience?.rating || 0) - (a.yunsolExperience?.rating || 0)
      );
    case 'rating-asc':
      return sortedPlaces.sort((a, b) => 
        (a.yunsolExperience?.rating || 0) - (b.yunsolExperience?.rating || 0)
      );
    case 'name-asc':
      return sortedPlaces.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedPlaces.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sortedPlaces;
  }
};

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Get rating stars display string
 * @param {number} rating - Rating number (0-3)
 * @returns {string} Star emoji string
 */
export const getRatingStars = (rating) => {
  if (!rating || rating === 0) return '';
  return '⭐'.repeat(Math.min(Math.max(rating, 0), 3));
};
