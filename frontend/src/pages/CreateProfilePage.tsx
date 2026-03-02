import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Permission, Profile } from '../types/profile.types';
import profilesService from '../services/profiles.service';
import PermissionSelector from '../components/profiles/PermissionSelector';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const toast = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isEditing);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tenantId: user?.tenant?.id || '',
    isActive: true,
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      loadProfile(id);
    }
  }, [id, isEditing]);

  const loadProfile = async (profileId: string) => {
    try {
      setLoadingProfile(true);
      const data = await profilesService.getProfile(profileId);
      setProfile(data);
      setFormData({
        name: data.name,
        description: data.description,
        tenantId: data.tenantId || '',
        isActive: data.isActive,
      });
      setPermissions(data.permissions);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil', error.response?.data?.message);
      navigate('/profiles');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (permissions.length === 0) {
      toast.error('Debes seleccionar al menos un permiso');
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tenantId: formData.tenantId || undefined,
        permissions,
        ...(isEditing && { isActive: formData.isActive }),
      };

      if (isEditing && id) {
        await profilesService.updateProfile(id, data);
        toast.success('Perfil actualizado exitosamente');
      } else {
        await profilesService.createProfile(data);
        toast.success('Perfil creado exitosamente');
      }

      navigate('/profiles');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar perfil', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEditing && profile?.isSystem) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-200">
                Perfil del sistema
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Los perfiles del sistema no pueden ser editados. Solo puedes ver sus permisos.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/profiles')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Volver a perfiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar perfil' : 'Crear perfil'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isEditing
              ? 'Modifica los permisos y configuración del perfil'
              : 'Define los permisos para el nuevo perfil'}
          </p>
        </div>
        <button
          onClick={() => navigate('/profiles')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información básica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del perfil *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Médico Especialista"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe el propósito de este perfil"
              />
            </div>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Perfil activo
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Permisos *
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Selecciona los módulos y acciones que este perfil podrá realizar
          </p>
          <PermissionSelector selectedPermissions={permissions} onChange={setPermissions} />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/profiles')}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isEditing ? 'Guardar cambios' : 'Crear perfil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
