import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import ThemeProvider from './design/ThemeProvider'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const Setup = lazy(() => import('./pages/Setup'))
const PlaceDetail = lazy(() => import('./components/PlaceDetail'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const MapPage = lazy(() => import('./pages/Map'))
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'))

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <div className="app-shell">
            <Router>
              <Suspense fallback={
                <div className="loading-container">
                  <div className="loading-spinner">
                    <h2>Loading... 🌟</h2>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/place/:id" element={<PlaceDetail />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminPanelPage />} />
                  <Route path="/admin-panel" element={<AdminPanelPage />} />
                  <Route path="/map" element={<Home />} />
                  <Route path="/setup" element={<Setup />} />
                </Routes>
              </Suspense>
            </Router>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </AppProvider>
  )
}

export default App
