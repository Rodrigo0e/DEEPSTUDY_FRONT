import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className={styles.deniedContainer}>
          <div className={styles.deniedContent}>
            <h1 className={styles.deniedTitle}>Acesso Negado</h1>
            <p className={styles.deniedMessage}>Você precisa estar autenticado para acessar esta página</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
