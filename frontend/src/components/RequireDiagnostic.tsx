import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RequireDiagnosticProps {
  children: React.ReactNode;
}

export function RequireDiagnostic({ children }: RequireDiagnosticProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Админы могут пропускать диагностику
  if (user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Если диагностика не завершена и пытается зайти НЕ на /diagnostic
  if (user && !user.diagnosticCompleted) {
    if (!location.pathname.startsWith('/diagnostic')) {
      return <Navigate to="/diagnostic" replace />;
    }
  }

  return <>{children}</>;
}
