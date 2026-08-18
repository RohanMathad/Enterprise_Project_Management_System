import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { subscribeToUsers } from '../../services/firestore.service';
import { User } from '../../types/global.types';
import { TeamPageProps } from './TeamPage.types';
import styles from './TeamPage.module.scss';
import { Users } from 'lucide-react';

export const TeamPage: React.FC<TeamPageProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return styles.roleSuperAdmin;
      case 'ADMIN': return styles.roleAdmin;
      default: return styles.roleEmployee;
    }
  };

  const formatRole = (role: string) => {
    return role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : role;
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return `${first}${last}` || '?';
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Team Directory</h1>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          Loading team members...
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} color="#cbd5e1" />
          <p>No team members found.</p>
        </div>
      ) : (
        <div className={styles.userGrid}>
          {users.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.avatarContainer}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                )}
              </div>
              <div className={styles.userInfo}>
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
              </div>
              <div className={clsx(styles.roleBadge, getRoleStyle(user.role))}>
                {user.role}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
