// Migration utilities for the admin panel
import { getPlaces, getTips } from '../data/dataService.js';
import { db } from '../config/firebase.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Load JSON data for migration
const loadJSONData = async () => {
  try {
    // Import the JSON data directly
    const placesData = await import('../data/places.json');
    return placesData.default || placesData;
  } catch (error) {
    console.error('Error loading JSON data:', error);
    throw new Error('Could not load places.json data');
  }
};

// Clear all existing data from a collection
const clearCollection = async (collectionName) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  const deletePromises = snapshot.docs.map(document => 
    deleteDoc(doc(db, collectionName, document.id))
  );
  
  await Promise.all(deletePromises);
  console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
};

// Migrate places to Firebase
const migratePlaces = async () => {
  try {
    console.log('📍 Starting places migration...');
    
    // Clear existing places
    await clearCollection('places');
    
    // Load fresh data
    const data = await loadJSONData();
    const places = data.places || [];
    
    if (!places.length) {
      throw new Error('No places found in JSON data');
    }
    
    console.log(`Found ${places.length} places to migrate`);
    
    // Add each place to Firebase
    const placesCollection = collection(db, 'places');
    const addPromises = places.map(async (place) => {
      const { id: _id, ...placeData } = place; // Remove the local id
      const docRef = await addDoc(placesCollection, placeData);
      console.log(`✅ Migrated place: ${place.name} (Firebase ID: ${docRef.id})`);
      return docRef;
    });
    
    await Promise.all(addPromises);
    console.log(`✅ Successfully migrated ${places.length} places to Firebase`);
    
    return { success: true, count: places.length };
  } catch (error) {
    console.error('❌ Places migration failed:', error);
    throw error;
  }
};

// Migrate tips to Firebase
const migrateTips = async () => {
  try {
    console.log('💡 Starting tips migration...');
    
    // Clear existing tips
    await clearCollection('tips');
    
    // Load fresh data
    const data = await loadJSONData();
    const tips = data.tips || [];
    
    if (!tips.length) {
      console.log('⚠️ No tips found in JSON data, skipping tips migration');
      return { success: true, count: 0 };
    }
    
    console.log(`Found ${tips.length} tips to migrate`);
    
    // Add each tip to Firebase
    const tipsCollection = collection(db, 'tips');
    const addPromises = tips.map(async (tip) => {
      const { id: _id, ...tipData } = tip; // Remove the local id
      const docRef = await addDoc(tipsCollection, tipData);
      console.log(`✅ Migrated tip: ${tip.title} (Firebase ID: ${docRef.id})`);
      return docRef;
    });
    
    await Promise.all(addPromises);
    console.log(`✅ Successfully migrated ${tips.length} tips to Firebase`);
    
    return { success: true, count: tips.length };
  } catch (error) {
    console.error('❌ Tips migration failed:', error);
    throw error;
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting Firebase data migration...');
    
    const placesResult = await migratePlaces();
    const tipsResult = await migrateTips();
    
    console.log('✅ Migration completed successfully!');
    console.log(`Migrated ${placesResult.count} places and ${tipsResult.count} tips`);
    
    return {
      success: true,
      message: `Migration completed! Migrated ${placesResult.count} places and ${tipsResult.count} tips.`,
      places: placesResult.count,
      tips: tipsResult.count
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      error: error.message
    };
  }
};

export const migrationUtils = {
    async testConnection() {
        try {
            const placesCollection = collection(db, 'places');
            const snapshot = await getDocs(placesCollection);
            return {
                success: true,
                message: `Connection successful! Found ${snapshot.size} documents in places collection.`
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`
            };
        }
    },

    async runMigration() {
        try {
            const result = await runMigration();
            return result;
        } catch (error) {
            return {
                success: false,
                message: `Migration failed: ${error.message}`
            };
        }
    },

    async viewFirebaseData() {
        try {
            const places = await getPlaces();
            const tips = await getTips();
            
            let message = `Found ${places.length} places in Firebase:\n`;
            places.forEach(place => {
                message += `  - ${place.name} (ID: ${place.id})\n`;
            });
            
            message += `\nFound ${tips.length} tips in Firebase:\n`;
            tips.forEach(tip => {
                message += `  - ${tip.title} (ID: ${tip.id})\n`;
            });
            
            return {
                success: true,
                message,
                data: { places, tips }
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to load data: ${error.message}`
            };
        }
    }
};
