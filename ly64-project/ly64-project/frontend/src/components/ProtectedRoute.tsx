import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Даём время zustand persist middleware загрузить состояние из localStorage
    setIsHydrated(true);
  }, []);

  // Показываем пустой экран пока загружается состояние из localStorage
  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
