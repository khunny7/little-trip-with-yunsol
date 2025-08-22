# Location Map Component

## Overview
The `LocationMap` component displays an embedded Google Maps view showing the location of a place, along with helpful action buttons for getting directions and viewing the full map.

## Features
✅ **Embedded Google Maps** - No API key required
✅ **Responsive design** - Works on all screen sizes  
✅ **Action buttons** - Get directions and view on Google Maps
✅ **Error handling** - Fallback when map fails to load
✅ **Accessibility** - Proper titles and labels

## Usage

```jsx
import LocationMap from './components/LocationMap';

<LocationMap 
  address="123 Main St, Seattle, WA 98101"
  placeName="Example Place"
  className="custom-map-styles"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `address` | string | Yes | The street address to display on the map |
| `placeName` | string | No | Name of the place (used for accessibility) |
| `className` | string | No | Additional CSS classes |

## Features

### 🗺️ Interactive Map
- Embedded Google Maps iframe
- No API key required
- Full zoom/pan functionality
- Street view access (if available)

### 🧭 Quick Actions
- **Get Directions**: Opens Google Maps with turn-by-turn directions
- **View on Google Maps**: Opens the full Google Maps interface

### 📱 Mobile Optimized
- Responsive layout for all screen sizes
- Touch-friendly action buttons
- Optimized map height for mobile

### 🔄 Error Handling
- Graceful fallback when map fails to load
- Clear messaging to users
- Alternative access via action buttons

## Implementation Details

### Google Maps URLs
- **Embed**: `https://www.google.com/maps?q=ADDRESS&output=embed`
- **Directions**: `https://www.google.com/maps/dir/?api=1&destination=ADDRESS`
- **Search**: `https://www.google.com/maps/search/?api=1&query=ADDRESS`

### Browser Support
- Works in all modern browsers
- Falls back gracefully in older browsers
- No JavaScript dependencies beyond React

## Styling

The component uses CSS modules for styling:
- `LocationMap.module.css` - All component styles
- Customizable via className prop
- CSS custom properties for theming

## Performance

- **Lazy loading**: Map loads only when needed
- **Minimal bundle impact**: No external dependencies
- **Cached by browser**: Google Maps resources are cached
- **Fast rendering**: Simple iframe implementation

## Future Enhancements

Potential improvements:
- Multiple marker support
- Custom map styling
- Offline map fallback
- Integration with other map providers
