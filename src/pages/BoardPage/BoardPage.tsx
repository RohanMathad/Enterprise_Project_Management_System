import React, { useEffect, useState, useRef } from 'react';
import { Filter, Plus, MoreHorizontal, Calendar, AlertTriangle, CheckCircle2, Search, X, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Task, TaskPriority, TaskStatus, User } from '../../types/global.types';
import { subscribeToTasks, createTask, updateTaskStatus, deleteTask, updateTaskDetails, subscribeToUsers } from '../../services/firestore.service';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSearchQuery, clearSearchQuery } from '../../store/uiSlice';
import { NewTaskModal } from '../../components/NewTaskModal/NewTaskModal';
import styles from './BoardPage.module.scss';
import { BoardPageProps, ColumnProps, TaskCardProps } from './BoardPage.types';

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Fix auth token bug in API middleware',
    description: '',
    status: 'TODO',
    priority: 'HIGH',
    assignee: { id: 'u1', firstName: 'Sarah', lastName: '', email: '', role: 'EMPLOYEE', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
    dueDate: 'Oct 24',
    createdAt: ''
  },
  {
    id: '2',
    title: 'Design new onboarding flow',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee: { id: 'u2', firstName: 'David', lastName: '', email: '', role: 'EMPLOYEE', avatarUrl: 'https://i.pravatar.cc/150?u=david' },
    dueDate: 'Oct 26',
    createdAt: ''
  },
  {
    id: '3',
    title: 'Database migration for v2.0',
    description: '',
    status: 'IN_PROGRESS',
    priority: 'HIGH', // mapped to Urgent visually
    assignee: { id: 'u3', firstName: 'Alex', lastName: '', email: '', role: 'EMPLOYEE', avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
    dueDate: 'Today',
    createdAt: ''
  },
  {
    id: '4',
    title: 'Update dependency packages',
    description: '',
    status: 'DONE',
    priority: 'LOW',
    assignee: { id: 'sys', firstName: 'System', lastName: '', email: '', role: 'ADMIN', avatarUrl: 'https://i.pravatar.cc/150?u=sys' },
    dueDate: 'Oct 20',
    createdAt: ''
  }
];

const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const getPriorityStyle = () => {
    switch(priority) {
      case 'HIGH': return styles.priorityUrgent;
      case 'MEDIUM': return styles.priorityMedium;
      case 'LOW': return styles.priorityLow;
      default: return '';
    }
  };

  const getLabel = () => {
    if(priority === 'HIGH') return 'Urgent';
    if(priority === 'MEDIUM') return 'Medium';
    return 'Low';
  };

  return <span className={clsx(styles.priorityBadge, getPriorityStyle())}>{getLabel()}</span>;
};

const TaskCard: React.FC<TaskCardProps & { isViewer: boolean, setAccessError: (msg: string) => void }> = ({ task, onStatusChange, onEdit, onDelete, isViewer, setAccessError }) => {
  return (
    <div className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <PriorityBadge priority={task.priority} />
        <div className={styles.taskActions}>
          <button 
            style={isViewer ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (isViewer) { setAccessError('Admin credentials required'); return; }
              onEdit(task); 
            }}
          >
            <Pencil size={14} />
          </button>
          <button 
            className={styles.deleteBtn}
            style={isViewer ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (isViewer) { setAccessError('Admin credentials required'); return; }
              onDelete(task.id); 
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h4 className={clsx(styles.taskTitle, task.status === 'DONE' && styles.taskTitleDone)}>
        {task.title}
      </h4>
      <div className={styles.taskFooter}>
        <div className={clsx(styles.dueDate, task.dueDate === 'Today' && styles.dueDateUrgent, task.status === 'DONE' && styles.dueDateDone)}>
          {task.status === 'DONE' ? <CheckCircle2 size={14} /> : task.dueDate === 'Today' ? <AlertTriangle size={14} /> : <Calendar size={14} />}
          <span>{task.dueDate}</span>
        </div>
        <div className={styles.assignees}>
          <select 
            value={task.status} 
            disabled={isViewer}
            onChange={(e) => {
              if (isViewer) { setAccessError('Admin credentials required'); return; }
              onStatusChange(task.id, e.target.value as TaskStatus);
            }}
            style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #e1e4e8', outline: 'none', marginRight: '8px', cursor: isViewer ? 'not-allowed' : 'pointer' }}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          {task.assignee?.avatarUrl ? (
            <img src={task.assignee.avatarUrl} alt={task.assignee.firstName} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#e1e4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>{task.assignee?.firstName?.[0] || '?'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Column: React.FC<ColumnProps & { sortType: string; onSortChange: (type: string) => void, isViewer: boolean, setAccessError: (msg: string) => void }> = ({ title, count, tasks, statusColor, onStatusChange, onEdit, onDelete, sortType, onSortChange, isViewer, setAccessError }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleInfo}>
          <div className={styles.statusDot} style={{ backgroundColor: statusColor }} />
          <h3>{title}</h3>
          <span className={styles.taskCount}>{count}</span>
        </div>
        <div className={styles.columnMenuWrapper} ref={menuRef}>
          <button className={styles.iconBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal size={18} />
          </button>
          {isMenuOpen && (
            <div className={styles.columnMenuDropdown}>
              <div className={styles.menuTitle}>Sort By</div>
              <button 
                className={clsx(styles.menuItem, sortType === 'latest' && styles.active)}
                onClick={() => { onSortChange('latest'); setIsMenuOpen(false); }}
              >
                Latest
              </button>
              <button 
                className={clsx(styles.menuItem, sortType === 'dueDate' && styles.active)}
                onClick={() => { onSortChange('dueDate'); setIsMenuOpen(false); }}
              >
                Due Date (Urgent)
              </button>
              <button 
                className={clsx(styles.menuItem, sortType === 'priority' && styles.active)}
                onClick={() => { onSortChange('priority'); setIsMenuOpen(false); }}
              >
                Priority
              </button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.taskList}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} isViewer={isViewer} setAccessError={setAccessError} />
        ))}
      </div>
      {title === 'In Progress' && <div className={styles.activeBar} />}
    </div>
  );
};

