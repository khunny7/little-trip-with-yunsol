# Little Trip with Yunsol 🌟

A beautiful React website showcasing toddler-friendly places to visit, designed to help parents discover amazing adventures with their little ones.

## Features

- 🎨 Beautiful, responsive design optimized for all devices
- 🏛️ Curated list of toddler-friendly places with detailed information
- 💡 Helpful tips for successful outings with toddlers
- 📱 Mobile-first responsive design
- ⚡ Fast loading with smooth animations
- 🔄 Dynamic content loading from JSON data

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

### Building for Production
```bash
npm run build
```

## Managing Content

### Adding New Places

To add a new place, edit `src/data/places.json` and add a new object to the `places` array:

```json
{
  "id": 7,
  "name": "New Amazing Place",
  "description": "Description of the place and why it's great for toddlers.",
  "features": ["Feature1", "Feature2", "Feature3"],
  "ageRange": "6 months - 4 years",
  "icon": "🎈"
}
```

#### Place Object Properties:
- **id**: Unique identifier (number)
- **name**: Name of the place (string)
- **description**: Detailed description (string)
- **features**: Array of feature tags (array of strings)
- **ageRange**: Recommended age range (string)
- **icon**: Emoji representation (string)

### Adding New Tips

To add a new tip, edit `src/data/places.json` and add a new object to the `tips` array:

```json
{
  "id": 5,
  "icon": "🎯",
  "title": "New Tip Title",
  "description": "Helpful advice for parents taking toddlers on adventures."
}
```

#### Tip Object Properties:
- **id**: Unique identifier (number)
- **icon**: Emoji representation (string)
- **title**: Tip title (string)
- **description**: Detailed tip description (string)

## Data Service

The app uses a data service (`src/data/dataService.js`) that provides utility functions for managing data:

- `getPlaces()` - Load all places
- `getTips()` - Load all tips
- `getPlaceById(id)` - Get a specific place
- `getPlacesByFeatures(features)` - Filter places by features
- `getPlacesByAge(ageQuery)` - Filter places by age
- `addPlace(newPlace)` - Add a new place (future admin functionality)
- `updatePlace(id, updatedPlace)` - Update existing place (future admin functionality)
- `deletePlace(id)` - Delete a place (future admin functionality)

## Future Enhancements

The architecture supports easy expansion:

1. **Admin Panel**: Add CRUD operations for places and tips
2. **Search & Filter**: Implement search and filtering functionality
3. **User Reviews**: Add user-generated content and reviews
4. **Map Integration**: Show places on an interactive map
5. **Favorites**: Let users save favorite places
6. **API Integration**: Replace JSON files with REST API or GraphQL
7. **User Authentication**: Add user accounts and personalization
8. **Content Management**: Admin interface for content management

## File Structure

```
src/
├── data/
│   ├── places.json          # Places and tips data
│   └── dataService.js       # Data utility functions
├── App.jsx                  # Main React component
├── App.css                  # App-specific styles
├── index.css               # Global styles
└── main.jsx                # React entry point
```

## Technology Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **CSS3** - Styling with gradients, animations, and responsive design
- **JSON** - Data storage (easily replaceable with API)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update the data files as needed
5. Test your changes
6. Submit a pull request

## License

This project is open source and available under the MIT License.

---

Made with ❤️ for families exploring the world with their toddlers!

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
