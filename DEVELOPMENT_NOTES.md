# Development Notes

## Known Issues

### Cross-Origin-Opener-Policy (COOP) Error with Google Sign-In

**Error:** `Cross-Origin-Opener-Policy policy would block the window.close call`

**Description:** This is a browser security warning that appears when using Google Sign-In with Firebase Auth in development environments (localhost). It's related to Google's OAuth popup flow and COOP headers.

**Impact:** 
- The error appears in the console but doesn't break functionality
- Users can still sign in successfully
- This typically doesn't occur in production environments

**Mitigations Applied:**
1. Added custom parameters to GoogleAuthProvider
2. Improved error handling for popup-related issues
3. Added better user feedback for popup blocking scenarios

**Production Note:** This issue typically resolves itself in production environments with proper domain configuration.

**Alternative Solutions (if needed):**
- Switch to `signInWithRedirect` instead of `signInWithPopup`
- Configure proper COOP headers in production
- Use Firebase Auth emulator for development testing
