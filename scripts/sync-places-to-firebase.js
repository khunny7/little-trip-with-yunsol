/**
 * Sync cleaned places.json with Firebase Firestore
 * This script will:
 * 1. Compare local places.json with Firebase collection
 * 2. Remove any places from Firebase that are not in local file
 * 3. Update/add places that exist in local file
 * 4. Maintain data consistency between local and remote
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNPpUBWkKpQQe--UKdKJYn_3Cz2xLQP98",
  authDomain: "little-trip-with-yunsol.firebaseapp.com",
  projectId: "little-trip-with-yunsol",
  storageBucket: "little-trip-with-yunsol.firebasestorage.app",
  messagingSenderId: "576062043892",
  appId: "1:576062043892:web:c86b63db7e83fbf95a3c55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncPlacesToFirebase() {
  try {
    console.log('🔄 Starting sync process...');
    
    // 1. Load local places.json
    const placesPath = path.join(process.cwd(), 'src', 'data', 'places.json');
    const placesData = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
    const localPlaces = placesData.places;
    
    console.log(`📁 Loaded ${localPlaces.length} places from local file`);
    
    // 2. Get all places from Firebase
    const placesRef = collection(db, 'places');
    const snapshot = await getDocs(placesRef);
    const firebasePlaces = [];
    
    snapshot.forEach((doc) => {
      firebasePlaces.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`☁️  Found ${firebasePlaces.length} places in Firebase`);
    
    // 3. Create maps for comparison
    const localPlaceIds = new Set(localPlaces.map(place => place.id.toString()));
    const firebasePlaceIds = new Set(firebasePlaces.map(place => place.id.toString()));
    
    // 4. Find places to delete (exist in Firebase but not in local)
    const placesToDelete = firebasePlaces.filter(place => 
      !localPlaceIds.has(place.id.toString())
    );
    
    // 5. Find places to add/update (exist in local)
    const placesToUpdate = localPlaces;
    
    console.log(`🗑️  Places to delete: ${placesToDelete.length}`);
    console.log(`📝 Places to update/add: ${placesToUpdate.length}`);
    
    // 6. Delete removed places from Firebase
    if (placesToDelete.length > 0) {
      console.log('\n🗑️  Deleting removed places from Firebase:');
      for (const place of placesToDelete) {
        try {
          await deleteDoc(doc(db, 'places', place.id.toString()));
          console.log(`   ✅ Deleted: ${place.name} (ID: ${place.id})`);
        } catch (error) {
          console.error(`   ❌ Failed to delete ${place.name}:`, error.message);
        }
      }
    }
    
    // 7. Update/add places to Firebase
    console.log('\n📝 Updating places in Firebase:');
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const place of placesToUpdate) {
      try {
        const isExisting = firebasePlaceIds.has(place.id.toString());
        await setDoc(doc(db, 'places', place.id.toString()), place);
        
        if (isExisting) {
          console.log(`   🔄 Updated: ${place.name} (ID: ${place.id})`);
          updatedCount++;
        } else {
          console.log(`   ➕ Added: ${place.name} (ID: ${place.id})`);
          addedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Failed to update ${place.name}:`, error.message);
      }
    }
    
    // 8. Summary
    console.log('\n✅ Sync completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Places deleted: ${placesToDelete.length}`);
    console.log(`   - Places added: ${addedCount}`);
    console.log(`   - Places updated: ${updatedCount}`);
    console.log(`   - Total places in Firebase: ${localPlaces.length}`);
    
    // 9. Verify final count
    const finalSnapshot = await getDocs(placesRef);
    console.log(`🔍 Verification: Firebase now has ${finalSnapshot.size} places`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncPlacesToFirebase()
  .then(() => {
    console.log('\n🎉 All done! Your Firebase data is now in sync with places.json');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sync process failed:', error);
    process.exit(1);
  });
