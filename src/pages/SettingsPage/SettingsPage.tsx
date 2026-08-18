import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/authSlice';
import { updateUserProfile } from '../../services/firestore.service';
import { SettingsPageProps } from './SettingsPage.types';
import styles from './SettingsPage.module.scss';
import { Loader2 } from 'lucide-react';

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state if user updates elsewhere
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const newAvatarUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
      
      const updateData = {
        firstName,
        lastName,
        avatarUrl: newAvatarUrl
      };

      // 1. Update in Firestore
      await updateUserProfile(user.id, updateData);

      // 2. Update Redux store
      dispatch(updateUser(updateData));

      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Account Settings</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
            alt="Profile Avatar" 
            className={styles.avatar} 
          />
          <div className={styles.roleBadge}>{user.role}</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={user.email} 
              disabled 
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="text" 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="text" 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn} disabled={isSaving}>
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
          
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
