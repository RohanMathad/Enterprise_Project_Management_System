import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, MessageSquare, LogOut } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import styles from './Sidebar.module.scss';
import { SidebarProps } from './Sidebar.types';
import clsx from 'clsx';

export const Sidebar: React.FC<SidebarProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>Orbit</h2>
        <h1>Workspace</h1>
        <p>Enterprise Management</p>
      </div>

      <nav className={styles.nav}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/board" 
          className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
        >
          <KanbanSquare size={20} />
          <span>Kanban</span>
        </NavLink>
        
        <NavLink 
          to="/chat" 
          className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
