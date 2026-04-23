import { Building2, Users, MapPin, FileText, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { GlobalStats } from '../types/tenant';

interface GlobalStatsCardProps {
  stats: GlobalStats;
}

export default function GlobalStatsCard({ stats }: GlobalStatsCardProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Globales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total Tenants */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Tenants</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalTenants}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        {/* Active Tenants */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Activos</p>
              <p className="text-3xl font-bold text-green-900">{stats.activeTenants}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        {/* Trial Tenants */}
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">En Prueba</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.trialTenants}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-50" />
          </div>
        </div>

        {/* Suspended Tenants */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Suspendidos</p>
              <p className="text-3xl font-bold text-red-900">{stats.suspendedTenants}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resources Stats */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recursos Totales</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Usuarios</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Sedes</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalBranches.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Servicios</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalServices.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Consentimientos</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalConsents.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Distribución de Planes</h3>
          <div className="space-y-3">
            {stats.tenantsByPlan && stats.tenantsByPlan.length > 0 ? (
              stats.tenantsByPlan.map((item, index) => {
                const colors = [
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-green-500',
                  'bg-yellow-500',
                  'bg-red-500',
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={item.plan} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.plan}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-2 ${color} rounded-full`}
                          style={{ width: `${(item.count / stats.totalTenants) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No hay datos de distribución de planes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
