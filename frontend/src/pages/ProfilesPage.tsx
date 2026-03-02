import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types/profile.types';
import profilesService from '../services/profiles.service';
import ProfileCard from '../components/profiles/ProfileCard';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

export default function ProfilesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'system' | 'custom'>('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profilesService.getProfiles(user?.tenant?.id);
      setProfiles(data);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast.error('Error al cargar perfiles', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile: Profile) => {
    const confirmed = await confirm({
      title: 'Eliminar perfil',
      message: `¿Estás seguro de que deseas eliminar el perfil "${profile.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await profilesService.deleteProfile(profile.id);
      toast.success('Perfil eliminado exitosamente');
      loadProfiles();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error('Error al eliminar perfil', error.response?.data?.message);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === 'system') return profile.isSystem;
    if (filter === 'custom') return !profile.isSystem;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfiles y Permisos</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los perfiles de usuario y sus permisos
          </p>
        </div>
        <button
          onClick={() => navigate('/profiles/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Crear perfil</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({profiles.length})
        </button>
        <button
          onClick={() => setFilter('system')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'system'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Sistema ({profiles.filter((p) => p.isSystem).length})
        </button>
        <button
          onClick={() => setFilter('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Personalizados ({profiles.filter((p) => !p.isSystem).length})
        </button>
      </div>

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay perfiles</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza creando un nuevo perfil personalizado
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/profiles/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear perfil
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onView={(p) => navigate(`/profiles/${p.id}`)}
              onEdit={(p) => navigate(`/profiles/${p.id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
