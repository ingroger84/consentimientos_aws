import { useState, useEffect } from 'react';
import { X, Users, MapPin, Briefcase, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { tenantsService } from '../services/tenants';
import { Tenant, TenantStats } from '../types/tenant';

interface TenantStatsModalProps {
  tenant: Tenant;
  onClose: () => void;
}

export default function TenantStatsModal({ tenant, onClose }: TenantStatsModalProps) {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [tenant.id]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await tenantsService.getStats(tenant.id);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas de {tenant.name}</h2>
            <p className="text-gray-600 mt-1">Uso de recursos y límites del plan</p>
            {/* URL del Tenant */}
            <div className="mt-2">
              <a
                href={`http://${tenant.slug}.localhost:5173`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                🔗 http://{tenant.slug}.localhost:5173
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Users className="w-8 h-8 text-blue-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.users)}`}>
                      {stats.usagePercentage.users.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalUsers} / {stats.maxUsers}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <MapPin className="w-8 h-8 text-green-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.branches)}`}>
                      {stats.usagePercentage.branches.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Sedes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalBranches} / {stats.maxBranches}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Servicios</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalServices}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <FileText className="w-8 h-8 text-orange-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.consents)}`}>
                      {stats.usagePercentage.consents.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Consentimientos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalConsents} / {stats.maxConsents}
                  </p>
                </div>
              </div>

              {/* Barras de Progreso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Uso de Recursos
                </h3>

                {/* Usuarios */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Usuarios</span>
                    <span className="text-sm text-gray-600">
                      {stats.totalUsers} de {stats.maxUsers} ({stats.usagePercentage.users.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.users)}`}
                      style={{ width: `${Math.min(stats.usagePercentage.users, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sedes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Sedes</span>
                    <span className="text-sm text-gray-600">
                      {stats.totalBranches} de {stats.maxBranches} ({stats.usagePercentage.branches.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.branches)}`}
                      style={{ width: `${Math.min(stats.usagePercentage.branches, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Consentimientos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Consentimientos</span>
                    <span className="text-sm text-gray-600">
                      {stats.totalConsents} de {stats.maxConsents} ({stats.usagePercentage.consents.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.consents)}`}
                      style={{ width: `${Math.min(stats.usagePercentage.consents, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {(stats.usagePercentage.users >= 90 || 
                stats.usagePercentage.branches >= 90 || 
                stats.usagePercentage.consents >= 90) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-1">
                        Límites Críticos Alcanzados
                      </h4>
                      <p className="text-sm text-red-700">
                        Uno o más recursos están cerca del límite. Considera actualizar el plan del tenant.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Plan */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Información del Plan</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Plan:</span>
                    <span className="ml-2 font-medium text-gray-900">{stats.plan}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <span className="ml-2 font-medium text-gray-900">{stats.status}</span>
                  </div>
                  {stats.trialEndsAt && (
                    <div>
                      <span className="text-gray-600">Prueba termina:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(stats.trialEndsAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  {stats.subscriptionEndsAt && (
                    <div>
                      <span className="text-gray-600">Suscripción termina:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(stats.subscriptionEndsAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
