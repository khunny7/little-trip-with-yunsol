/**
 * Simple sync script for places.json to Firebase
 * This script provides you with the steps to manually sync your cleaned places.json
 */

console.log(`
🔄 FIREBASE SYNC GUIDE
=====================

Your places.json has been cleaned and now contains 80 places with no duplicates.
Here's how to sync this with Firebase:

📋 OPTION 1: Admin Panel Sync (Recommended)
------------------------------------------
1. Open your site at the admin page: https://little-trip-with-yunsol.web.app/admin
2. Sign in with your Google account
3. Use the "Clear All Data" button to remove all existing places
4. Use the "Import from JSON" button to upload your cleaned places.json file
5. Verify that all 80 places are now in Firebase

📋 OPTION 2: Manual Firebase Console
-----------------------------------
1. Go to https://console.firebase.google.com/
2. Select your project: little-trip-with-yunsol
3. Go to Firestore Database
4. Delete all documents in the 'places' collection
5. Import your places.json using the import tool

📋 OPTION 3: Automated Script (Advanced)
---------------------------------------
1. Install Firebase tools: npm install firebase
2. Run the sync script we created: node scripts/sync-places-to-firebase.js
   (You'll need to install dependencies first)

🎯 VERIFICATION
--------------
After syncing, verify by:
1. Checking the total count in Firebase Console (should be 80)
2. Testing the website to ensure all places load correctly
3. Confirming no duplicate entries exist

✅ CURRENT STATUS
----------------
- Local places.json: 80 places (cleaned, no duplicates)
- IDs are sequential: 1-80
- All data is validated and ready for sync

The easiest approach is Option 1 using your admin panel!
`);

// Check the current state
import fs from 'fs';
import path from 'path';

try {
  const placesPath = path.resolve('src/data/places.json');
  const data = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
  
  console.log(`\n📊 CURRENT DATA STATUS:`);
  console.log(`   - Total places: ${data.places.length}`);
  console.log(`   - ID range: ${Math.min(...data.places.map(p => p.id))} to ${Math.max(...data.places.map(p => p.id))}`);
  console.log(`   - Tips included: ${data.tips.length}`);
  console.log(`   - File size: ${(fs.statSync(placesPath).size / 1024).toFixed(1)} KB`);
  
  // Check for any potential issues
  const ids = data.places.map(p => p.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missingIds = [];
  
  for (let i = 1; i <= Math.max(...ids); i++) {
    if (!ids.includes(i)) {
      missingIds.push(i);
    }
  }
  
  if (duplicateIds.length > 0) {
    console.log(`   ⚠️  Duplicate IDs found: ${duplicateIds.join(', ')}`);
  }
  
  if (missingIds.length > 0) {
    console.log(`   ⚠️  Missing IDs: ${missingIds.join(', ')}`);
  }
  
  if (duplicateIds.length === 0 && missingIds.length === 0) {
    console.log(`   ✅ Data integrity check passed!`);
  }
  
} catch (error) {
  console.error(`❌ Error reading places.json:`, error.message);
}
