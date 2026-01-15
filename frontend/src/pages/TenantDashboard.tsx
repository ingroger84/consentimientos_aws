import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Building2, Briefcase, HelpCircle, TrendingUp } from 'lucide-react';
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
import api from '../services/api';

interface Statistics {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byService: Array<{ name: string; count: number }>;
  byBranch: Array<{ name: string; count: number }>;
  byDate: Array<{ date: string; count: number }>;
  recent: Array<{
    id: string;
    clientName: string;
    service: string;
    branch: string;
    status: string;
    createdAt: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SIGNED: 'Firmado',
  SENT: 'Enviado',
  FAILED: 'Fallido',
};

export default function TenantDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await api.get('/consents/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Consentimientos',
      description: 'Gestiona los consentimientos digitales',
      icon: FileText,
      href: '/consents',
      color: 'bg-blue-500',
    },
    {
      title: 'Usuarios',
      description: 'Administra usuarios del sistema',
      icon: Users,
      href: '/users',
      color: 'bg-green-500',
    },
    {
      title: 'Sedes',
      description: 'Gestiona las sedes o sucursales',
      icon: Building2,
      href: '/branches',
      color: 'bg-purple-500',
    },
    {
      title: 'Servicios',
      description: 'Administra los servicios disponibles',
      icon: Briefcase,
      href: '/services',
      color: 'bg-orange-500',
    },
    {
      title: 'Preguntas',
      description: 'Configura preguntas de restricciones',
      icon: HelpCircle,
      href: '/questions',
      color: 'bg-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al sistema de gestión de consentimientos digitales
        </p>
      </div>

      {/* Estadística Total */}
      {stats && (
        <div className="mb-8">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Consentimientos</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <TrendingUp className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Consentimientos por Fecha */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos por Fecha (Últimos 30 días)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Consentimientos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Consentimientos por Tipo (Servicio) */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos por Tipo de Servicio
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.byService.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Consentimientos por Sede */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos por Sede
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Consentimientos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Consentimientos por Estado */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos por Estado
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="status"
                  tickFormatter={(value) => STATUS_LABELS[value] || value}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => STATUS_LABELS[value] || value}
                />
                <Legend />
                <Bar dataKey="count" fill="#F59E0B" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Consentimientos Recientes */}
      {stats && stats.recent.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Consentimientos Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent.map((consent) => (
                  <tr key={consent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {consent.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consent.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consent.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          consent.status === 'SENT'
                            ? 'bg-green-100 text-green-800'
                            : consent.status === 'SIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : consent.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[consent.status] || consent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(consent.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className="card hover:shadow-xl transition-shadow"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
