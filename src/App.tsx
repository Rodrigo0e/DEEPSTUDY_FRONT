import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { SessionsPage } from './pages/Sessions';
import { ReviewsPage } from './pages/Reviews';

// Define as páginas disponíveis
type PageType = 'login' | 'register' | 'forgot-password' | 'sessions' | 'reviews';

interface AppState {
  page: PageType;
  selectedSessionId?: string;
}

/**
 * Conteúdo da aplicação
 * Renderiza a página atual com base no estado
 */
const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ page: 'login' });

  const renderPage = () => {
    switch (appState.page) {
      case 'login':
        return (
          <LoginPage
            key="login-page"
            onLoginSuccess={() => {
              setAppState({ page: 'sessions' });
            }}
            onNavigateToRegister={() => setAppState({ page: 'register' })}
            onNavigateToForgotPassword={() => setAppState({ page: 'forgot-password' })}
          />
        );

      case 'register':
        return (
          <RegisterPage
            key="register-page"
            onRegisterSuccess={() => {
              setAppState({ page: 'login' });
            }}
            onNavigateToLogin={() => setAppState({ page: 'login' })}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordPage
            key="forgot-password-page"
            onNavigateToLogin={() => setAppState({ page: 'login' })}
          />
        );

      case 'sessions':
        return (
          <SessionsPage
            key="sessions-page"
            onNavigateToReviews={(sessionId) => {
              setAppState({ page: 'reviews', selectedSessionId: sessionId });
            }}
            onNavigateToLogin={() => setAppState({ page: 'login' })}
          />
        );

      case 'reviews':
        return (
          <ReviewsPage
            key="reviews-page"
            sessionId={appState.selectedSessionId}
            onNavigateToSessions={() => setAppState({ page: 'sessions' })}
            onNavigateToLogin={() => setAppState({ page: 'login' })}
          />
        );

      default:
        return <LoginPage key="login-page" />;
    }
  };

  return <>{renderPage()}</>;
};

/**
 * Componente principal da aplicação
 * Fornece contexto de autenticação e renderiza páginas
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
