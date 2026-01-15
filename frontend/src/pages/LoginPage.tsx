import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/auth.service';
import { LoginCredentials } from '@/types';
import { getResourceUrl } from '@/utils/api-url';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { settings } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  // Verificar si hay un magic token en sessionStorage o en la URL
  useEffect(() => {
    console.log('[LoginPage] useEffect ejecutado');
    console.log('[LoginPage] window.location.search:', window.location.search);
    console.log('[LoginPage] window.location.href:', window.location.href);
    
    // Primero intentar obtener de la URL
    const urlParams = new URLSearchParams(window.location.search);
    let magicToken = urlParams.get('magic');
    
    // Si no está en la URL, buscar en sessionStorage
    if (!magicToken) {
      // Extraer el tenant slug del hostname
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      let tenantSlug = null;
      
      if (parts.length >= 2 && parts[1] === 'localhost') {
        tenantSlug = parts[0];
      } else if (parts.length >= 3) {
        tenantSlug = parts[0];
      }
      
      console.log('[LoginPage] Tenant slug detectado:', tenantSlug);
      
      if (tenantSlug && tenantSlug !== 'admin') {
        const storageKey = `magic_token_${tenantSlug}`;
        magicToken = sessionStorage.getItem(storageKey);
        console.log('[LoginPage] Magic token desde sessionStorage:', magicToken ? magicToken.substring(0, 20) + '...' : 'null');
        
        // Limpiar el token de sessionStorage después de leerlo
        if (magicToken) {
          sessionStorage.removeItem(storageKey);
        }
      }
    }
    
    console.log('[LoginPage] magicToken final:', magicToken ? magicToken.substring(0, 20) + '...' : 'null');
    
    if (magicToken) {
      console.log('[LoginPage] Magic token detectado, llamando handleMagicLogin');
      handleMagicLogin(magicToken);
    } else {
      console.log('[LoginPage] No hay magic token');
    }
  }, []); // Solo ejecutar una vez al montar

  const handleMagicLogin = async (token: string) => {
    console.log('[MagicLogin] ========== INICIO ==========');
    console.log('[MagicLogin] Token recibido:', token ? token.substring(0, 20) + '...' : 'NULL');
    console.log('[MagicLogin] URL actual:', window.location.href);
    
    try {
      setLoading(true);
      setError('');
      
      // Llamar al endpoint de magic login
      console.log('[MagicLogin] Llamando a authService.magicLogin...');
      const response = await authService.magicLogin(token);
      
      console.log('[MagicLogin] Respuesta recibida:', response);
      console.log('[MagicLogin] Usuario:', response.user);
      console.log('[MagicLogin] Token JWT:', response.access_token ? response.access_token.substring(0, 20) + '...' : 'NULL');
      
      // Guardar token y usuario
      console.log('[MagicLogin] Guardando en localStorage...');
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('[MagicLogin] Actualizando store...');
      setUser(response.user);
      
      // Limpiar parámetro de la URL
      console.log('[MagicLogin] Limpiando URL...');
      window.history.replaceState({}, '', '/login');
      
      // Redirigir al dashboard
      console.log('[MagicLogin] Redirigiendo a /dashboard...');
      navigate('/dashboard', { replace: true });
      
      console.log('[MagicLogin] ========== FIN EXITOSO ==========');
      
    } catch (err: any) {
      console.error('[MagicLogin] ========== ERROR ==========');
      console.error('[MagicLogin] Error completo:', err);
      console.error('[MagicLogin] Response:', err.response);
      console.error('[MagicLogin] Data:', err.response?.data);
      console.error('[MagicLogin] Message:', err.response?.data?.message);
      
      setError(err.response?.data?.message || 'El enlace de acceso es inválido o ha expirado');
      setLoading(false);
      
      // Limpiar parámetro de la URL
      window.history.replaceState({}, '', '/login');
    }
  };

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.login(data);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary" style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)` }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {settings.logoUrl ? (
              <div className="flex justify-center mb-4">
                <img
                  src={getResourceUrl(settings.logoUrl)}
                  alt={settings.companyName}
                  className="h-20 object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center" style={{ backgroundColor: settings.primaryColor }}>
                <span className="text-3xl font-bold text-white">
                  {settings.companyName.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {settings.companyName}
            </h1>
            <p className="text-gray-600 mt-2">Ingresa tus credenciales</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className="input"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium hover:underline"
                style={{ color: settings.primaryColor }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
