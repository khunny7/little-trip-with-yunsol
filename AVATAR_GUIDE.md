# Image Loading and Rate Limiting

## Issue
Google profile images may return "429 Too Many Requests" errors when there are too many concurrent requests or rapid page refreshes.

## Solutions Implemented

### 1. Avatar Component with Caching
- **In-memory caching**: Images are cached to prevent repeated requests
- **Lazy loading**: Images load only when needed
- **Error handling**: Graceful fallback to initials when images fail
- **Rate limit aware**: Better error messages for rate limiting

### 2. Cache Management
- **Automatic cleanup**: Cache is cleared when it gets too large
- **Manual clearing**: `clearImageCache()` function available for debugging
- **Smart fallbacks**: Shows user initials instead of broken images

### 3. Performance Optimizations
- **Single request per image**: Cached images prevent duplicate requests
- **Loading states**: Shows spinner while loading
- **Memory management**: Prevents cache from growing indefinitely
- **Default avatar fallback**: Beautiful SVG avatar when profile images fail
- **Flexible fallbacks**: Option to use initials or default image

## Fallback Options
1. **Default Image** (recommended): Shows a beautiful default avatar SVG
2. **Initials**: Shows user's initials in a colored circle
3. **Custom**: Can be configured per component

## Usage

```jsx
import Avatar from './components/Avatar';

// Basic usage - shows default avatar image on failure
<Avatar src={user.photoURL} alt="Profile" />

// With custom size and fallback initials instead of default image
<Avatar 
  src={user.photoURL}
  size="large"
  fallbackInitials={user.displayName?.charAt(0)}
  showDefaultImage={false}
/>

// Large avatar with default image fallback (recommended)
<Avatar 
  src={user.photoURL}
  size="xlarge"
  alt={user.displayName}
  showDefaultImage={true}
/>
```

## Available Sizes
- `small`: 24x24px
- `medium`: 40x40px (default)
- `large`: 80x80px
- `xlarge`: 120x120px

## Props
- `src`: Profile image URL
- `alt`: Alt text for accessibility (default: 'Profile')
- `size`: Avatar size - small/medium/large/xlarge (default: 'medium')
- `className`: Additional CSS classes
- `fallbackInitials`: Text to show when using initials fallback (default: '?')
- `showDefaultImage`: Whether to show default avatar image or initials on failure (default: true)

## Rate Limiting Recovery
If you encounter 429 errors:
1. **Default Image Fallback**: Shows beautiful default avatar instead of broken images
2. **Automatic caching**: Prevents repeated failed requests
3. **Console warnings**: Indicate rate limiting for debugging
4. **Graceful degradation**: Users see consistent avatar experience

## Fallback Behavior Examples

### Scenario 1: Rate Limited Google Image (Default Behavior)
```jsx
<Avatar src="https://lh3.googleusercontent.com/..." />
// ✅ Shows: Default avatar SVG (professional looking)
```

### Scenario 2: Rate Limited with Initials Preference
```jsx
<Avatar 
  src="https://lh3.googleusercontent.com/..." 
  showDefaultImage={false}
  fallbackInitials="JS" 
/>
// ✅ Shows: "JS" in colored circle
```

### Scenario 3: No Image URL Provided
```jsx
<Avatar src={null} fallbackInitials="Guest" />
// ✅ Shows: Default avatar SVG (since showDefaultImage defaults to true)
```

## Development Tips
- Avoid rapid page refreshes when signed in
- Use browser's network throttling to test fallbacks
- Clear cache if needed: `import { clearImageCache } from '../utils/imageCache'`
