@echo off
echo 🔄 Firebase Sync Tool
echo ==================
echo.
echo This will sync your cleaned places.json with Firebase Firestore
echo Make sure you have an internet connection and Firebase access
echo.
pause

echo Installing dependencies...
cd scripts
call npm install

echo.
echo Running sync script...
node sync-places-to-firebase.js

echo.
echo Sync completed! Check the output above for results.
pause
