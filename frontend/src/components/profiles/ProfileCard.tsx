import { Profile } from '../../types/profile.types';
import { usePermissions } from '../../hooks/usePermissions';

interface ProfileCardProps {
  profile: Profile;
  onEdit?: (profile: Profile) => void;
  onDelete?: (profile: Profile) => void;
  onView?: (profile: Profile) => void;
}

export default function ProfileCard({ profile, onEdit, onDelete, onView }: ProfileCardProps) {
  const { isSuperAdmin } = usePermissions();
  const permissionsCount = profile.permissions.reduce((acc, p) => {
    if (p.module === '*') return acc + 999; // Permisos globales
    return acc + p.actions.length;
  }, 0);

  const usersCount = profile.users?.length || 0;

  // Super Admin puede editar todos los perfiles
  // Usuarios normales solo pueden editar perfiles personalizados
  const canEdit = isSuperAdmin() || !profile.isSystem;
  
  // Super Admin puede eliminar perfiles personalizados
  // Perfiles del sistema no se pueden eliminar
  const canDelete = !profile.isSystem;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
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
          {profile.tenant && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Tenant: {profile.tenant.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            {profile.permissions.some((p) => p.module === '*')
              ? 'Todos los permisos'
              : `${permissionsCount} permisos`}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>{usersCount} usuarios</span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        {onView && (
          <button
            onClick={() => onView(profile)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            Ver detalles
          </button>
        )}
        {onEdit && canEdit && (
          <button
            onClick={() => onEdit(profile)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center space-x-1"
            title={profile.isSystem ? 'Editar perfil del sistema (Super Admin)' : 'Editar perfil'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar</span>
          </button>
        )}
        {onDelete && canDelete && (
          <button
            onClick={() => onDelete(profile)}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center space-x-1"
            title="Eliminar perfil"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
}
