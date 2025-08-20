// Migration utilities for the HTML tool
import { runMigration } from '../scripts/migrateToFirebase.js';
import { getPlaces, getTips } from '../data/dataService.js';
import { db } from '../config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

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
            await runMigration();
            return {
                success: true,
                message: 'Migration completed successfully!'
            };
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
