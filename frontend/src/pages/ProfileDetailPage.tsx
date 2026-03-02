import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Profile, PermissionAudit } from '../types/profile.types';
import profilesService from '../services/profiles.service';
import { useToast } from '../hooks/useToast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ACTION_NAMES: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  export: 'Exportar',
  print: 'Imprimir',
  email: 'Enviar Email',
  sign: 'Firmar',
  assign: 'Asignar',
  reset_password: 'Resetear Password',
};

const CATEGORY_NAMES: Record<string, string> = {
  dashboard: '📊 Dashboard',
  medical: '🏥 Historias Clínicas',
  consents: '📝 Consentimientos',
  clients: '👥 Clientes',
  admin: '⚙️ Administración',
  reports: '📈 Reportes',
  settings: '🔧 Configuración',
  super_admin: '👑 Super Admin',
  other: '📦 Otros',
};

export default function ProfileDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [audit, setAudit] = useState<PermissionAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'audit'>('permissions');

  useEffect(() => {
    if (id) {
      loadProfile(id);
      loadAudit(id);
    }
  }, [id]);

  const loadProfile = async (profileId: string) => {
    try {
      setLoading(true);
      const data = await profilesService.getProfile(profileId);
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil', error.response?.data?.message);
      navigate('/profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async (profileId: string) => {
    try {
      const data = await profilesService.getProfileAudit(profileId);
      setAudit(data);
    } catch (error: any) {
      console.error('Error loading audit:', error);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const permissionsByCategory = profile.permissions.reduce((acc, permission) => {
    // Determinar categoría del módulo (simplificado)
    let category = 'other';
    if (permission.module.includes('dashboard')) category = 'dashboard';
    else if (permission.module.includes('medical')) category = 'medical';
    else if (permission.module.includes('consent')) category = 'consents';
    else if (permission.module.includes('client')) category = 'clients';
    else if (permission.module.includes('user') || permission.module.includes('profile') || permission.module.includes('branch')) category = 'admin';
    else if (permission.module.includes('report')) category = 'reports';
    else if (permission.module.includes('setting')) category = 'settings';
    else if (permission.module.includes('super_admin')) category = 'super_admin';

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof profile.permissions>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/profiles')}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              {profile.isSystem && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                  Sistema
                </span>
              )}
              {!profile.isActive && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                  Inactivo
                </span>
              )}
            </div>
            {profile.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{profile.description}</p>
            )}
          </div>
        </div>
        {!profile.isSystem && (
          <button
            onClick={() => navigate(`/profiles/${profile.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar perfil
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Permisos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Usuarios ({profile.users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Auditoría
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {profile.permissions.some((p) => p.module === '*') ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                      Permisos Globales
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Este perfil tiene acceso total a todas las funciones del sistema
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {CATEGORY_NAMES[category] || category}
                  </h3>
                  <div className="space-y-3">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {permission.module}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {permission.actions.includes('*') ? (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                Todas las acciones
                              </span>
                            ) : (
                              permission.actions.map((action) => (
                                <span
                                  key={action}
                                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                                >
                                  {ACTION_NAMES[action] || action}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {profile.users && profile.users.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {profile.users.map((user: any) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No hay usuarios asignados a este perfil
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {audit.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {audit.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entry.action === 'created' && '✨ Perfil creado'}
                            {entry.action === 'updated' && '✏️ Perfil actualizado'}
                            {entry.action === 'deleted' && '🗑️ Perfil eliminado'}
                            {entry.action === 'assigned' && '👤 Perfil asignado'}
                            {entry.action === 'revoked' && '❌ Perfil revocado'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Por {entry.performer?.name || 'Usuario desconocido'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(entry.performedAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                            locale: es,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No hay registros de auditoría
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
