import { useEffect, useState } from 'react';
import { FileText, Building2, User, Calendar, ChevronRight, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface MedicalRecord {
  id: string;
  recordNumber: string;
  admissionDate: string;
  admissionType: string;
  status: string;
  clientName: string;
  clientDocument: string;
  branchName: string;
  tenantName: string;
  tenantSlug: string;
  createdAt: string;
  createdBy: string;
}

interface GroupedRecords {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  totalRecords: number;
  activeRecords: number;
  closedRecords: number;
  archivedRecords: number;
  records: MedicalRecord[];
}

export default function SuperAdminMedicalRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [groupedRecords, setGroupedRecords] = useState<GroupedRecords[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/all/grouped');
      setGroupedRecords(response.data);
    } catch (error) {
      console.error('Error loading medical records:', error);
      setGroupedRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTenant = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenants(newExpanded);
  };

  const filteredRecords = groupedRecords.filter(group => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return group.tenantName.toLowerCase().includes(search) ||
             group.tenantSlug.toLowerCase().includes(search);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      archived: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      active: 'Activa',
      closed: 'Cerrada',
      archived: 'Archivada',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getAdmissionTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      consulta: 'bg-blue-100 text-blue-800',
      urgencia: 'bg-red-100 text-red-800',
      hospitalización: 'bg-purple-100 text-purple-800',
    };
    const labels: Record<string, string> = {
      consulta: 'Consulta',
      urgencia: 'Urgencia',
      hospitalización: 'Hospitalización',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type] || styles.consulta}`}>
        {labels[type] || type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600">Cargando historias clínicas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historias Clínicas</h1>
          <p className="text-gray-600 mt-2">
            Vista global de todas las historias clínicas del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="closed">Cerradas</option>
              <option value="archived">Archivadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Historias</p>
              <p className="text-3xl font-bold mt-2">
                {groupedRecords.reduce((sum, g) => sum + g.totalRecords, 0)}
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Activas</p>
              <p className="text-3xl font-bold mt-2">
                {groupedRecords.reduce((sum, g) => sum + g.activeRecords, 0)}
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Cerradas</p>
              <p className="text-3xl font-bold mt-2">
                {groupedRecords.reduce((sum, g) => sum + g.closedRecords, 0)}
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Grouped Records */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay historias clínicas
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Aún no se han creado historias clínicas en el sistema'}
            </p>
          </div>
        ) : (
          filteredRecords.map((group) => (
            <div key={group.tenantId} className="card">
              {/* Tenant Header */}
              <button
                onClick={() => toggleTenant(group.tenantId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    transform transition-transform duration-200
                    ${expandedTenants.has(group.tenantId) ? 'rotate-90' : ''}
                  `}>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{group.tenantName}</h3>
                    <p className="text-sm text-gray-500">{group.tenantSlug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{group.totalRecords}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{group.activeRecords}</p>
                    <p className="text-xs text-gray-500">Activas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-600">{group.closedRecords}</p>
                    <p className="text-xs text-gray-500">Cerradas</p>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedTenants.has(group.tenantId) && (
                <div className="border-t mt-4 pt-4">
                  {group.records.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay historias clínicas para mostrar
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.records.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/${group.tenantSlug}/medical-records/${record.id}`)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{record.recordNumber}</p>
                                {getStatusBadge(record.status)}
                                {getAdmissionTypeBadge(record.admissionType)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {record.clientName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {record.branchName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(record.admissionDate).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
