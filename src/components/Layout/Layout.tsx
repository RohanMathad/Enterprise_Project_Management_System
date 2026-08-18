import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { TopNav } from '../TopNav/TopNav';
import styles from './Layout.module.scss';
import { LayoutProps } from './Layout.types';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopNav />
        <main className={styles.pageContent}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
