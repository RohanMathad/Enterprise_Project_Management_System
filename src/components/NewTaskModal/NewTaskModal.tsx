import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NewTaskModalProps } from './NewTaskModal.types';
import styles from './NewTaskModal.module.scss';

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, taskToEdit, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (taskToEdit && isOpen) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setDueDate(taskToEdit.dueDate || '');
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0], // fallback to today
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate('');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title <span style={{color: '#ef4444'}}>*</span></label>
            <input 
              id="title"
              type="text" 
              placeholder="E.g., Update landing page hero" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea 
              id="description"
              placeholder="Add more details about this task..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority</label>
            <select 
              id="priority" 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">Urgent</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="dueDate">Due Date</label>
            <input 
              id="dueDate"
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className={styles.footer}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={!title.trim()}>
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
