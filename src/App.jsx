import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import { PlaceDetail } from './components'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
