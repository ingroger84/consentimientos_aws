import { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  FileHeart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { tenantsService } from '@/services/tenants';
import { GlobalStats } from '@/types/tenant';
import TenantStatsCard from '@/components/dashboard/TenantStatsCard';
import TenantAlertsSection from '@/components/dashboard/TenantAlertsSection';
import TenantTableSection from '@/components/dashboard/TenantTableSection';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'growth' | 'distribution'>('overview');

  useEffect(() => {
    loadGlobalStats();
  }, []);

  const loadGlobalStats = async () => {
    try {
      console.log('[SuperAdminDashboard] Cargando estadísticas globales...');
      const data = await tenantsService.getGlobalStats();
      console.log('[SuperAdminDashboard] Estadísticas cargadas:', data);
      setStats(data);
    } catch (error) {
      console.error('[SuperAdminDashboard] Error loading global stats:', error);
      // Establecer datos por defecto para evitar pantalla en blanco
      setStats({
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        trialTenants: 0,
        expiredTenants: 0,
        totalUsers: 0,
        totalBranches: 0,
        totalServices: 0,
        totalConsents: 0,
        totalMedicalRecords: 0,
        activeMedicalRecords: 0,
        closedMedicalRecords: 0,
        totalClients: 0,
        newClientsThisMonth: 0,
        totalConsentTemplates: 0,
        activeConsentTemplates: 0,
        totalMRConsentTemplates: 0,
        activeMRConsentTemplates: 0,
        tenantsNearLimit: 0,
        tenantsAtLimit: 0,
        planDistribution: {
          free: 0,
          basic: 0,
          professional: 0,
          enterprise: 0,
        },
        tenantsByPlan: [],
        growthData: [],
        topTenants: [],
        topTenantsByMedicalRecords: [],
        topTenantsByClients: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!stats) {
    console.error('[SuperAdminDashboard] Stats is null after loading');
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-lg">Error al cargar estadísticas</div>
        <button 
          onClick={loadGlobalStats}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Tenants',
      value: stats.totalTenants,
      subtitle: `${stats.activeTenants} activos`,
      icon: Building2,
      color: 'bg-blue-500',
      trend: `${stats.activeTenants} / ${stats.totalTenants}`,
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      subtitle: 'En todos los tenants',
      icon: Users,
      color: 'bg-green-500',
      trend: `${Math.round(stats.totalUsers / (stats.totalTenants || 1))} promedio`,
    },
    {
      title: 'Consentimientos CN',
      value: stats.totalConsents,
      subtitle: 'Generados',
      icon: FileText,
      color: 'bg-purple-500',
      trend: `${Math.round(stats.totalConsents / (stats.totalTenants || 1))} promedio`,
    },
    {
      title: 'Historias Clínicas',
      value: stats.totalMedicalRecords || 0,
      subtitle: `${stats.activeMedicalRecords || 0} activas`,
      icon: FileHeart,
      color: 'bg-indigo-500',
      trend: `${stats.closedMedicalRecords || 0} cerradas`,
    },
    {
      title: 'Tenants con Alertas',
      value: stats.tenantsNearLimit + stats.tenantsAtLimit,
      subtitle: `${stats.tenantsAtLimit} en límite`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: stats.tenantsAtLimit > 0 ? 'Atención' : 'OK',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Super Admin</h1>
          <p className="text-gray-600 mt-2">
            Vista global del sistema multi-tenant con métricas completas
          </p>
        </div>
        
        {/* View Selector */}
        <div className="flex gap-2 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'overview'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Resumen
          </button>
          <button
            onClick={() => setSelectedView('growth')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'growth'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Crecimiento
          </button>
          <button
            onClick={() => setSelectedView('distribution')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'distribution'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PieChartIcon className="w-4 h-4 inline mr-2" />
            Distribución
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <TenantStatsCard key={index} {...card} />
        ))}
      </div>

      {/* Dynamic Content Based on Selected View */}
      {selectedView === 'overview' && (
        <>
          {/* Alerts Section */}
          <TenantAlertsSection
            tenantsNearLimit={stats.tenantsNearLimit}
            tenantsAtLimit={stats.tenantsAtLimit}
            suspendedTenants={stats.suspendedTenants}
          />

          {/* Charts Row 1: Distribución y Crecimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tenants by Plan */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribución por Plan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.tenantsByPlan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.plan}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.tenantsByPlan.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Growth */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crecimiento Reciente (6 meses)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tenants"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Tenants"
                  />
                  <Line
                    type="monotone"
                    dataKey="consents"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Consentimientos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Historias Clínicas y Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical Records Growth */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crecimiento de Historias Clínicas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="medicalRecords"
                    stroke="#6366F1"
                    strokeWidth={2}
                    name="Historias Clínicas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Clients Growth */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crecimiento de Clientes
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#EC4899"
                    strokeWidth={2}
                    name="Clientes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top by Consents */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 5 por Consentimientos
              </h3>
              <div className="space-y-3">
                {stats.topTenants && stats.topTenants.length > 0 ? (
                  stats.topTenants.slice(0, 5).map((tenant, index) => (
                    <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.plan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{tenant.consentsCount}</p>
                        <p className="text-xs text-gray-500">consentimientos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </div>

            {/* Top by Medical Records */}
            {stats.topTenantsByMedicalRecords && stats.topTenantsByMedicalRecords.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 5 por Historias Clínicas
                </h3>
                <div className="space-y-3">
                  {stats.topTenantsByMedicalRecords.slice(0, 5).map((tenant, index) => (
                    <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.branchesCount} sedes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{tenant.medicalRecordsCount}</p>
                        <p className="text-xs text-gray-500">historias</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedView === 'growth' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Growth Chart - Full Width */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Análisis de Crecimiento (Últimos 6 Meses)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tenants" fill="#3B82F6" name="Nuevos Tenants" />
                <Bar dataKey="users" fill="#10B981" name="Nuevos Usuarios" />
                <Bar dataKey="consents" fill="#F59E0B" name="Consentimientos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tenants Activos</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeTenants}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {Math.round((stats.activeTenants / stats.totalTenants) * 100)}% del total
                  </p>
                </div>
                <Building2 className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tasa de Retención</p>
                  <p className="text-3xl font-bold mt-2">
                    {Math.round((stats.activeTenants / stats.totalTenants) * 100)}%
                  </p>
                  <p className="text-green-100 text-xs mt-1">Tenants activos</p>
                </div>
                <CheckCircle className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Promedio Consents/Tenant</p>
                  <p className="text-3xl font-bold mt-2">
                    {Math.round(stats.totalConsents / (stats.totalTenants || 1))}
                  </p>
                  <p className="text-purple-100 text-xs mt-1">Consentimientos</p>
                </div>
                <Activity className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>

          {/* Comparative Growth */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comparativa de Crecimiento
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tenants" stroke="#3B82F6" strokeWidth={2} name="Tenants" />
                <Line type="monotone" dataKey="consents" stroke="#10B981" strokeWidth={2} name="Consentimientos" />
                <Line type="monotone" dataKey="medicalRecords" stroke="#6366F1" strokeWidth={2} name="HC" />
                <Line type="monotone" dataKey="clients" stroke="#EC4899" strokeWidth={2} name="Clientes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution by Plan */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución por Plan
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.tenantsByPlan}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry: any) => `${entry.plan}: ${entry.count}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.tenantsByPlan.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Tenants
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Activos', value: stats.activeTenants },
                    { name: 'Trial', value: stats.trialTenants },
                    { name: 'Suspendidos', value: stats.suspendedTenants },
                    { name: 'Expirados', value: stats.expiredTenants },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#EF4444" />
                  <Cell fill="#6B7280" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Usage by Top Tenants */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uso de Recursos por Top 10 Tenants
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topTenants.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usersCount" fill="#3B82F6" name="Usuarios" />
                <Bar dataKey="consentsCount" fill="#10B981" name="Consentimientos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Medical Records Distribution */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Historias Clínicas por Top 10 Tenants
            </h3>
            {stats.topTenantsByMedicalRecords && stats.topTenantsByMedicalRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topTenantsByMedicalRecords.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="medicalRecordsCount" fill="#6366F1" name="Historias Clínicas" />
                  <Bar dataKey="branchesCount" fill="#EC4899" name="Sedes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>
      )}

      {/* Tenants Table */}
      <TenantTableSection />
    </div>
  );
}
