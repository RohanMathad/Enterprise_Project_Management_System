import { Task } from '../../types/global.types';

export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
  onSubmit: (taskData: {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
  }) => void;
}
