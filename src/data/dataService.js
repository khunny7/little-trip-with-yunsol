// Data utility functions for managing places and tips

/**
 * Get all places from the data source
 * @returns {Promise<Array>} Array of places
 */
export const getPlaces = async () => {
  try {
    // In the future, this could be an API call
    const response = await import('./places.json');
    return response.default.places || [];
  } catch (error) {
    console.error('Error loading places:', error);
    return [];
  }
};

/**
 * Get all tips from the data source
 * @returns {Promise<Array>} Array of tips
 */
export const getTips = async () => {
  try {
    // In the future, this could be an API call
    const response = await import('./places.json');
    return response.default.tips || [];
  } catch (error) {
    console.error('Error loading tips:', error);
    return [];
  }
};

/**
 * Get a place by ID
 * @param {number} id - The place ID
 * @returns {Promise<Object|null>} Place object or null if not found
 */
export const getPlaceById = async (id) => {
  try {
    const places = await getPlaces();
    return places.find(place => place.id === id) || null;
  } catch (error) {
    console.error('Error loading place:', error);
    return null;
  }
};

/**
 * Filter places by features
 * @param {Array<string>} features - Features to filter by
 * @returns {Promise<Array>} Filtered array of places
 */
export const getPlacesByFeatures = async (features) => {
  try {
    const places = await getPlaces();
    return places.filter(place => 
      features.some(feature => 
        place.features.some(placeFeature => 
          placeFeature.toLowerCase().includes(feature.toLowerCase())
        )
      )
    );
  } catch (error) {
    console.error('Error filtering places:', error);
    return [];
  }
};

/**
 * Filter places by age range
 * @param {string} ageQuery - Age query (e.g., "2 years", "18 months")
 * @returns {Promise<Array>} Filtered array of places
 */
export const getPlacesByAge = async (ageQuery) => {
  try {
    const places = await getPlaces();
    // Simple filtering - in a real app, this would be more sophisticated
    return places.filter(place => 
      place.ageRange.toLowerCase().includes(ageQuery.toLowerCase())
    );
  } catch (error) {
    console.error('Error filtering places by age:', error);
    return [];
  }
};

/**
 * Add a new place (for future admin functionality)
 * @param {Object} newPlace - New place object
 * @returns {Promise<boolean>} Success status
 */
export const addPlace = async (newPlace) => {
  // In a real app, this would make an API call to add the place
  console.log('Adding new place:', newPlace);
  // For now, just return success
  return Promise.resolve(true);
};

/**
 * Update an existing place (for future admin functionality)
 * @param {number} id - Place ID to update
 * @param {Object} updatedPlace - Updated place data
 * @returns {Promise<boolean>} Success status
 */
export const updatePlace = async (id, updatedPlace) => {
  // In a real app, this would make an API call to update the place
  console.log('Updating place:', id, updatedPlace);
  // For now, just return success
  return Promise.resolve(true);
};

/**
 * Delete a place (for future admin functionality)
 * @param {number} id - Place ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePlace = async (id) => {
  // In a real app, this would make an API call to delete the place
  console.log('Deleting place:', id);
  // For now, just return success
  return Promise.resolve(true);
};
