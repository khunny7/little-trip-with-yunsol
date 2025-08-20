# Firebase Setup Guide for Little Trip with Yunsol

## Prerequisites
- Gmail account for Firebase Console access
- Node.js and npm (already installed)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `little-trip-with-yunsol`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In your Firebase project, click "Firestore Database" in the sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you (e.g., `us-central1`)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Enter app name: `little-trip-with-yunsol`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 4: Update Firebase Configuration

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "little-trip-with-yunsol.firebaseapp.com",
  projectId: "little-trip-with-yunsol",
  storageBucket: "little-trip-with-yunsol.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Set up Firestore Security Rules

1. In Firebase Console → Firestore Database → Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to places and tips
    match /places/{document} {
      allow read: if true;
      allow write: if false; // Disable writes for now
    }
    
    match /tips/{document} {
      allow read: if true;
      allow write: if false; // Disable writes for now
    }
  }
}
```

3. Click "Publish"

## Step 6: Migrate Your Data

1. Make sure your Firebase config is set up correctly
2. Run the migration script:

```bash
npm run dev
```

3. In your browser console, run:

```javascript
import { runMigration } from './src/scripts/migrateToFirebase.js';
runMigration();
```

Or create a temporary migration page to run the script.

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Check browser console for any Firebase connection errors
3. Verify that places and tips load from Firebase
4. Test filtering functionality

## Step 8: Optional - Enable Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**
   - Check that your config values are correct
   - Ensure Firestore is enabled in Firebase Console

2. **"Permission denied"**
   - Verify Firestore security rules allow reading
   - Check that you're reading from correct collection names

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

### Fallback Mode
The app will automatically fall back to loading from `places.json` if Firebase is unavailable, ensuring your site continues to work during development.

## Next Steps

- Enable authentication for admin features
- Set up proper security rules for production
- Consider Firebase Analytics for user insights
- Add real-time updates for collaborative features

## Database Structure

### Places Collection
```
places/
  {documentId}/
    name: string
    description: string
    location: object
    ageRange: [number, number]
    features: string[]
    pricing: string
    yunsolExperience: object
    // ... other fields
```

### Tips Collection
```
tips/
  {documentId}/
    title: string
    description: string
    category: string
    // ... other fields
```
