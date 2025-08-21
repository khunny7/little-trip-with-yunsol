import React, { useState } from 'react';
import { migrationUtils } from '../utils/migrationUtils.js';
import styles from './MigrationPanel.module.css';

const MigrationPanel = () => {
  const [status, setStatus] = useState({ message: '', type: '' });
  const [logs, setLogs] = useState(['Migration panel loaded. Ready to migrate data to Firebase!']);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'testing', 'success', 'error'

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const setStatusMessage = (message, type = 'info') => {
    setStatus({ message, type });
    addLog(message);
  };

  const testFirebaseConnection = async () => {
    setConnectionStatus('testing');
    setIsLoading(true);
    
    try {
      setStatusMessage('Testing Firebase connection...', 'warning');
      
      const result = await migrationUtils.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setStatusMessage('✅ Firebase connection successful!', 'success');
      } else {
        setConnectionStatus('error');
        setStatusMessage(`❌ Firebase connection failed: ${result.message}`, 'error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`❌ Connection test failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runMigrationHandler = async () => {
    setIsLoading(true);
    
    try {
      setStatusMessage('🚀 Starting data migration...', 'warning');
      
      const result = await migrationUtils.runMigration();
      
      if (result.success) {
        setStatusMessage('✅ Migration completed successfully!', 'success');
        setStatusMessage('You can now use Firebase as your data source.', 'success');
      } else {
        setStatusMessage(`❌ Migration failed: ${result.message}`, 'error');
      }
    } catch (error) {
      setStatusMessage(`❌ Migration failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const viewFirebaseData = async () => {
    setIsLoading(true);
    
    try {
      setStatusMessage('Fetching data from Firebase...', 'warning');
      
      const result = await migrationUtils.viewFirebaseData();
      
      if (result.success) {
        setStatusMessage('✅ Firebase data retrieved successfully!', 'success');
        addLog(result.message);
      } else {
        setStatusMessage(`❌ Failed to fetch Firebase data: ${result.message}`, 'error');
      }
    } catch (error) {
      setStatusMessage(`❌ Failed to fetch data: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs(['Migration panel loaded. Ready to migrate data to Firebase!']);
    setStatus({ message: '', type: '' });
  };

  return (
    <div className={styles.migrationContainer}>
      <div className={styles.header}>
        <h2>🚀 Firebase Migration Tool</h2>
        <p>This tool will migrate your places and tips data from JSON to Firebase Firestore.</p>
      </div>

      {/* Status */}
      {status.message && (
        <div className={`${styles.status} ${styles[status.type]}`}>
          {status.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button 
          onClick={testFirebaseConnection} 
          disabled={isLoading}
          className={`${styles.button} ${connectionStatus === 'success' ? styles.success : ''}`}
        >
          {connectionStatus === 'testing' ? (
            '🔄 Testing...'
          ) : connectionStatus === 'success' ? (
            '✅ Connection OK'
          ) : (
            '🔗 Test Firebase Connection'
          )}
        </button>

        <button 
          onClick={runMigrationHandler} 
          disabled={isLoading || connectionStatus !== 'success'}
          className={styles.button}
        >
          {isLoading ? '🔄 Migrating...' : '📊 Migrate Data to Firebase'}
        </button>

        <button 
          onClick={viewFirebaseData} 
          disabled={isLoading}
          className={styles.button}
        >
          👀 View Firebase Data
        </button>

        <button 
          onClick={clearLogs} 
          disabled={isLoading}
          className={`${styles.button} ${styles.secondary}`}
        >
          🧹 Clear Logs
        </button>
      </div>

      {/* Migration Instructions */}
      <div className={styles.instructions}>
        <h3>📋 Migration Instructions</h3>
        <ol>
          <li><strong>Test Connection:</strong> First, test your Firebase connection to ensure everything is set up correctly.</li>
          <li><strong>Backup Data:</strong> Make sure your JSON data is backed up before migration.</li>
          <li><strong>Run Migration:</strong> Click "Migrate Data" to transfer all places and tips to Firebase.</li>
          <li><strong>Verify:</strong> Use "View Firebase Data" to confirm the migration was successful.</li>
        </ol>
        
        <div className={styles.warning}>
          <strong>⚠️ Warning:</strong> This migration will replace existing Firebase data. Make sure to backup your Firestore data if you have any.
        </div>
      </div>

      {/* Logs */}
      <div className={styles.logsSection}>
        <h3>📝 Migration Logs</h3>
        <div className={styles.logs}>
          {logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MigrationPanel;
