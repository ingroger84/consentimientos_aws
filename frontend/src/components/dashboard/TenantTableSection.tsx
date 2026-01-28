import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { tenantsService } from '@/services/tenants';
import { useToast } from '@/hooks/useToast';
import { getPlanName } from '@/utils/plan-names';
import { TenantPlan } from '@/types/tenant';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  maxUsers: number;
  maxBranches: number;
  maxConsents: number;
  maxServices?: number;
  maxMedicalRecords?: number;
  maxMRConsentTemplates?: number;
  maxConsentTemplates?: number;
  users?: any[];
  branches?: any[];
  consents?: any[];
  services?: any[];
  clients?: any[];
  medicalRecords?: any[];
  medicalRecordConsentsCount?: number;
  createdAt: string;
}

export default function TenantTableSection() {
  const toast = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [filterType, setFilterType] = useState<'all' | 'at-limit' | 'near-limit' | 'suspended' | 'tenant-id'>('all');
  const [filterTenantId, setFilterTenantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadTenants();
  }, []);

  // Escuchar eventos de filtrado desde las alertas y top performers
  useEffect(() => {
    const handleFilterEvent = (event: any) => {
      const detail = event.detail;
      
      if (typeof detail === 'string') {
        // Evento desde alertas (string simple)
        setFilterType(detail as any);
        setFilterTenantId(null);
        setCurrentPage(1);
      } else if (detail && detail.type === 'tenant-id') {
        // Evento desde top performers (objeto con type y value)
        setFilterType('tenant-id');
        setFilterTenantId(detail.value);
        setCurrentPage(1);
      }
    };

    window.addEventListener('filterTenants', handleFilterEvent);
    return () => window.removeEventListener('filterTenants', handleFilterEvent);
  }, []);

  const loadTenants = async () => {
    try {
      const data = await tenantsService.getAll();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    
    // Aplicar filtro especial desde alertas o top performers
    let matchesSpecialFilter = true;
    if (filterType === 'tenant-id' && filterTenantId) {
      matchesSpecialFilter = tenant.id === filterTenantId;
    } else if (filterType === 'at-limit') {
      const userCount = tenant.users?.filter((u: any) => !u.deletedAt).length || 0;
      const branchCount = tenant.branches?.filter((b: any) => !b.deletedAt).length || 0;
      const consentCount = tenant.consents?.filter((c: any) => !c.deletedAt).length || 0;
      const userPercentage = (userCount / tenant.maxUsers) * 100;
      const branchPercentage = (branchCount / tenant.maxBranches) * 100;
      const consentPercentage = (consentCount / tenant.maxConsents) * 100;
      matchesSpecialFilter = userPercentage >= 100 || branchPercentage >= 100 || consentPercentage >= 100;
    } else if (filterType === 'near-limit') {
      const userCount = tenant.users?.filter((u: any) => !u.deletedAt).length || 0;
      const branchCount = tenant.branches?.filter((b: any) => !b.deletedAt).length || 0;
      const consentCount = tenant.consents?.filter((c: any) => !c.deletedAt).length || 0;
      const userPercentage = (userCount / tenant.maxUsers) * 100;
      const branchPercentage = (branchCount / tenant.maxBranches) * 100;
      const consentPercentage = (consentCount / tenant.maxConsents) * 100;
      matchesSpecialFilter = (userPercentage >= 80 && userPercentage < 100) || 
                            (branchPercentage >= 80 && branchPercentage < 100) || 
                            (consentPercentage >= 80 && consentPercentage < 100);
    } else if (filterType === 'suspended') {
      matchesSpecialFilter = tenant.status === 'suspended';
    }
    
    return matchesSearch && matchesStatus && matchesSpecialFilter;
  });

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

  const getResourcePercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTenant) return;

    try {
      await tenantsService.update(editingTenant.id, {
        name: editingTenant.name,
        maxUsers: editingTenant.maxUsers,
        maxBranches: editingTenant.maxBranches,
        maxConsents: editingTenant.maxConsents,
        maxMedicalRecords: editingTenant.maxMedicalRecords,
        maxMRConsentTemplates: editingTenant.maxMRConsentTemplates,
        maxConsentTemplates: editingTenant.maxConsentTemplates,
        plan: editingTenant.plan as any, // Cast para evitar error de tipo
      });
      
      // Recargar tenants
      await loadTenants();
      setIsEditModalOpen(false);
      setEditingTenant(null);
      toast.success('Tenant actualizado', 'El tenant fue actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar tenant:', error);
      toast.error('Error al actualizar tenant', error.response?.data?.message || 'Error al actualizar el tenant');
    }
  };

  const clearFilter = () => {
    setFilterType('all');
    setFilterTenantId(null);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-600">Cargando tenants...</div>
      </div>
    );
  }

  return (
    <div id="tenants-table" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Todos los Tenants
        </h2>
        <div className="flex items-center gap-3">
          {(filterType !== 'all' || filterTenantId) && (
            <button
              onClick={clearFilter}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar filtro
            </button>
          )}
          <span className="text-sm text-gray-500">
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso de Recursos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTenants.map((tenant) => {
                const userCount = tenant.users?.filter((u: any) => !u.deletedAt).length || 0;
                const branchCount = tenant.branches?.filter((b: any) => !b.deletedAt).length || 0;
                const consentCount = tenant.consents?.filter((c: any) => !c.deletedAt).length || 0;
                const serviceCount = tenant.services?.filter((s: any) => !s.deletedAt).length || 0;
                const medicalRecordsCount = tenant.medicalRecords?.length || 0;
                const mrConsentsCount = tenant.medicalRecordConsentsCount || 0;

                const userPercentage = getResourcePercentage(userCount, tenant.maxUsers);
                const branchPercentage = getResourcePercentage(branchCount, tenant.maxBranches);
                const consentPercentage = getResourcePercentage(consentCount, tenant.maxConsents);
                const servicePercentage = getResourcePercentage(serviceCount, tenant.maxServices || 999999);
                const medicalRecordsPercentage = getResourcePercentage(medicalRecordsCount, tenant.maxMedicalRecords || 999999);

                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 uppercase">
                        {getPlanName(tenant.plan as TenantPlan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 min-w-[280px]">
                        {/* Usuarios */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">👥 Users</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                userPercentage >= 100 ? 'bg-red-500' :
                                userPercentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(userPercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${
                            userPercentage >= 100 ? 'text-red-600' :
                            userPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {userCount}/{tenant.maxUsers}
                          </span>
                          <span className={`text-xs font-medium w-10 text-right ${
                            userPercentage >= 100 ? 'text-red-600' :
                            userPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {Math.round(userPercentage)}%
                          </span>
                        </div>

                        {/* Sedes */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">🏢 Sedes</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                branchPercentage >= 100 ? 'bg-red-500' :
                                branchPercentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(branchPercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${
                            branchPercentage >= 100 ? 'text-red-600' :
                            branchPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {branchCount}/{tenant.maxBranches}
                          </span>
                          <span className={`text-xs font-medium w-10 text-right ${
                            branchPercentage >= 100 ? 'text-red-600' :
                            branchPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {Math.round(branchPercentage)}%
                          </span>
                        </div>

                        {/* Servicios */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">⚕️ Servs</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                servicePercentage >= 100 ? 'bg-red-500' :
                                servicePercentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(servicePercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${
                            servicePercentage >= 100 ? 'text-red-600' :
                            servicePercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {serviceCount}/{tenant.maxServices || 0}
                          </span>
                          <span className={`text-xs font-medium w-10 text-right ${
                            servicePercentage >= 100 ? 'text-red-600' :
                            servicePercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {Math.round(servicePercentage)}%
                          </span>
                        </div>

                        {/* Consentimientos */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">📄 CN</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                consentPercentage >= 100 ? 'bg-red-500' :
                                consentPercentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(consentPercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${
                            consentPercentage >= 100 ? 'text-red-600' :
                            consentPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {consentCount}/{tenant.maxConsents}
                          </span>
                          <span className={`text-xs font-medium w-10 text-right ${
                            consentPercentage >= 100 ? 'text-red-600' :
                            consentPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {Math.round(consentPercentage)}%
                          </span>
                        </div>

                        {/* Historias Clínicas */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">🏥 HC</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                medicalRecordsPercentage >= 100 ? 'bg-red-500' :
                                medicalRecordsPercentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(medicalRecordsPercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${
                            medicalRecordsPercentage >= 100 ? 'text-red-600' :
                            medicalRecordsPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {medicalRecordsCount}/{tenant.maxMedicalRecords || 0}
                          </span>
                          <span className={`text-xs font-medium w-10 text-right ${
                            medicalRecordsPercentage >= 100 ? 'text-red-600' :
                            medicalRecordsPercentage >= 80 ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {Math.round(medicalRecordsPercentage)}%
                          </span>
                        </div>

                        {/* Consentimientos HC */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-xs text-gray-600">📋 CN-HC</span>
                          </div>
                          <div className="flex-1"></div>
                          <span className="text-xs font-semibold w-14 text-right text-gray-900">
                            {mrConsentsCount}
                          </span>
                          <span className="text-xs font-medium w-10 text-right text-gray-500">
                            -
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTenants.length)} de {filteredTenants.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Editar Tenant */}
      {isEditModalOpen && editingTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Editar Tenant</h2>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingTenant(null); }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={editingTenant.plan}
                  onChange={(e) => setEditingTenant({ ...editingTenant, plan: e.target.value })}
                  className="input w-full"
                >
                  <option value="free">{getPlanName(TenantPlan.FREE)}</option>
                  <option value="basic">{getPlanName(TenantPlan.BASIC)}</option>
                  <option value="professional">{getPlanName(TenantPlan.PROFESSIONAL)}</option>
                  <option value="enterprise">{getPlanName(TenantPlan.ENTERPRISE)}</option>
                  <option value="custom">{getPlanName(TenantPlan.CUSTOM)}</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Usuarios
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTenant.maxUsers}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxUsers: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Sedes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTenant.maxBranches}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxBranches: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Consentimientos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTenant.maxConsents}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxConsents: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Historias Clínicas
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={editingTenant.maxMedicalRecords || 0}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxMedicalRecords: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">-1 = ilimitadas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Plantillas HC
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={editingTenant.maxMRConsentTemplates || 0}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxMRConsentTemplates: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">-1 = ilimitadas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Plantillas CN
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={editingTenant.maxConsentTemplates || 0}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxConsentTemplates: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">-1 = ilimitadas</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingTenant(null); }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 btn btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
