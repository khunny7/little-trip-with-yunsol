import React, { useState, useEffect } from 'react';
import { getAllUsers, makeUserAdmin, isCurrentUserAdmin } from '../utils/userManager';
import styles from './UserManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if current user is admin
        const adminStatus = await isCurrentUserAdmin();
        setUserIsAdmin(adminStatus);
        
        if (adminStatus) {
          // Load all users if current user is admin
          const allUsers = await getAllUsers();
          setUsers(allUsers);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    if (!userIsAdmin) {
      setError('You must be an admin to modify user permissions');
      return;
    }

    setUpdatingUser(userId);
    setError('');

    try {
      await makeUserAdmin(userId, !currentAdminStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentAdminStatus, adminUpdatedAt: new Date().toISOString() }
          : user
      ));
    } catch (err) {
      setError(`Failed to update user: ${err.message}`);
      console.error('Error updating user:', err);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  if (!userIsAdmin) {
    return (
      <div className={styles.noAccess}>
        <h3>Access Denied</h3>
        <p>You must be an admin to view user management.</p>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h2>User Management</h2>
        <p>Manage admin permissions for all registered users</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div>User</div>
          <div>Email</div>
          <div>Joined</div>
          <div>Admin Status</div>
          <div>Actions</div>
        </div>

        {users.map(user => (
          <div key={user.id} className={styles.userRow}>
            <div className={styles.userInfo}>
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className={styles.avatar}
                />
              )}
              <div>
                <div className={styles.displayName}>
                  {user.displayName || 'Unknown User'}
                </div>
                <div className={styles.userId}>{user.id}</div>
              </div>
            </div>
            
            <div className={styles.email}>{user.email}</div>
            
            <div className={styles.joinDate}>
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
            
            <div className={styles.adminStatus}>
              <span className={`${styles.badge} ${user.isAdmin ? styles.admin : styles.user}`}>
                {user.isAdmin ? '✅ Admin' : '👤 User'}
              </span>
            </div>
            
            <div className={styles.actions}>
              <button
                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                disabled={updatingUser === user.id}
                className={`${styles.button} ${user.isAdmin ? styles.demote : styles.promote}`}
              >
                {updatingUser === user.id 
                  ? 'Updating...' 
                  : user.isAdmin 
                    ? 'Remove Admin' 
                    : 'Make Admin'
                }
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className={styles.noUsers}>
            <p>No users found.</p>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h4>📋 User Management Guide</h4>
        <ul>
          <li><strong>Admin Users:</strong> Can modify places, tips, and manage other users</li>
          <li><strong>Regular Users:</strong> Can browse the website but cannot make changes</li>
          <li><strong>Auto-Creation:</strong> User records are created automatically when someone signs in</li>
          <li><strong>Default Status:</strong> New users are NOT admin by default (except via setup page)</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
