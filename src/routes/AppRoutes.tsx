import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { BoardPage } from '../pages/BoardPage/BoardPage';
import { ChatPage } from '../pages/ChatPage/ChatPage';
import { TeamPage } from '../pages/TeamPage/TeamPage';
import { SettingsPage } from '../pages/SettingsPage/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { Layout } from '../components/Layout/Layout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard is accessible to all authenticated users */}
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/board" element={<BoardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
