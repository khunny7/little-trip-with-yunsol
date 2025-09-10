import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaces, getPlaceById, addPlace, updatePlace, deletePlace } from '../data/dataService';
import PlaceForm from './PlaceForm';
import PlacesList from './PlacesList';
import UserManagement from './UserManagement';
import MigrationPanel from './MigrationPanel';
import styles from './AdminPanel.module.css';

const AdminPanel = ({ user, onLogout }) => {
  // Bulk JSON upload state and handler
  const [jsonInput, setJsonInput] = useState('');
  const [bulkStatus, setBulkStatus] = useState(null);

  const handleBulkUpload = async () => {
    setBulkStatus(null);
    let data;
    try {
      data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) throw new Error('JSON must be an array of place objects');
    } catch (err) {
      setBulkStatus({ message: 'Invalid JSON: ' + err.message, type: 'error' });
      return;
    }
    let success = 0, fail = 0;
    for (const place of data) {
      const result = await addPlace(place);
      if (result) success++; else fail++;
    }
    setBulkStatus({ message: `Upload complete: ${success} succeeded, ${fail} failed.`, type: fail ? 'error' : 'success' });
    setJsonInput('');
    await loadPlaces();
  };
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('places'); // 'places', 'users', or 'migration'
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setStatus({ message: 'Loading places...', type: 'warning' });
      const placesData = await getPlaces();
      setPlaces(placesData);
      setStatus({ message: `Loaded ${placesData.length} places`, type: 'success' });
    } catch (error) {
      setStatus({ message: `Failed to load places: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (placeId) => {
    try {
      const place = await getPlaceById(placeId);
      if (place) {
        setSelectedPlace(place);
        setIsEditing(true);
      }
    } catch (error) {
      setStatus({ message: `Failed to load place: ${error.message}`, type: 'error' });
    }
  };

  const handleSavePlace = async (placeData) => {
    try {
      setStatus({ message: selectedPlace ? 'Updating place...' : 'Adding place...', type: 'warning' });
      
      if (selectedPlace) {
        await updatePlace(selectedPlace.id, placeData);
        setStatus({ message: 'Place updated successfully!', type: 'success' });
      } else {
        await addPlace(placeData);
        setStatus({ message: 'Place added successfully!', type: 'success' });
      }
      
      // Refresh the places list
      await loadPlaces();
      
      // Reset form
      setSelectedPlace(null);
      setIsEditing(false);
    } catch (error) {
      setStatus({ message: `Failed to save place: ${error.message}`, type: 'error' });
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this place?')) {
      return;
    }
    
    try {
      setStatus({ message: 'Deleting place...', type: 'warning' });
      await deletePlace(placeId);
      setStatus({ message: 'Place deleted successfully!', type: 'success' });
      
      // Refresh the places list
      await loadPlaces();
      
      // Clear selection if the deleted place was selected
      if (selectedPlace && selectedPlace.id === placeId) {
        setSelectedPlace(null);
        setIsEditing(false);
      }
    } catch (error) {
      setStatus({ message: `Failed to delete place: ${error.message}`, type: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setSelectedPlace(null);
    setIsEditing(false);
  };

  const handleNewPlace = () => {
    setSelectedPlace(null);
    setIsEditing(true);
  };

  // Filter places by search term
  const filteredPlaces = places.filter(
    p =>
      (!searchTerm ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
      )
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <button onClick={onLogout} className={styles.logoutBtn}>
          Sign Out
        </button>
        <h1>🏰 Little Trip Admin</h1>
        <p>Manage places for Yunsol's adventures</p>
        <p className={styles.userInfo}>Signed in as: {user.email}</p>
      </header>

      <nav className={styles.nav}>
        <Link to="/" className={styles.navBtn}>🏠 Back to Site</Link>
        <button 
          onClick={() => setActiveTab('places')} 
          className={`${styles.navBtn} ${activeTab === 'places' ? styles.active : ''}`}
        >
          📍 Manage Places
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`${styles.navBtn} ${activeTab === 'users' ? styles.active : ''}`}
        >
          👥 Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('migration')} 
          className={`${styles.navBtn} ${activeTab === 'migration' ? styles.active : ''}`}
        >
          🚀 Migration
        </button>
        <button onClick={loadPlaces} className={styles.navBtn}>🔄 Refresh Data</button>
      </nav>

      {status.message && (
        <div className={`${styles.status} ${styles[status.type]}`}>
          {status.message}
        </div>
      )}

      {activeTab === 'places' && (
        <div className={styles.container}>
          <div className={styles.panel}>
            <h2>📍 Places List ({places.length})</h2>
            <input
              type="text"
              placeholder="Search places by name or address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 12, padding: 6, width: "100%" }}
            />
              <PlacesList 
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onSelectPlace={handleSelectPlace}
                onDeletePlace={handleDeletePlace}
              />
            <button 
              onClick={handleNewPlace}
              className={styles.addBtn}
            >
              ➕ Add New Place
            </button>

            {/* Bulk JSON Upload Tool */}
            <div style={{marginTop:32, padding:16, border:'1px solid #eee', borderRadius:12, background:'#fafbfc'}}>
              <h3>Bulk Upload Places (Paste JSON)</h3>
              <textarea
                style={{width:'100%', minHeight:120, fontFamily:'monospace', marginBottom:8}}
                placeholder="Paste JSON array of place objects here"
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
              />
              <button onClick={handleBulkUpload} className={styles.addBtn} style={{marginTop:8}}>⬆️ Upload to Firebase</button>
              {bulkStatus && <div style={{marginTop:8, color: bulkStatus.type==='error' ? 'red' : 'green'}}>{bulkStatus.message}</div>}
            </div>
          </div>
          
          <div className={styles.panel}>
            {isEditing ? (
              <>
                <h2>{selectedPlace ? '✏️ Edit Place' : '➕ Add New Place'}</h2>
                <PlaceForm 
                  place={selectedPlace}
                  onSave={handleSavePlace}
                  onCancel={handleCancelEdit}
                />
                {selectedPlace && (
                  <button
                    onClick={() => handleDeletePlace(selectedPlace.id)}
                    className={styles.deleteBtn}
                    style={{marginTop:12, color:'white', background:'red', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer'}}
                  >🗑️ Delete Place</button>
                )}
              </>
            ) : (
              <div className={styles.emptyPanel}>
                <h2>Welcome to the Admin Panel! 👋</h2>
                <p>Select a place from the list to edit it, or click "Add New Place" to create one.</p>
                <div className={styles.stats}>
                  <div className={styles.statCard}>
                    <h3>{places.length}</h3>
                    <p>Total Places</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>{places.filter(p => p.yunsolExperience?.hasVisited).length}</h3>
                    <p>Visited by Yunsol</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className={styles.container}>
          <UserManagement />
        </div>
      )}

      {activeTab === 'migration' && (
        <div className={styles.container}>
          <MigrationPanel />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
