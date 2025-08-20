// Firebase data migration script
// Run this once to migrate your JSON data to Firebase
import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Load places data from JSON file
 */
const loadPlacesData = async () => {
  try {
    const response = await import('../data/places.json');
    return response.default;
  } catch (error) {
    console.error('Error loading places data:', error);
    return { places: [], tips: [] };
  }
};

/**
 * Clear all existing data from a collection
 * @param {string} collectionName - Name of the collection to clear
 */
const clearCollection = async (collectionName) => {
  console.log(`Clearing ${collectionName} collection...`);
  const querySnapshot = await getDocs(collection(db, collectionName));
  
  const deletePromises = querySnapshot.docs.map(document => 
    deleteDoc(doc(db, collectionName, document.id))
  );
  
  await Promise.all(deletePromises);
  console.log(`${collectionName} collection cleared.`);
};

/**
 * Migrate places data to Firebase
 */
const migratePlaces = async () => {
  try {
    console.log('Starting places migration...');
    
    // Load data from JSON
    const placesData = await loadPlacesData();
    
    // Clear existing places
    await clearCollection('places');
    
    // Add places from JSON
    const places = placesData.places || [];
    console.log(`Migrating ${places.length} places...`);
    
    for (const place of places) {
      // Remove the 'id' field since Firestore will generate its own
      const { id, ...placeData } = place;
      
      const docRef = await addDoc(collection(db, 'places'), {
        ...placeData,
        originalId: id, // Keep the original ID for reference
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Added place: ${place.name} (${docRef.id})`);
    }
    
    console.log('Places migration completed!');
  } catch (error) {
    console.error('Error migrating places:', error);
  }
};

/**
 * Migrate tips data to Firebase
 */
const migrateTips = async () => {
  try {
    console.log('Starting tips migration...');
    
    // Load data from JSON
    const placesData = await loadPlacesData();
    
    // Clear existing tips
    await clearCollection('tips');
    
    // Add tips from JSON
    const tips = placesData.tips || [];
    console.log(`Migrating ${tips.length} tips...`);
    
    for (const tip of tips) {
      // Remove the 'id' field since Firestore will generate its own
      const { id, ...tipData } = tip;
      
      const docRef = await addDoc(collection(db, 'tips'), {
        ...tipData,
        originalId: id, // Keep the original ID for reference
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Added tip: ${tip.title} (${docRef.id})`);
    }
    
    console.log('Tips migration completed!');
  } catch (error) {
    console.error('Error migrating tips:', error);
  }
};

/**
 * Run the complete migration
 */
export const runMigration = async () => {
  try {
    console.log('Starting Firebase data migration...');
    
    await migratePlaces();
    await migrateTips();
    
    console.log('🎉 Migration completed successfully!');
    console.log('You can now use Firebase as your data source.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Export individual functions for selective migration
export { migratePlaces, migrateTips };
