import React from 'react';
import { X } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setHasSeenViewerModal } from '../../store/uiSlice';
import styles from './ViewerWelcomeModal.module.scss';

export const ViewerWelcomeModal: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(setHasSeenViewerModal());
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button 
          className={styles.closeIcon} 
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className={styles.content}>
          <h2 className={styles.title}>Welcome to Project Alpha</h2>
          <p className={styles.message}>
            You are currently logged in as a Viewer. You can browse tasks, view analytics, and read messages. Admin credentials are required to create, edit, or delete project resources.
          </p>
          <button 
            className={styles.primaryButton}
            onClick={handleClose}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
