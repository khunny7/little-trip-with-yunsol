// Firebase data migration script
// Run this once to migrate your JSON data to Firebase
import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Load places data from JSON file
 */
const loadPlacesData = async () => {
  try {
    // Try multiple paths to ensure we get the data
    const possiblePaths = [
      '/src/data/places.json?t=' + Date.now(),
      './src/data/places.json?t=' + Date.now(),
      '../data/places.json?t=' + Date.now()
    ];
    
    let data = null;
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to fetch from: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          data = await response.json();
          console.log(`✅ Successfully loaded data from: ${path}`);
          break;
        } else {
          console.log(`❌ Failed to fetch from ${path}: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.log(`❌ Error fetching from ${path}:`, err.message);
      }
    }
    
    if (!data) {
      throw new Error('Could not load places data from any path');
    }
    
    console.log(`Loaded data contains: ${data.places?.length || 0} places and ${data.tips?.length || 0} tips`);
    
    return data;
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
    console.log('Loaded places data:', placesData);
    
    // Clear existing places
    await clearCollection('places');
    
    // Add places from JSON
    const places = placesData.places || [];
    console.log(`Found ${places.length} places to migrate:`, places.map(p => ({ id: p.id, name: p.name })));
    
    for (const place of places) {
      // Remove the 'id' field since Firestore will generate its own
      const { id, ...placeData } = place;
      
      const docRef = await addDoc(collection(db, 'places'), {
        ...placeData,
        originalId: id, // Keep the original ID for reference
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Added place: ${place.name} (originalId: ${id}, firestoreId: ${docRef.id})`);
    }
    
    console.log('Places migration completed!');
  } catch (error) {
    console.error('Error migrating places:', error);
    throw error;
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
    console.log('Loaded tips data:', placesData.tips);
    
    // Clear existing tips
    await clearCollection('tips');
    
    // Add tips from JSON
    const tips = placesData.tips || [];
    console.log(`Found ${tips.length} tips to migrate:`, tips.map(t => ({ id: t.id, title: t.title })));
    
    for (const tip of tips) {
      // Remove the 'id' field since Firestore will generate its own
      const { id, ...tipData } = tip;
      
      const docRef = await addDoc(collection(db, 'tips'), {
        ...tipData,
        originalId: id, // Keep the original ID for reference
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Added tip: ${tip.title} (originalId: ${id}, firestoreId: ${docRef.id})`);
    }
    
    console.log('Tips migration completed!');
  } catch (error) {
    console.error('Error migrating tips:', error);
    throw error;
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
