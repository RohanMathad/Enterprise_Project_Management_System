import { Task, TaskStatus } from '../../types/global.types';

export interface BoardPageProps {}

export interface ColumnProps {
  title: string;
  count: number;
  tasks: Task[];
  statusColor: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}
