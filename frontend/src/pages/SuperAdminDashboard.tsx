import { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
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
import TopPerformersSection from '@/components/dashboard/TopPerformersSection';

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
      const data = await tenantsService.getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading global stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error al cargar estadísticas</div>
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
      trend: '+12%',
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      subtitle: 'En todos los tenants',
      icon: Users,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Total Consentimientos',
      value: stats.totalConsents,
      subtitle: 'Generados',
      icon: FileText,
      color: 'bg-purple-500',
      trend: '+15%',
    },
    {
      title: 'Tenants con Alertas',
      value: stats.tenantsNearLimit + stats.tenantsAtLimit,
      subtitle: `${stats.tenantsAtLimit} en límite`,
      icon: AlertTriangle,
      color: 'bg-orange-500',
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
            Vista global del sistema multi-tenant
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

          {/* Charts Row */}
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

          {/* Top Performers */}
          <TopPerformersSection topTenants={stats.topTenants} />
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
                  <p className="text-blue-100 text-sm">Crecimiento Mensual</p>
                  <p className="text-3xl font-bold mt-2">+12%</p>
                  <p className="text-blue-100 text-xs mt-1">Promedio últimos 6 meses</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tasa de Retención</p>
                  <p className="text-3xl font-bold mt-2">94%</p>
                  <p className="text-green-100 text-xs mt-1">Tenants activos</p>
                </div>
                <CheckCircle className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Adopción Promedio</p>
                  <p className="text-3xl font-bold mt-2">87%</p>
                  <p className="text-purple-100 text-xs mt-1">Uso de recursos</p>
                </div>
                <Activity className="w-12 h-12 opacity-50" />
              </div>
            </div>
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
                    { name: 'Suspendidos', value: stats.suspendedTenants },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Usage */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uso de Recursos por Tenant
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
        </div>
      )}

      {/* Tenants Table */}
      <TenantTableSection />
    </div>
  );
}
