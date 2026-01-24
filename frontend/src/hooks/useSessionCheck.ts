import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

/**
 * Hook para verificar periódicamente si la sesión sigue activa
 * Si la sesión fue cerrada en otro dispositivo, cierra la sesión local
 */
export function useSessionCheck() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const intervalRef = useRef<number | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Solo verificar si el usuario está autenticado
    if (!isAuthenticated) {
      return;
    }

    const checkSession = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (isCheckingRef.current) {
        return;
      }

      try {
        isCheckingRef.current = true;
        
        // Hacer una petición simple al backend para verificar la sesión
        // El SessionGuard validará automáticamente si la sesión está activa
        await api.get('/auth/validate');
        
      } catch (error: any) {
        // Si recibimos 401, la sesión fue cerrada
        if (error.response?.status === 401) {
          const message = error.response?.data?.message || '';
          
          // Verificar si es un error de sesión cerrada por otro dispositivo
          if (message.includes('sesión ha sido cerrada') || message.includes('iniciaste sesión en otro dispositivo')) {
            console.log('[SessionCheck] Sesión cerrada en otro dispositivo');
            
            // Cerrar sesión local
            logout();
            
            // Mostrar alerta
            alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.');
            
            // Redirigir al login
            navigate('/login', { replace: true });
          }
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Verificar cada 30 segundos
    intervalRef.current = window.setInterval(checkSession, 30000);

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, logout, navigate]);
}
