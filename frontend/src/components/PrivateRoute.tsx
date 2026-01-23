import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log('[PrivateRoute] isAuthenticated:', isAuthenticated);
  console.log('[PrivateRoute] Current path:', window.location.pathname);

  if (!isAuthenticated) {
    console.log('[PrivateRoute] No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[PrivateRoute] Autenticado, renderizando children');
  return <>{children}</>;
}
