import React, { useEffect, useState, useMemo, useRef } from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle, MoreHorizontal, Filter, Search, X } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import clsx from 'clsx';
import { subscribeToTasks } from '../../services/firestore.service';
import { Task } from '../../types/global.types';
import { useAppSelector } from '../../store/hooks';
import { ViewerWelcomeModal } from '../../components/ViewerWelcomeModal/ViewerWelcomeModal';
import styles from './DashboardPage.module.scss';
import { DashboardPageProps } from './DashboardPage.types';

// Helper for relative time in activity
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `Just now`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppSelector((state) => state.auth.user);
  const hasSeenViewerModal = useAppSelector((state) => state.ui.hasSeenViewerModal);

  // New states for interactive elements
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [isVelocityMenuOpen, setIsVelocityMenuOpen] = useState(false);
  const velocityMenuRef = useRef<HTMLDivElement>(null);

  const [isActivitySearchOpen, setIsActivitySearchOpen] = useState(false);
  const [activityQuery, setActivityQuery] = useState('');
  const activitySearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActivitySearchOpen && activitySearchInputRef.current) {
      activitySearchInputRef.current.focus();
    }
  }, [isActivitySearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (velocityMenuRef.current && !velocityMenuRef.current.contains(event.target as Node)) {
        setIsVelocityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (task.status === 'IN_PROGRESS') {
        inProgressTasks++;
      }
      if (task.status === 'DONE') {
        completedTasks++;
      }
      
      if (task.dueDate && task.status !== 'DONE') {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdueTasks++;
        }
      }
    });

    // Velocity: completed tasks by date
    const velocityData = [];
    const daysCount = timeRange === '7days' ? 7 : 30;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = timeRange === '7days' ? days[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`;
      
      const completed = tasks.filter(t => 
        t.status === 'DONE' && t.createdAt.startsWith(dateStr)
      ).length;
      
      velocityData.push({ date: dayName, completed });
    }

    // Recent activity: Filter and sort
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const recentActivity = sortedTasks
      .map(t => ({
        id: t.id,
        user: t.assignee || { firstName: 'Unknown', lastName: '', avatarUrl: '' },
        action: `Created task: ${t.title}`,
        title: t.title, // Keep title for filtering
        timestamp: timeAgo(t.createdAt)
      }))
      .filter(activity => {
        if (!activityQuery) return true;
        return activity.title.toLowerCase().includes(activityQuery.toLowerCase()) || 
               activity.user.firstName?.toLowerCase().includes(activityQuery.toLowerCase());
      })
      .slice(0, 5);

    return {
      totalTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      velocityData,
      recentActivity
    };
  }, [tasks, timeRange, activityQuery]);

  if (isLoading) return <div style={{ padding: 32 }}>Loading dashboard...</div>;
  if (!metrics) return null;

  return (
    <div className={styles.dashboard}>
      {user?.role?.toUpperCase() === 'VIEWER' && !hasSeenViewerModal && <ViewerWelcomeModal />}
      <header className={styles.header}>
        <h1>Overview</h1>
        <p>Real-time metrics for your active workspaces.</p>
      </header>

      <div className={styles.metricCards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>TOTAL TASKS</span>
            <FileText size={18} className={styles.iconNeutral} />
          </div>
          <div className={styles.cardValue}>
            <span className={styles.number}>{metrics.totalTasks.toLocaleString()}</span>
            <span className={styles.trendUp}>&#8599; 12%</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>IN PROGRESS</span>
            <Clock size={18} className={styles.iconNeutral} />
          </div>
          <div className={styles.cardValue}>
            <span className={styles.number}>{metrics.inProgressTasks}</span>
            <span className={styles.trendNeutral}>&rarr; 2%</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>COMPLETED</span>
            <CheckCircle2 size={18} className={styles.iconNeutral} />
          </div>
          <div className={styles.cardValue}>
            <span className={styles.number}>{metrics.completedTasks}</span>
            <span className={styles.trendUp}>&#8599; 18%</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>OVERDUE</span>
            <AlertTriangle size={18} className={styles.iconDanger} />
          </div>
          <div className={styles.cardValue}>
            <span className={styles.numberDanger}>{metrics.overdueTasks}</span>
            <span className={styles.trendDown}>&#8600; 4%</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h3>Task Velocity</h3>
            <div className={styles.menuWrapper} ref={velocityMenuRef}>
              <button 
                className={styles.iconBtn} 
                onClick={() => setIsVelocityMenuOpen(!isVelocityMenuOpen)}
              >
                <MoreHorizontal size={20} />
              </button>
              {isVelocityMenuOpen && (
                <div className={styles.popoverMenu}>
                  <button 
                    className={clsx(styles.menuItem, timeRange === '7days' && styles.active)}
                    onClick={() => { setTimeRange('7days'); setIsVelocityMenuOpen(false); }}
                  >
                    Last 7 Days
                  </button>
                  <button 
                    className={clsx(styles.menuItem, timeRange === '30days' && styles.active)}
                    onClick={() => { setTimeRange('30days'); setIsVelocityMenuOpen(false); }}
                  >
                    Last 30 Days
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer>
              <AreaChart data={metrics.velocityData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h3>Recent Activity</h3>
            <div 
              className={clsx(styles.searchCapsule, isActivitySearchOpen && styles.expanded)}
              onClick={() => !isActivitySearchOpen && setIsActivitySearchOpen(true)}
            >
              {isActivitySearchOpen ? <Search size={16} /> : <Filter size={16} />}
              {isActivitySearchOpen && (
                <>
                  <input 
                    ref={activitySearchInputRef}
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search activity..."
                    value={activityQuery}
                    onChange={(e) => setActivityQuery(e.target.value)}
                  />
                  <button 
                    className={styles.closeBtn} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActivitySearchOpen(false);
                      setActivityQuery('');
                    }}
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={styles.activityList}>
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map(activity => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>
                    <img src={activity.user.avatarUrl} alt={activity.user.firstName} />
                  </div>
                  <div className={styles.activityContent}>
                    <p>
                      <strong>{activity.user.firstName}</strong> {activity.action}
                    </p>
                    <span className={styles.timestamp}>{activity.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No activities match your search.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
