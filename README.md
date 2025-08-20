# Little Trip with Yunsol 👶🌟

A React-based web application for discovering toddler-friendly places, featuring dynamic filtering, responsive design, and personalized experiences from Yunsol's adventures.

## 🎯 Features

### 🏠 **Homepage**
- Beautiful hero section with curved divider design
- Dynamic place cards with quick info (location, pricing, duration)
- Interactive filtering system with collapsible sidebar
- Responsive design that adapts to desktop, tablet, and mobile

### 🔍 **Advanced Filtering**
- **By Features**: Filter places by amenities (Indoor Play, Educational, etc.) with AND logic
- **By Age Range**: Dual slider for precise age range selection (0-8 years)
- **By Pricing**: Filter by budget levels (Free, $, $$, $$$)
- **Real-time Results**: Live count of filtered results
- **Collapsible Design**: Sidebar on desktop, top panel on mobile

### 📍 **Place Details**
- Comprehensive information including:
  - Address, phone, website, and parking info
  - Duration of visit and best time to go
  - Cleanliness ratings and comfort information
  - Prominent pricing display with explanations

### 👶 **Yunsol's Personal Experience**
- **Visit Status**: Shows if Yunsol has been there
- **Star Ratings**: Personal ratings from 1-5 stars
- **Likes & Dislikes**: Honest feedback about each place
- **Personal Notes**: Insider tips and recommendations

## 🛠 Technology Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM
- **Styling**: CSS Modules + Global CSS
- **Data**: JSON-based with service layer
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/khunny7/little-trip-with-yunsol.git

# Navigate to project directory
cd little-trip-with-yunsol

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Filter.jsx       # Advanced filtering component
│   ├── PlaceCard.jsx    # Place preview cards
│   ├── PlaceDetail.jsx  # Detailed place information
│   ├── TipCard.jsx      # Tips and recommendations
│   └── index.js         # Component exports
├── data/                # Data layer
│   ├── places.json      # Places database
│   └── dataService.js   # Data access functions
├── pages/               # Main page components
│   └── Home.jsx         # Homepage with filtering
├── App.jsx              # Main app component
└── main.jsx            # Application entry point
```

## 🎨 Design Features

### Responsive Layout
- **Desktop**: Sidebar filter with main content grid
- **Tablet/Mobile**: Top filter panel with stacked layout
- **Collapsible**: Minimal space usage when filter is collapsed

### Visual Elements
- **Curved Dividers**: Smooth transition between sections
- **Color Scheme**: Warm, family-friendly palette
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 📊 Data Structure

### Places JSON Schema
```json
{
  "id": 1,
  "name": "Place Name",
  "description": "Detailed description",
  "features": ["Indoor Play", "Educational"],
  "ageRange": [6, 60],  // months
  "pricing": "$$",      // Free, $, $$, $$$
  "yunsolExperience": {
    "hasVisited": true,
    "rating": 5,
    "likes": "What Yunsol loved...",
    "dislikes": "What could be better...",
    "personalNotes": "Personal insights..."
  }
}
```

## 🔧 Configuration

### Development
- Hot module reloading enabled
- ESLint configuration for code quality
- Vite for fast development and building

### Deployment
The project is configured for easy deployment to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and created for personal use.

## 👨‍👩‍👧 About

Created with ❤️ for exploring the world with toddlers. This application helps families find the perfect places for memorable adventures with their little ones.

---

**Live Demo**: [Visit the site](https://your-deployed-url.com) (Coming Soon!)
**Repository**: [GitHub](https://github.com/khunny7/little-trip-with-yunsol)

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
