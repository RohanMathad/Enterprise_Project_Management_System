import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import styles from './TopNav.module.scss';
import { TopNavProps } from './TopNav.types';
import { useAppSelector } from '../../store/hooks';
import { subscribeToTasks } from '../../services/firestore.service';
import { Task } from '../../types/global.types';

export const TopNav: React.FC<TopNavProps> = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTasks((fetchedTasks) => setTasks(fetchedTasks));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setHasUnread(false);
    }
  };

  // Filter recent activities (last 24 hours)
  const recentActivities = tasks
    .filter(t => (Date.now() - new Date(t.createdAt).getTime()) < 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <h2 className={styles.brand}>Orbit</h2>
        <nav className={styles.navLinks}>
          <NavLink to="/dashboard" className={({ isActive }) => clsx(isActive && styles.active)}>Projects</NavLink>
          <NavLink to="/team" className={({ isActive }) => clsx(isActive && styles.active)}>Team</NavLink>
          <NavLink to="/settings" className={({ isActive }) => clsx(isActive && styles.active)}>Settings</NavLink>
        </nav>
      </div>

      <div className={styles.right}>
        <div className={styles.notificationWrapper} ref={dropdownRef}>
          <button 
            className={styles.iconButton} 
            onClick={handleOpenNotifications}
          >
            <Bell size={20} />
            {hasUnread && recentActivities.length > 0 && (
              <span className={styles.badge}>{recentActivities.length}</span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h4>Notifications</h4>
              </div>
              <div className={styles.dropdownBody}>
                {recentActivities.length > 0 ? (
                  recentActivities.map(task => (
                    <div key={task.id} className={styles.notificationItem}>
                      <div className={styles.notificationContent}>
                        <p><strong>{task.assignee?.firstName || 'Someone'}</strong> created task: {task.title}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyNotifications}>No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.avatar}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} />
          ) : (
            <div className={styles.avatarFallback}>
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
