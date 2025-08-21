import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminPanelPage from './pages/AdminPanelPage'
import Setup from './pages/Setup'
import PlaceDetail from './components/PlaceDetail'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-panel" element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
          } />
          <Route path="/setup" element={<Setup />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
