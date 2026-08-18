// 1. Roles & Auth
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

// 2. Dashboard Analytics
export interface DashboardMetrics {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  weeklyVelocity: { date: string; completed: number }[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  timestamp: string;
}

// 3. Kanban / Tasks
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User;
  dueDate: string;
  createdAt: string;
}

// 4. Chat / WebSockets
export interface ChatMessage {
  id: string;
  channelId: string;
  sender: User;
  content: string;
  timestamp: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
}