export const BoardPage: React.FC<BoardPageProps> = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [sortConfig, setSortConfig] = useState({ TODO: 'latest', IN_PROGRESS: 'latest', DONE: 'latest' });

  const user = useAppSelector((state) => state.auth.user);
  const isViewer = user?.role?.toUpperCase() === 'VIEWER';
  
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (accessError) {
      const timer = setTimeout(() => setAccessError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [accessError]);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearchExpanded(false);
    dispatch(clearSearchQuery());
  };

  useEffect(() => {
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      // Fallback to MOCK_TASKS if database is completely empty just for visual representation
      setTasks(fetchedTasks.length > 0 ? fetchedTasks : MOCK_TASKS);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((fetchedUsers) => {
      setTeamMembers(fetchedUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      if (MOCK_TASKS.find(t => t.id === taskId)) return;
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };
  
  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Skip deletion for mock tasks so the UI doesn't crash
        if (MOCK_TASKS.find(t => t.id === taskId)) {
            alert("Cannot delete mock placeholder tasks.");
            return;
        }
        await deleteTask(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  const handleSubmitTask = async (taskData: { title: string; description: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; dueDate: string }) => {
    if (!user) return;
    try {
      if (taskToEdit) {
        await updateTaskDetails(taskToEdit.id, {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        });
      } else {
        await createTask({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: 'TODO',
          assignee: user,
        });
      }
      setIsModalOpen(false);
      setTaskToEdit(undefined);
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  if (isLoading) return <div style={{ padding: 32 }}>Loading board...</div>;

  const filteredTasks = tasks.filter((task) => 
    !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortTasks = (taskList: Task[], type: string) => {
    return [...taskList].sort((a, b) => {
      if (type === 'priority') {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (type === 'dueDate') {
        // Simple string comparison or proper date comparison
        if (a.dueDate === 'Today') return -1;
        if (b.dueDate === 'Today') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // 'latest' (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const todoTasks = sortTasks(filteredTasks.filter(t => t.status === 'TODO'), sortConfig.TODO);
  const inProgressTasks = sortTasks(filteredTasks.filter(t => t.status === 'IN_PROGRESS'), sortConfig.IN_PROGRESS);
  const doneTasks = sortTasks(filteredTasks.filter(t => t.status === 'DONE'), sortConfig.DONE);

  return (
    <div className={styles.boardPage}>
      {accessError && (
        <div className={styles.accessErrorBanner}>
          <AlertTriangle size={16} />
          {accessError}
        </div>
      )}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Project Alpha</h1>
          <div className={styles.projectMembers}>
            <div className={styles.avatars}>
              {teamMembers.slice(0, 3).map(member => (
                <img key={member.id} src={member.avatarUrl} alt={member.firstName} />
              ))}
            </div>
            {teamMembers.length > 3 && (
              <span className={styles.memberCount}>+{teamMembers.length - 3} Members</span>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div 
            className={clsx(styles.searchCapsule, isSearchExpanded && styles.expanded)}
            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
          >
            {isSearchExpanded ? <Search size={16} /> : <Filter size={16} />}
            {isSearchExpanded ? (
              <>
                <input 
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
                <button className={styles.closeBtn} onClick={handleCloseSearch}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <span>Filter</span>
            )}
          </div>
          <button 
            className={clsx(styles.newBtn, isViewer && styles.disabledBtn)} 
            onClick={() => {
              if (isViewer) { setAccessError('Admin credentials required'); return; }
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </header>

      <div className={styles.boardColumns}>
        <Column 
          title="To Do" 
          count={todoTasks.length} 
          tasks={todoTasks} 
          statusColor="#666" 
          onStatusChange={handleStatusChange} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick}
          sortType={sortConfig.TODO}
          onSortChange={(type) => setSortConfig(prev => ({ ...prev, TODO: type }))}
        />
        <Column 
          title="In Progress" 
          count={inProgressTasks.length} 
          tasks={inProgressTasks} 
          statusColor="#3b82f6" 
          onStatusChange={handleStatusChange} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick}
          sortType={sortConfig.IN_PROGRESS}
          onSortChange={(type) => setSortConfig(prev => ({ ...prev, IN_PROGRESS: type }))}
        />
        <Column 
          title="Done" 
          count={doneTasks.length} 
          tasks={doneTasks} 
          statusColor="#22c55e" 
          onStatusChange={handleStatusChange} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick}
          sortType={sortConfig.DONE}
          onSortChange={(type) => setSortConfig(prev => ({ ...prev, DONE: type }))}
        />
      </div>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setTaskToEdit(undefined); }} 
        taskToEdit={taskToEdit}
        onSubmit={handleSubmitTask} 
      />
    </div>
  );
};
