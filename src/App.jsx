import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'))
const Setup = lazy(() => import('./pages/Setup'))
const PlaceDetail = lazy(() => import('./components/PlaceDetail'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <div className="App">
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
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-panel" element={
                  <ProtectedRoute>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/setup" element={<Setup />} />
              </Routes>
            </Suspense>
          </Router>
        </div>
      </ErrorBoundary>
    </AppProvider>
  )
}

export default App
