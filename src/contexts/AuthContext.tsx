import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Context de Autenticação
 * Disponibiliza dados de login para toda a aplicação
 */
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

/**
 * Provedor de Autenticação
 * Envolve a aplicação para disponibilizar dados de autenticação
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar dados de autenticação
 * Use dentro de um componente que está envolvido por AuthProvider
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext deve estar dentro de um AuthProvider');
  }
  
  return context;
};
