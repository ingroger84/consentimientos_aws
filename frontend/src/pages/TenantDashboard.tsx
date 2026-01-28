import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Building2, 
  Briefcase,
  FileHeart,
  UserPlus,
  FileCheck,
  Activity
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
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface ConsentStatistics {
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

interface MedicalRecordStatistics {
  total: number;
  active: number;
  closed: number;
  byDate: Array<{ date: string; count: number }>;
  byBranch: Array<{ name: string; count: number }>;
  totalConsents: number;
  recent: Array<{
    id: string;
    recordNumber: string;
    clientName: string;
    branch: string;
    status: string;
    createdAt: string;
  }>;
}

interface ClientStatistics {
  total: number;
  newThisMonth: number;
  newThisWeek: number;
  recent: Array<{
    id: string;
    fullName: string;
    documentNumber: string;
    email: string;
    createdAt: string;
  }>;
}

interface TemplateStatistics {
  total: number;
  active: number;
  byCategory: Array<{ category: string; count: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SIGNED: 'Firmado',
  SENT: 'Enviado',
  FAILED: 'Fallido',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
};

export default function TenantDashboard() {
  const [consentStats, setConsentStats] = useState<ConsentStatistics | null>(null);
  const [medicalRecordStats, setMedicalRecordStats] = useState<MedicalRecordStatistics | null>(null);
  const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
  const [cnTemplateStats, setCnTemplateStats] = useState<TemplateStatistics | null>(null);
  const [hcTemplateStats, setHcTemplateStats] = useState<TemplateStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Verificar si el usuario es operador
  const isOperator = user?.role?.type === 'OPERADOR';

  useEffect(() => {
    loadAllStatistics();
  }, []);

  const loadAllStatistics = async () => {
    try {
      // Cargar todas las estadísticas en paralelo
      const [consents, medicalRecords, clients, cnTemplates, hcTemplates] = await Promise.allSettled([
        api.get('/consents/stats/overview'),
        api.get('/medical-records/stats/overview'),
        api.get('/clients/stats'),
        api.get('/consent-templates/stats/overview'),
        api.get('/medical-record-consent-templates/stats/overview'),
      ]);

      if (consents.status === 'fulfilled') {
        setConsentStats(consents.value.data);
      }
      if (medicalRecords.status === 'fulfilled') {
        setMedicalRecordStats(medicalRecords.value.data);
      }
      if (clients.status === 'fulfilled') {
        setClientStats(clients.value.data);
      }
      if (cnTemplates.status === 'fulfilled') {
        setCnTemplateStats(cnTemplates.value.data);
      }
      if (hcTemplates.status === 'fulfilled') {
        setHcTemplateStats(hcTemplates.value.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      title: 'Historias Clínicas',
      description: 'Gestiona historias clínicas',
      icon: FileHeart,
      href: '/medical-records',
      color: 'bg-blue-500',
      show: true,
    },
    {
      title: 'Clientes',
      description: 'Administra clientes',
      icon: UserPlus,
      href: '/clients',
      color: 'bg-green-500',
      show: true,
    },
    {
      title: 'Consentimientos',
      description: 'Gestiona consentimientos digitales',
      icon: FileText,
      href: '/consents',
      color: 'bg-purple-500',
      show: true,
    },
    {
      title: 'Usuarios',
      description: 'Administra usuarios del sistema',
      icon: Users,
      href: '/users',
      color: 'bg-orange-500',
      show: true,
    },
    {
      title: 'Sedes',
      description: 'Gestiona las sedes o sucursales',
      icon: Building2,
      href: '/branches',
      color: 'bg-pink-500',
      show: true,
    },
    {
      title: 'Servicios',
      description: 'Administra los servicios disponibles',
      icon: Briefcase,
      href: '/services',
      color: 'bg-indigo-500',
      show: true,
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
      {/* Header con bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido {user?.name || user?.email}, aquí está el resumen de tu sistema
        </p>
      </div>

      {/* Para OPERADORES: Mostrar Accesos Rápidos primero */}
      {isOperator && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessCards.filter(card => card.show).map((card) => (
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
      )}

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Consentimientos Convencionales */}
        {consentStats && (
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Consentimientos CN</p>
                <p className="text-3xl font-bold mt-2">{consentStats.total}</p>
                <p className="text-blue-100 text-xs mt-1">Total generados</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Historias Clínicas */}
        {medicalRecordStats && (
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Historias Clínicas</p>
                <p className="text-3xl font-bold mt-2">{medicalRecordStats.total}</p>
                <p className="text-green-100 text-xs mt-1">
                  {medicalRecordStats.active} activas, {medicalRecordStats.closed} cerradas
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileHeart className="w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Clientes */}
        {clientStats && (
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Clientes</p>
                <p className="text-3xl font-bold mt-2">{clientStats.total}</p>
                <p className="text-purple-100 text-xs mt-1">
                  +{clientStats.newThisWeek} esta semana
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Consentimientos desde HC */}
        {medicalRecordStats && (
          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Consentimientos HC</p>
                <p className="text-3xl font-bold mt-2">{medicalRecordStats.totalConsents}</p>
                <p className="text-orange-100 text-xs mt-1">Generados desde HC</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileCheck className="w-8 h-8" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tarjetas de Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Plantillas CN */}
        {cnTemplateStats && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Plantillas de Consentimientos
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{cnTemplateStats.total}</p>
                <p className="text-sm text-gray-600">Total disponibles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{cnTemplateStats.active}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </div>
        )}

        {/* Plantillas HC */}
        {hcTemplateStats && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Plantillas de HC
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{hcTemplateStats.total}</p>
                <p className="text-sm text-gray-600">Total disponibles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{hcTemplateStats.active}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráficos de Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Consentimientos por Fecha */}
        {consentStats && consentStats.byDate.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos CN por Fecha (Últimos 30 días)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consentStats.byDate}>
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
        )}

        {/* Historias Clínicas por Fecha */}
        {medicalRecordStats && medicalRecordStats.byDate.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historias Clínicas por Fecha (Últimos 30 días)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={medicalRecordStats.byDate}>
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
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Historias Clínicas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Consentimientos por Estado */}
        {consentStats && consentStats.byStatus.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos CN por Estado
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consentStats.byStatus}>
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
        )}

        {/* Consentimientos por Servicio */}
        {consentStats && consentStats.byService.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos CN por Servicio
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consentStats.byService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {consentStats.byService.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Consentimientos por Sede */}
        {consentStats && consentStats.byBranch.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos CN por Sede
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consentStats.byBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Consentimientos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historias Clínicas por Sede */}
        {medicalRecordStats && medicalRecordStats.byBranch.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historias Clínicas por Sede
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medicalRecordStats.byBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Historias Clínicas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tablas de Datos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Consentimientos Recientes */}
        {consentStats && consentStats.recent.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consentimientos CN Recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consentStats.recent.map((consent) => (
                    <tr key={consent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {consent.clientName}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(consent.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Historias Clínicas Recientes */}
        {medicalRecordStats && medicalRecordStats.recent.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historias Clínicas Recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      N° HC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicalRecordStats.recent.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {record.recordNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {record.clientName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[record.status] || record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clientes Recientes */}
        {clientStats && clientStats.recent.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clientes Recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientStats.recent.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {client.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {client.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {client.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Accesos Rápidos - Solo para NO operadores (ya se mostraron arriba para operadores) */}
      {!isOperator && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessCards.filter(card => card.show).map((card) => (
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
      )}
    </div>
  );
}
